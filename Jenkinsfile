pipeline {
  agent any
  options { timestamps(); disableConcurrentBuilds(); skipDefaultCheckout(true) }

  environment {
    REGISTRY_REPO    = 'ctosmaster'
    FRONTEND_IMAGE   = "${REGISTRY_REPO}/repair-frontend"
    BACKEND_IMAGE    = "${REGISTRY_REPO}/repair-backend"
    FRONT_DIR        = 'frontend'
    BACK_DIR         = 'backend'
    SSH_BACKEND_USER = 'jaybee'
    SSH_BACKEND_HOST = '192.168.45.211'
  }

  stages {
    stage('조건 체크 & Checkout') {
      when { expression { env.CHANGE_TARGET == 'main' || env.BRANCH_NAME == 'main' || env.CHANGE_TARGET == 'develop' || env.BRANCH_NAME == 'develop' } }
      steps {
        checkout scm
        sh 'git rev-parse --short HEAD > .git/short_sha'
        script {
          env.SHORT_SHA = readFile('.git/short_sha').trim()
          env.TAG = env.SHORT_SHA
        }
        echo "✅ main 기준 진행 (TAG=${env.TAG})"
      }
    }

    stage('buildx 준비 (ARM64)') {
      when { expression { env.CHANGE_TARGET == 'main' || env.BRANCH_NAME == 'main' || env.CHANGE_TARGET == 'develop' || env.BRANCH_NAME == 'develop' } }
      steps {
        sh '''
          docker run --privileged --rm tonistiigi/binfmt --install all || true
          docker buildx inspect multi >/dev/null 2>&1 || docker buildx create --name multi --use
          docker buildx use multi
          docker buildx inspect --bootstrap
        '''
      }
    }

    stage('DockerHub 로그인') {
      when { expression { env.CHANGE_TARGET == 'main' || env.BRANCH_NAME == 'main' || env.CHANGE_TARGET == 'develop' || env.BRANCH_NAME == 'develop' } }
      steps {
        withCredentials([usernamePassword(credentialsId: 'docker-user', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
        }
      }
    }

    // 프론트: 디렉토리와 Dockerfile이 있을 때만 빌드/푸시
    stage('Frontend Build & Push') {
      when {
        expression {
          (env.CHANGE_TARGET == 'main' || env.BRANCH_NAME == 'main' || env.CHANGE_TARGET == 'develop' || env.BRANCH_NAME == 'develop') &&
          fileExists("${env.FRONT_DIR}") &&
          fileExists("${env.FRONT_DIR}/Dockerfile")
        }
      }
      steps {
        dir(env.FRONT_DIR) {
          sh '''
            docker buildx build --platform linux/arm64 \
              -t "$FRONTEND_IMAGE:$TAG" -t "$FRONTEND_IMAGE:latest" \
              -f Dockerfile . --push
          '''
        }
      }
    }

    // 백엔드: 디렉토리와 Dockerfile이 있을 때만 빌드/푸시
stage('Backend Build & Push') {
  when {
    expression {
      (env.CHANGE_TARGET == 'main' || env.BRANCH_NAME == 'main' || env.CHANGE_TARGET == 'develop' || env.BRANCH_NAME == 'develop') &&
      fileExists("${env.BACK_DIR}") &&
      fileExists("${env.BACK_DIR}/Dockerfile")
    }
  }
  steps {
    dir(env.BACK_DIR) {
      sh '''
        set -e
        UID=$(id -u)
        GID=$(id -g)

        # 워크스페이스 로컬 캐시 사용 (권한 안전)
        mkdir -p .m2

        docker run --rm -u $UID:$GID \
          -e HOME=/var/maven \
          -e MAVEN_CONFIG=/var/maven/.m2 \
          -v "$PWD":/workspace \
          -v "$PWD/.m2":/var/maven/.m2 \
          -w /workspace \
          maven:3.9.10-eclipse-temurin-21 \
          mvn -q -DskipTests clean package

        docker buildx build --platform linux/arm64 \
          -t "$BACKEND_IMAGE:$TAG" -t "$BACKEND_IMAGE:latest" \
          -f Dockerfile . --push
      '''
    }
  }
}
    // 배포: 백엔드 컨테이너를 실제로 빌드한 경우에만 롤아웃
    stage('K3s 배포 (kubectl set image)') {
      when {
        expression {
          (env.CHANGE_TARGET == 'main' || env.BRANCH_NAME == 'main' || env.CHANGE_TARGET == 'develop' || env.BRANCH_NAME == 'develop') &&
          fileExists("${env.BACK_DIR}") &&
          fileExists("${env.BACK_DIR}/Dockerfile")
        }
      }
      steps {
        sh '''
          ssh -o StrictHostKeyChecking=no "$SSH_BACKEND_USER@$SSH_BACKEND_HOST" \
            "kubectl -n repair-ns set image deploy/repair-backend repair-backend=$BACKEND_IMAGE:$TAG && \
             kubectl -n repair-ns rollout status deploy/repair-backend"
        '''
      }
    }
  }

  post {
    always  { sh 'docker logout || true' }
    success {
      script {
        if (env.CHANGE_TARGET == 'main' || env.BRANCH_NAME == 'main' || env.CHANGE_TARGET == 'develop' || env.BRANCH_NAME == 'develop') {
          echo '✅ 배포 성공'
        } else {
          echo '⏭️ main/develop 아님: 빌드/배포 스킵'
        }
      }
    }
    failure { echo '❌ 실패: 콘솔 로그 확인' }
  }
}
