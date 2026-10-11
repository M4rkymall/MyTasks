
pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
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
                    DB_USER=ci_user \
                    DB_PASSWORD=ci_test_password \
                    HTTP_PORT=8080 \
                    docker compose config --quiet
                '''
            }
        }

        stage('Backend Tests') {
            steps {
                sh 'docker build --target test -t taskmgr/backend:test ./backend'
                sh 'docker run --rm taskmgr/backend:test npm test'
            }
        }

        stage('PostgreSQL Integration Tests') {
            steps {
                sh '''
                    docker network create mytasks-ci-network || true

                    docker rm -f mytasks-ci-postgres 2>/dev/null || true

                    docker run -d \
                        --name mytasks-ci-postgres \
                        --network mytasks-ci-network \
                        -e POSTGRES_DB=tasks_test \
                        -e POSTGRES_USER=ci_user \
                        -e POSTGRES_PASSWORD=ci_test_password \
                        postgres:16-alpine

                    for i in $(seq 1 30); do
                        if docker exec mytasks-ci-postgres \
                            pg_isready -U ci_user -d tasks_test; then
                            break
                        fi
                        sleep 2
                    done

                    docker run --rm \
                        --network mytasks-ci-network \
                        -e TEST_DATABASE_URL=postgresql://ci_user:ci_test_password@mytasks-ci-postgres:5432/tasks_test \
                        taskmgr/backend:test \
                        npx jest --runInBand --runTestsByPath tests/postgres.test.js
                '''
            }
            post {
                always {
                    sh '''
                        docker rm -f mytasks-ci-postgres 2>/dev/null || true
                        docker network rm mytasks-ci-network 2>/dev/null || true
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'MyTasks CI pipeline completed successfully.'
        }
        failure {
            echo 'MyTasks pipeline failed. Check the stage logs.'
        }
        always {
            echo 'MyTasks pipeline finished.'
        }
    }
}
