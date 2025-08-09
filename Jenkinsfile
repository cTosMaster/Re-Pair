pipeline {
  agent any
  options { timestamps(); disableConcurrentBuilds(); skipDefaultCheckout(true) }

  environment {
    REGISTRY_REPO   = 'ctosmaster'
    FRONTEND_IMAGE  = "${REGISTRY_REPO}/repair-frontend"
    BACKEND_IMAGE   = "${REGISTRY_REPO}/repair-backend"
    FRONT_DIR       = 'frontend'
    BACK_DIR        = 'backend'
    SSH_BACKEND_USER= 'jaybee'
    SSH_BACKEND_HOST= '192.168.45.211'
  }

  stages {
    stage('조건 체크 & Checkout') {
      when { expression { env.CHANGE_TARGET == 'main' || env.BRANCH_NAME == 'main' } }
      steps {
        checkout scm
        script {
          env.SHORT_SHA = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
          env.TAG = env.SHORT_SHA
        }
        echo "✅ main 기준 진행 (TAG=${env.TAG})"
      }
    }

    stage('buildx 준비 (ARM64)') {
      when { expression { env.CHANGE_TARGET == 'main' || env.BRANCH_NAME == 'main' } }
      steps {
        sh '''
          docker run --privileged --rm tonistiigi/binfmt --install all || true
          docker buildx create --use --name multi || docker buildx use multi
          docker buildx inspect --bootstrap
        '''
      }
    }

    stage('DockerHub 로그인') {
      when { expression { env.CHANGE_TARGET == 'main' || env.BRANCH_NAME == 'main' } }
      steps {
        withCredentials([usernamePassword(credentialsId: 'docker-user', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
        }
      }
    }

    stage('Frontend Build & Push') {
      when { expression { (env.CHANGE_TARGET == 'main' || env.BRANCH_NAME == 'main') && fileExists(FRONT_DIR) } }
      steps {
        dir(FRONT_DIR) {
          sh """
            docker buildx build --platform linux/arm64/v8 \
              -t ${FRONTEND_IMAGE}:${TAG} -t ${FRONTEND_IMAGE}:latest \
              -f Dockerfile . --push
          """
        }
      }
    }

    stage('Backend Build & Push') {
      when { expression { (env.CHANGE_TARGET == 'main' || env.BRANCH_NAME == 'main') && fileExists(BACK_DIR) } }
      steps {
        dir(BACK_DIR) {
          sh """
            ./mvnw -q -DskipTests clean package
            docker buildx build --platform linux/arm64/v8 \
              -t ${BACKEND_IMAGE}:${TAG} -t ${BACKEND_IMAGE}:latest \
              -f Dockerfile . --push
          """
        }
      }
    }

    stage('K3s 배포 (kubectl set image)') {
      when { expression { (env.CHANGE_TARGET == 'main' || env.BRANCH_NAME == 'main') && fileExists(BACK_DIR) } }
      steps {
        // 호스트에 kubectl 컨텍스트가 세팅되어 있다는 가정으로 SSH 사용 유지
        sh """
          ssh -o StrictHostKeyChecking=no ${SSH_BACKEND_USER}@${SSH_BACKEND_HOST} '\
            kubectl -n repair-ns set image deploy/repair-backend \
              repair-backend=${BACKEND_IMAGE}:${TAG} && \
            kubectl -n repair-ns rollout status deploy/repair-backend \
          '
        """
      }
    }
  }

  post {
    always { sh 'docker logout || true' }
    success { echo '✅ 배포 성공' }
    failure { echo '❌ 실패: 콘솔 로그 확인' }
  }
}
