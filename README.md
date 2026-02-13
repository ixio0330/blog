# ~/blog

마크다운 기반 정적 블로그. React + TypeScript + Tailwind CSS로 구성되어 있고, GitHub Pages로 배포됩니다.

## 실행 방법

```bash
# 의존성 설치
yarn install

# 개발 서버
yarn dev

# 프로덕션 빌드
yarn build

# 빌드 결과 미리보기
yarn preview
```

`yarn dev` 실행 시 prebuild 스크립트가 자동으로 포스트 메타데이터를 생성한 뒤 개발 서버가 시작됩니다.

## 글 작성

`posts/` 디렉토리에 `.md` 파일을 추가하면 됩니다.

```
posts/
  hello-world.md
```

### frontmatter 형식

파일 상단에 아래 형식으로 메타데이터를 작성합니다.

```md
---
title: 글 제목
tags: [react, typescript]
---

본문 내용...
```

- **title** — 글 제목
- **tags** — 태그 목록 (배열)
- **작성일/수정일** — git commit 이력에서 자동 추출되므로 직접 입력할 필요 없음

### 글 파일명 = URL slug

`posts/hello-world.md` → `/#/posts/hello-world`

## 프로젝트 구조

```
posts/                  # 마크다운 글
scripts/
  generate-posts.ts     # prebuild: manifest + public 복사
src/
  App.tsx               # 라우터 (HashRouter)
  main.tsx              # 엔트리
  index.css             # Tailwind + 글로벌 스타일
  components/
    Layout.tsx          # 헤더 + 푸터
    ThemeToggle.tsx     # 다크/라이트 전환
    PostCard.tsx        # 글 카드
    TagBadge.tsx        # 태그 뱃지
  pages/
    PostList.tsx        # 글 목록 + 태그 필터
    PostDetail.tsx      # 글 상세 (마크다운 렌더링)
  hooks/
    useTheme.ts         # 테마 상태 관리
  generated/            # (자동 생성) posts-manifest.json
```

## 빌드 파이프라인

`yarn build` 실행 시:

1. `scripts/generate-posts.ts`가 `posts/*.md`를 스캔
2. frontmatter 파싱 + git 이력에서 작성일/수정일 추출
3. `src/generated/posts-manifest.json` 생성
4. 마크다운 파일을 `public/posts/`로 복사
5. TypeScript 컴파일 + Vite 빌드

## 배포

GitHub Pages로 자동 배포됩니다. `main` 브랜치에 push하면 `.github/workflows/deploy.yml` 워크플로우가 실행됩니다.

`vite.config.ts`의 `base` 값이 저장소 이름과 일치해야 합니다 (현재 `/blog/`).
