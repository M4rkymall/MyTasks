
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
                        '''
                    }
                }
            }
        }

        stage('Deploy') {
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
                                up -d --no-build --wait \
                                --wait-timeout 120
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
    }

    post {
        success {
            echo 'MyTasks CI/CD pipeline completed successfully.'
        }

        failure {
            echo 'Pipeline failed. Check the failed stage and Jenkins console output.'
            echo 'Automatic rollback is not enabled in this version.'
        }

        always {
            echo 'MyTasks pipeline finished.'
        }
    }
}
