# OWKR Docs

OWKR 내전 규칙, FAQ와 참가 안내를 제공하는 정적 문서 사이트입니다.

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
