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

    // 🔧 배포 타깃(원하면 이름만 바꿔서 사용)
    REPAIR_NS_PROD         = 'repair-ns'
    REPAIR_NS_DEV          = 'repair-ns-dev'
    DEPLOY_BACKEND_PROD    = 'repair-backend'
    DEPLOY_BACKEND_DEV     = 'repair-backend-dev'
  }

  stages {
    stage('조건 체크 & Checkout') {
      // main / develop / (PR 타깃이 main|develop)에서 동작
      when { expression { ['main','develop'].contains(env.BRANCH_NAME) || ['main','develop'].contains(env.CHANGE_TARGET) } }
      steps {
        checkout scm
        sh 'git rev-parse --short HEAD > .git/short_sha'
        script {
          env.SHORT_SHA = readFile('.git/short_sha').trim()
          def isMain    = (env.BRANCH_NAME == 'main'    || env.CHANGE_TARGET == 'main')
          def isDevelop = (env.BRANCH_NAME == 'develop' || env.CHANGE_TARGET == 'develop')

          if (isMain) {
            env.TAG1 = env.SHORT_SHA         // 예: ae901b4
            env.TAG2 = 'latest'
            env.BRANCH_LABEL = 'main'
          } else if (isDevelop) {
            env.TAG1 = "dev-${env.SHORT_SHA}" // 예: dev-ae901b4
            env.TAG2 = 'dev-latest'
            env.BRANCH_LABEL = 'develop'
          } else {
            error('This pipeline is restricted to main/develop only.')
          }
          echo "✅ ${env.BRANCH_LABEL} 기준 진행 (TAGS=${env.TAG1}, ${env.TAG2})"
        }
      }
    }

    stage('buildx 준비 (ARM64)') {
      when { expression { ['main','develop'].contains(env.BRANCH_NAME) || ['main','develop'].contains(env.CHANGE_TARGET) } }
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
      when { expression { ['main','develop'].contains(env.BRANCH_NAME) || ['main','develop'].contains(env.CHANGE_TARGET) } }
      steps {
        withCredentials([usernamePassword(credentialsId: 'docker-user', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
        }
      }
    }

    // 프론트: 존재할 때만 빌드/푸시
    stage('Frontend Build & Push') {
      when {
        expression {
          (['main','develop'].contains(env.BRANCH_NAME) || ['main','develop'].contains(env.CHANGE_TARGET)) &&
          fileExists("${env.FRONT_DIR}") &&
          fileExists("${env.FRONT_DIR}/Dockerfile")
        }
      }
      steps {
        dir(env.FRONT_DIR) {
          sh '''
            docker buildx build --platform linux/arm64 \
              -t "$FRONTEND_IMAGE:$TAG1" -t "$FRONTEND_IMAGE:$TAG2" \
              -f Dockerfile . --push
          '''
        }
      }
    }

    // 백엔드: 존재할 때만 빌드/푸시
    stage('Backend Build & Push') {
      when {
        expression {
          (['main','develop'].contains(env.BRANCH_NAME) || ['main','develop'].contains(env.CHANGE_TARGET)) &&
          fileExists("${env.BACK_DIR}") &&
          fileExists("${env.BACK_DIR}/Dockerfile")
        }
      }
      steps {
        dir(env.BACK_DIR) {
          sh '''
            chmod +x mvnw || true
            ./mvnw -q -DskipTests clean package
            docker buildx build --platform linux/arm64 \
              -t "$BACKEND_IMAGE:$TAG1" -t "$BACKEND_IMAGE:$TAG2" \
              -f Dockerfile . --push
          '''
        }
      }
    }

    // 🔥 배포: main & develop 모두 배포 (브랜치별 대상 분기)
    stage('K3s 배포 (kubectl set image)') {
      when {
        expression {
          (['main','develop'].contains(env.BRANCH_NAME) || ['main','develop'].contains(env.CHANGE_TARGET)) &&
          fileExists("${env.BACK_DIR}") &&
          fileExists("${env.BACK_DIR}/Dockerfile")
        }
      }
      steps {
        script {
          def isMain    = (env.BRANCH_NAME == 'main'    || env.CHANGE_TARGET == 'main')
          def ns        = isMain ? env.REPAIR_NS_PROD      : env.REPAIR_NS_DEV
          def deploy    = isMain ? env.DEPLOY_BACKEND_PROD : env.DEPLOY_BACKEND_DEV
          env.DEPLOY_NS = ns
          env.DEPLOY    = deploy
        }
        sh '''
          ssh -o StrictHostKeyChecking=no "$SSH_BACKEND_USER@$SSH_BACKEND_HOST" \
            "kubectl -n $DEPLOY_NS set image deploy/$DEPLOY repair-backend=$BACKEND_IMAGE:$TAG1 && \
             kubectl -n $DEPLOY_NS rollout status deploy/$DEPLOY"
        '''
      }
    }
  }

  post {
    always  { sh 'docker logout || true' }
    success {
      script {
        if (env.BRANCH_LABEL == 'main') {
          echo "✅ main 배포 성공 (tags: ${env.TAG1}, ${env.TAG2}) → ns=${env.REPAIR_NS_PROD}, deploy=${env.DEPLOY_BACKEND_PROD}"
        } else if (env.BRANCH_LABEL == 'develop') {
          echo "✅ develop 배포 성공 (tags: ${env.TAG1}, ${env.TAG2}) → ns=${env.REPAIR_NS_DEV}, deploy=${env.DEPLOY_BACKEND_DEV}"
        } else {
          echo '⏭️ main/develop 아님: 스킵'
        }
      }
    }
    failure { echo '❌ 실패: 콘솔 로그 확인' }
  }
}
