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
