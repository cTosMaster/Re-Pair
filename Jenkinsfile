pipeline {
  agent any

  environment {
    REGISTRY = 'ctosmaster/repair'
    FRONT_DIR = 'frontend'
    BACK_DIR = 'backend'
    
    SSH_BACKEND_USER = 'jaybee'
    SSH_BACKEND_HOST = '192.168.45.211'
  }

  options {
    skipDefaultCheckout true
  }

  stages {
    stage('조건 체크 (PR → main일 경우만 진행)') {
      when {
        expression {
          return env.CHANGE_TARGET == 'main' || env.BRANCH_NAME == 'main'
        }
      }
      steps {
        checkout scm
        echo "✅ 조건 통과: main 브랜치로의 PR 또는 main 브랜치 빌드"
      }
    }

    stage('Frontend Build & Push') {
      when {
        expression {
          return env.CHANGE_TARGET == 'main' || env.BRANCH_NAME == 'main'
        }
      }
      steps {
        script {
          if (fileExists(FRONT_DIR)) {
            dir(FRONT_DIR) {
              withCredentials([usernamePassword(
                credentialsId: 'docker-user',
                usernameVariable: 'DOCKER_USER',
                passwordVariable: 'DOCKER_PASS'
              )]) {
                sh '''
                  echo "📦 Frontend Docker Build"
                  docker build -t $REGISTRY-frontend:latest .

                  echo "🔐 DockerHub 로그인"
                  echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

                  echo "📤 Docker 이미지 푸시"
                  docker push $REGISTRY-frontend:latest
                '''
              }
            }
          } else {
            echo ⚠️ Frontend 디렉토리가 없어서 스킵함"
          }
        }
      }
    }

    stage('Backend Build & Deploy') {
      when {
        expression {
          return env.CHANGE_TARGET == 'main' || env.BRANCH_NAME == 'main'
        }
      }
      steps {
        script {
          if (fileExists(BACK_DIR)) {
            dir(BACK_DIR) {
              withCredentials([usernamePassword(
                credentialsId: 'docker-user',
                usernameVariable: 'DOCKER_USER',
                passwordVariable: 'DOCKER_PASS'
              )]) {
                sh '''
                  echo "📦 Backend Maven 빌드"
                  ./mvnw clean package -DskipTests

                  echo "🐳 Docker Build"
                  docker build -t $REGISTRY-backend:latest .

                  echo "🔐 DockerHub 로그인"
                  echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

                  echo "📤 Docker 이미지 푸시"
                  docker push $REGISTRY-backend:latest

                  echo "🚀 K3S 롤링 업데이트"
                  ssh -o StrictHostKeyChecking=no $SSH_BACKEND_USER@$SSH_BACKEND_HOST "\
                    docker pull $REGISTRY-backend:latest && \
                    kubectl rollout restart deployment repair_backend -n repair-ns"
                '''
              }
            }
          } else {
            echo "⚠️ Backend 디렉토리가 없어서 스킵함"
          }
        }
      }
    }
  }

  post {
    success {
      echo '✅ 배포 성공!'
    }
    failure {
      echo '❌ 배포 실패...'
    }
  }
}