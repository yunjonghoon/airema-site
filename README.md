# 해동가적 (HAIDONGGAJEOK) 홈페이지

한국어 / English / 日本語 3개국어 정적 사이트. 빌드 과정 없이 그대로 호스팅합니다.

## 구성
- `index.html` `airema.html` `maista.html` `entertainment-ax.html` `sports-ax.html` `smb-ax.html` — 한국어
- 같은 이름 + `-en` / `-ja` — 영어 / 일본어
- `styles.css` `site.js` `language-data.js` — 공통 스타일, 동작, 영·일 번역 사전
- `assets/` — 로고, 이미지, 배경 영상, 폰트(Pretendard 부분 폰트)

## 수정 시 주의
- 새 문구를 추가하면 `language-data.js`에 영어·일본어 번역도 함께 넣어야 합니다.
- 영문 표기 HAIDONGGAJEOK의 AI는 `<span class="ai">AI</span>`로 감싸 붉은색으로 표시합니다.
- CSS/JS를 고치면 HTML의 `?v=` 값을 바꿔 캐시를 갱신합니다.
