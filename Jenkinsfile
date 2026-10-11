
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
                bat 'docker compose config --quiet'
            }
        }

        stage('Backend Tests') {
            steps {
                bat 'docker build --target test -t taskmgr/backend:test ./backend'
                bat 'docker run --rm taskmgr/backend:test npm test'
            }
        }
    }

    post {
        success {
            echo 'MyTasks CI pipeline completed successfully.'
        }
        failure {
            echo 'MyTasks CI pipeline failed. Check the stage logs.'
        }
        always {
            echo 'MyTasks pipeline finished.'
        }
    }
}
