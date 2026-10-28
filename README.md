# OWKR 내전 규정 · Docs

OWKR 내전 규정, 참가 안내와 FAQ를 제공하는 공개 문서 사이트입니다.

**[내전 규정 읽기](https://overwatch-kr.github.io/owkr-docs/) · [Discord 문의](https://discord.gg/overwatchkr)**

내전 참가자는 웹에서 규정과 참가 안내를 확인하면 됩니다. 아래 개발 절차는 문서 사이트를 수정하는 기여자를 위한 안내입니다.

## 규정과 FAQ

정식 규정은 `src/content/docs`에서 관리합니다. FAQ는 규정을 설명하는 보조 자료이며 정식 규정을 대체하지 않습니다.
규정 해석과 운영 문의는 Discord에서, 사이트 오류는 이 저장소의 Issues에서 접수합니다.

## 개발

```sh
pnpm install
pnpm dev
pnpm build
```

## 콘텐츠 관리

- `src/content/docs`: 정식 규칙과 참가 안내
- `src/content/faq`: FAQ 항목
- `src/content.config.ts`: 문서와 FAQ 메타데이터 스키마
- `CHANGELOG.md`: 저장소 내부 변경 기록

FAQ를 추가하려면 `src/content/faq`에 Markdown 파일을 만들고 `question`, `category`,
`order`를 작성합니다. 규칙을 변경할 때는 문서의 `version`, `updatedAt`과
루트의 `CHANGELOG.md`를 함께 갱신합니다.

## 배포

`main` 브랜치에 푸시하면 GitHub Actions가 사이트를 빌드해 GitHub Pages에 배포합니다.
저장소 설정의 Pages 메뉴에서 배포 소스를 **GitHub Actions**로 선택해야 합니다.

## 관련 프로젝트

- [OWKR 커뮤니티](https://github.com/Overwatch-KR) · [Discord](https://discord.gg/overwatchkr)
- [OWKR Match](https://github.com/Overwatch-KR/owkr-balance) · 내전 참가 명단과 팀 편성
- [Gather Bot](https://github.com/Overwatch-KR/owkr-gather-bot) · Discord 내전 모집과 티어 수집
- [내전 규정](https://github.com/Overwatch-KR/owkr-docs) · 규정, 참가 안내와 FAQ
- [관리자 시험](https://github.com/Overwatch-KR/owkr-exam) · 내전 관리자 시험 웹
- [내전 워크샵](https://github.com/Overwatch-KR/owkr-scrim-workshop) · 준비 중인 OverPy 소스

## Gather Bot 정책

봇 정책·약관·문의 안내의 유일한 원본은 `src/content/docs/gather-bot/`입니다.
[공개 안내](https://overwatch-kr.github.io/owkr-docs/gather-bot)와 기존 참가자 개인정보 안내는 처리 범위를 구분합니다.
시간을달리는소녀 이용약관은 2026년 10월 28일 시행하는 확정본입니다. 문의 안내 1.0도 확정본입니다. 봇 개인정보처리방침은 국외 이전 등 최종 확인을 위해 초안 표시와 noindex를 유지합니다.
비공개 배포 대상인 검토 기록·공개 준비 목록은 [관리 안내](docs/gather-bot/README.md)를 따릅니다.
봇의 수집·보관·운영 정책 변경 시 두 저장소의 관련 PR을 연결합니다.

봇 정책 화면은 `src/pages/gather-bot`, `src/layouts/policy-layout.astro`, `src/styles/policy.css`에서 관리합니다. 최초 발행일·갱신일은 문서 메타데이터를 사용하고 기존 `/gather-bot` 주소를 유지합니다.

문서 헤더는 전체 페이지가 공유합니다. 공통 규칙·참가 안내·개인정보 안내와 봇 정책·변경 이력은 `src/components/document-toc.astro`의 번호 목차와 현재 항목 강조를 함께 사용합니다. 봇 안내 홈의 아이콘·카드와 정책 문서의 날짜 표시는 유지합니다.

## 화면 공통 규격

일반 문서·봇 정책·FAQ는 `document-header.astro`와 `document-toc.astro`를 공유합니다. 제목·본문 크기, 문서 폭(940px), 날짜 표시, 색상과 동작 속도는 `global.css`의 공통 변수로 관리합니다. 전체 페이지의 헤더·푸터·OWKR 파비콘은 동일하며, 봇 아이콘은 봇 안내 홈의 콘텐츠로만 사용합니다. 최초 발행일을 확인하지 못한 문서는 날짜를 추정하지 않고 갱신일만 표시합니다.

FAQ와 변경 이력의 펼침 동작은 `scripts/accordion.ts`를 함께 사용하며 CSS의 240ms 규격과 동작 줄이기 설정을 따릅니다. CSS 호버는 160ms이며 위치·크기 이동 대신 색상과 밑줄로 표시합니다. 변경 비교는 이전·이후·변경·문구의 네 열을 유지하고 모바일에서도 행 번호를 숨기지 않습니다.
