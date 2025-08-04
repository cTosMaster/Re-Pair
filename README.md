# Re-Pair
#mutsa-team-2 : Re-Pair

       6-2. 깃허브 브랜치 전략
           - main : 최종 배포 이미지를 올리는 브랜치  (push 금지 : 병합용도)
           - develop : 도중 중간 테스트, 백엔드/프론트 병합 테스트 시 병합 목적의 브랜치 (push 금지 : 병합용도)
           - frontend-dev : 프론트엔드 통합 브랜치 (push 금지 : 병합용도)
           - backend-dev : 백엔드 통합 브랜치        (push 금지 : 병합용도)
           - feature/[본인 닉네임] : 이름별로 개인 브랜치 구분하여 올림


       6-3 개인별 작업 방안

           [프로젝트 초기 셋업 - 초기에 한번만]
           1) git clone <원격 저장소 URL>
           2) git fetch origin
           3) git checkout -b backend-dev origin/backend-dev
           4) git checkout -b feature/[본인 닉네임]
           5) git fetch
           6) git merge backend-dev

           [이후 개발진행 중 프로세스]
          1) git fetch
          2) git branch -f backend-dev origin/backend-dev
              -> 항상 로컬의 통합브랜치를 최신화 해줄것
          3) git checkout feature/[본인 닉네임]
          4) git merge backend-dev
          5) 코딩 작업 진행
          5) git add backend/*
          6) git commit -m “[팀분류]/[이름]/[작업명]”
              ex) frontend/정병수/mainpage
          7) git push -u origin [개인 브랜치명]


          [PR 병합 프로세스]
          1) github 사이트에서 pull request 클릭하여 생성
          2) 제목은 commit 메시지랑 동일하게 작성하되
             내용은 좀더 자세히 써주면 됨.
          3) 3명 이상이 리뷰 승인이 있어야 되므로 미팅 후 merge 하면됨.

