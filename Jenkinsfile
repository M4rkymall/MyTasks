
pipeline {
    agent any

    triggers {
        pollSCM('H/2 * * * *')
    }

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        COMPOSE_PROJECT_NAME = 'taskmanagement-integrated'
        LAST_GOOD_FILE = '/var/jenkins_home/mytasks-last-good-tag'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Validate Docker Compose') {
            steps {
                sh '''
                    set -eu

                    DB_USER=ci_user \
                    DB_PASSWORD=ci_test_password \
                    HTTP_PORT=8080 \
                    docker compose config --quiet

                    echo "Compose validation passed."
                '''
            }
        }

        stage('Backend Tests') {
            steps {
                sh '''
                    set -eu

                    docker build \
                        --target test \
                        -t taskmgr/backend:test \
                        ./backend

                    docker run --rm \
                        taskmgr/backend:test \
                        npm test
                '''
            }
        }

        stage('PostgreSQL Integration Tests') {
            steps {
                sh '''
                    set -eu

                    NETWORK="mytasks-ci-${BUILD_NUMBER}"
                    CONTAINER="mytasks-ci-postgres-${BUILD_NUMBER}"

                    cleanup() {
                        docker rm -f "$CONTAINER" 2>/dev/null || true
                        docker network rm "$NETWORK" 2>/dev/null || true
                    }

                    trap cleanup EXIT

                    docker network create "$NETWORK"

                    docker run -d \
                        --name "$CONTAINER" \
                        --network "$NETWORK" \
                        -e POSTGRES_DB=tasks_test \
                        -e POSTGRES_USER=ci_user \
                        -e POSTGRES_PASSWORD=ci_test_password \
                        postgres:16-alpine

                    ready=0

                    for i in $(seq 1 30); do
                        if docker exec "$CONTAINER" \
                            pg_isready -U ci_user -d tasks_test; then
                            ready=1
                            break
                        fi
                        sleep 2
                    done

                    if [ "$ready" -ne 1 ]; then
                        echo "Test PostgreSQL did not become ready."
                        exit 1
                    fi

                    docker run --rm \
                        --network "$NETWORK" \
                        -e TEST_DATABASE_URL="postgresql://ci_user:ci_test_password@${CONTAINER}:5432/tasks_test" \
                        taskmgr/backend:test \
                        npx jest --runInBand \
                        --runTestsByPath tests/postgres.test.js

                    echo "PostgreSQL integration tests passed."
                '''
            }
        }

        stage('Prepare Rollback') {
            steps {
                sh '''
                    set -eu

                    # Remove markers left by an earlier build.
                    rm -f deploy-started.txt previous-good-tag.txt

                    # Seed the first known-good version if needed.
                    if [ ! -f "$LAST_GOOD_FILE" ]; then
                        for service in backend frontend proxy worker; do
                            docker image inspect \
                                "taskmgr/${service}:build-8" \
                                >/dev/null
                        done

                        printf '%s\\n' "build-8" > "$LAST_GOOD_FILE"
                    fi

                    PREVIOUS_TAG=$(cat "$LAST_GOOD_FILE")

                    case "$PREVIOUS_TAG" in
                        build-[0-9]*)
                            ;;
                        *)
                            echo "Invalid known-good image tag."
                            exit 1
                            ;;
                    esac

                    for service in backend frontend proxy worker; do
                        docker image inspect \
                            "taskmgr/${service}:${PREVIOUS_TAG}" \
                            >/dev/null
                    done

                    printf '%s\\n' "$PREVIOUS_TAG" \
                        > previous-good-tag.txt

                    echo "Verified rollback target: $PREVIOUS_TAG"
                '''
            }
        }

        stage('Build Versioned Images') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'mytasks-db-credentials',
                        usernameVariable: 'DB_USER',
                        passwordVariable: 'DB_PASSWORD'
                    )
                ]) {
                    withEnv(["TAG=build-${env.BUILD_NUMBER}"]) {
                        sh '''
                            set -eu

                            docker compose \
                                -p "$COMPOSE_PROJECT_NAME" \
                                build

                            echo "Versioned image build completed."
                        '''
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    // Record that deployment is about to begin.
                    writeFile(
                        file: 'deploy-started.txt',
                        text: 'true'
                    )
                }

                withCredentials([
                    usernamePassword(
                        credentialsId: 'mytasks-db-credentials',
                        usernameVariable: 'DB_USER',
                        passwordVariable: 'DB_PASSWORD'
                    )
                ]) {
                    withEnv(["TAG=build-${env.BUILD_NUMBER}"]) {
                        sh '''
                            set -eu

                            docker compose \
                                -p "$COMPOSE_PROJECT_NAME" \
                                up -d --no-build --wait \
                                --wait-timeout 120

                            echo "Deployment completed."
                        '''
                    }
                }
            }
        }

        stage('Smoke Test') {
            steps {
                sh '''
                    set -eu

                    curl -fsS \
                        http://host.docker.internal:8080/health

                    curl -fsS \
                        http://host.docker.internal:8080/api/tasks \
                        -o /dev/null

                    echo "MyTasks smoke tests passed."
                '''
            }
        }

        stage('Mark Version as Known Good') {
            steps {
                sh '''
                    set -eu

                    printf '%s\\n' "build-${BUILD_NUMBER}" \
                        > "$LAST_GOOD_FILE"

                    echo "Known-good version updated to build-${BUILD_NUMBER}."
                '''
            }
        }
    }

    post {
        failure {
            script {
                if (fileExists('deploy-started.txt')) {
                    echo 'Deployment failed. Attempting rollback.'

                    if (!fileExists('previous-good-tag.txt')) {
                        error('Rollback target file is missing.')
                    }

                    def previousTag = readFile(
                        'previous-good-tag.txt'
                    ).trim()

                    withCredentials([
                        usernamePassword(
                            credentialsId: 'mytasks-db-credentials',
                            usernameVariable: 'DB_USER',
                            passwordVariable: 'DB_PASSWORD'
                        )
                    ]) {
                        withEnv(["TAG=${previousTag}"]) {
                            sh '''
                                set -eu

                                docker compose \
                                    -p "$COMPOSE_PROJECT_NAME" \
                                    up -d --no-build --wait \
                                    --wait-timeout 120

                                curl -fsS \
                                    http://host.docker.internal:8080/health

                                curl -fsS \
                                    http://host.docker.internal:8080/api/tasks \
                                    -o /dev/null

                                echo "Rollback completed and smoke tests passed."
                            '''
                        }
                    }
                } else {
                    echo 'Failure occurred before deployment. Existing services were not redeployed.'
                }
            }
        }

        success {
            echo 'MyTasks CI/CD pipeline completed successfully.'
        }

        always {
            echo 'MyTasks pipeline finished.'
        }
    }
}
