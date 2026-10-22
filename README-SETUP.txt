notmetho.exe — GitHub Pages + JSON 데이터 버전

이 버전은 관리자 페이지가 없으며 공개 방문자에게 편집 권한을 제공하지 않습니다.
콘텐츠는 브라우저 localStorage가 아니라 data/*.json 파일에서 읽습니다.
GitHub 저장소에서 JSON 파일이 변경되면 GitHub Pages가 변경된 파일을 배포하며,
방문자는 새로고침하면 새 데이터를 확인할 수 있습니다. 캐시 반영에 약간 시간이 걸릴 수 있습니다.

폴더 구조:
  index.html, works.html, characters.html, updates.html, profile.html
  style.css
  app.js
  data/works.json
  data/characters.json
  data/updates.json
  data/profile.json
  images/  (추가할 이미지 보관용, 현재 샘플 이미지 없음)

업로드 방법:
1. 압축을 해제합니다.
2. GitHub archive 저장소의 Add file > Upload files에서
   HTML 5개, CSS, JS, data 폴더 전체를 업로드합니다.
   README.md는 기존 파일을 유지해도 됩니다.
3. Commit changes를 누릅니다.
4. https://notmetho404.github.io/archive/ 에서 확인합니다.

중요:
- JSON 파일을 수정하려면 현재는 GitHub 웹 편집기에서 수정해야 합니다.
- HTML을 직접 수정하지 않아도 되지만, 아직 입력 폼 기반 CMS는 아닙니다.
- 관리자 인증/자동 GitHub 저장 기능은 다음 단계에서 별도로 구현해야 합니다.
- JSON 문자열 안에 큰따옴표가 들어가면 \"처럼 이스케이프해야 합니다.
- image 필드에는 images/파일명.png 또는 https://... URL을 쓸 수 있습니다.
- index.html을 로컬 파일로 더블클릭하면 fetch 보안 정책 때문에
  데이터가 표시되지 않을 수 있습니다. GitHub Pages 주소에서 테스트하세요.
- 작품·캐릭터 상세 페이지, CMS 편집기는 아직 포함하지 않았습니다.
