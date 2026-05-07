---
title: PWA로 홈 화면에 추가할 수 있는 웹앱 만들기
tags: [개발, 프론트엔드, PWA]
---

# PWA란?

PWA(Progressive Web App)는 웹과 네이티브 앱의 이점을 모두 갖는 웹 앱이다. 네이티브 앱은 아니지만, 네이티브 앱처럼 홈 화면에서 접근할 수 있어 일반적인 웹 앱보다 접근성이 더 좋다.

PWA는 모바일, 데스크톱 환경 모두 지원하며, 내가 생각하기에 PWA의 가장 큰 장점은 빠르고 쉬운 배포라고 생각한다. 모바일 앱의 경우 스토어를 통해 배포하기 때문에 비용과 시간이 많이 들고, 매 변경마다 스토어 심사를 거쳐야 하기 때문이다.

추가로 푸시 알림을 보내 사용자의 행동을 유도할 수 있다는 점도 장점이다. 최근에 목표 설정 및 액션 아이템을 설정하고 달성 여부를 체크하는 <a href="https://dowin.app/" target="_blank">Dowin</a>라는 서비스를 만들었는데, PWA를 지원하며 푸시 알림을 통해 유저들의 액션을 유도하고 있다. 매주 목요일에 가장 달성률이 낮은 액션 아이템 중 목표와 가장 근접한 액션 아이템을 권유하는 푸시 알림을 보냈을 때 유저들의 반응이 좋았다.

다만 홈 화면에 앱을 추가하는 과정이 스토어에서 앱을 설치하는 것처럼 매끄럽지 않기 때문에, 유저 입장에서는 설치 과정이 복잡하게 느껴질 수 있다.

## PWA 조건

PWA는 단일 기술이나 특정 프레임워크가 아니라, 특정 조건을 만족했을 때 PWA라고 할 수 있다.

필수

- HTTPS 프로토콜 사용
- Web App Manifest
- Service Worker 등록

옵션

- 검색 엔진을 통해서 찾을 수 있어야 한다.
- 기기의 홈 화면에서 사용할 수 있다.
- URL을 전송해 공유할 수 있다.
- 오프라인이나 불안정한 네트워크에서 동작한다.
- 반응형을 지원한다. (모바일, 태블릿, 노트북 등)
- 푸시 알림을 전송할 수 있다.

## Web App Manifest란?

웹 앱 매니페스트는 앱 이름, 아이콘, 배경색 같은 정보를 담은 JSON 설정 파일이다. 홈 화면 아이콘이나 실행 화면 등을 구성하는 데 꼭 필요한 파일이다.

```json
// public/manifest.json
{
  "short_name": "Dowin",
  "name": "Dowin",
  "description": "가장 중요한 목표에 집중하세요.",
  "icons": [
    {
      "src": "/favicon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/favicon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#EFF0FA",
  "background_color": "#EFF0FA"
}
```

도입부에서 언급한 Dowin 서비스에선 매니페스트 파일을 `public/manifest.json`에 두고, 루트 레이아웃의 `<head>`에서 연결했다.

```tsx
// layout.tsx
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#EFF0FA" />
<link rel="apple-touch-icon" href="/favicon-192x192.png" />
```

Next.js에서는 public 폴더의 파일이 정적 파일로 그대로 서빙되기 때문에 `manifest` 파일은 `/manifest.json` 경로로 접근할 수 있다.

## Service Worker란?

서비스 워커는 브라우저가 백그라운드에서 실행하는 스크립트이며, 브라우저의 메인 자바스크립트 스레드와 분리된 별도의 독립된 스레드에서 실행된다. 그렇기 때문에 페이지 렌더링에 영향을 줄 수 없고 보안상 DOM 구조에 직접 접근할 수 없다.

서비스 워커는 네트워크 요청을 제어하고 수정하며, 캐시로부터 반환된 커스텀 응답을 제공하거나 응답을 완전히 가공할 수 있다.

서비스 워커 파일의 URL 경로에 따라 제어할 수 있는 범위(scope)가 결정된다. 보통은 사이트 전체를 제어하기 위해 **루트 경로(/sw.js)**에 둔다. 예를 들어 `example.com/js/sw.js`라면 기본 scope는 `/js/`다.

### 캐싱 전략

서비스 워커에서는 상황에 따라 서로 다른 캐싱 전략을 사용한다. 대표적으로는 아래 3가지가 가장 많이 쓰인다.

- `Cache First`: 캐시에 있으면 즉시 반환하고, 없을 때만 네트워크 요청한다. 정적 리소스(CSS, JS, 이미지) 캐싱하기에 적합하다.
- `Network First`: 네트워크를 먼저 시도하고, 실패했을 때 캐시를 반환한다.
- `Stale While Revalidate`: 일단 캐시를 빠르게 보여주고, 백그라운드에서 네트워크로 최신 데이터로 갱신한다.

# `@serwist`로 PWA 세팅하기

서비스 워커 로직을 직접 구현할 수도 있지만, <a href="https://serwist.pages.dev/docs/next" target="_blank">@serwist/next</a>를 사용하면 Next.js에서 서비스 워커를 더 쉽게 구성할 수 있다.

먼저 `@serwist/next`와 `serwist`를 설치한다.

```bash
npm install @serwist/next serwist
```

그리고 `next.config.ts`에서 Serwist 설정을 추가한다.

```ts
// next.config.ts
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts", // 서비스 워커 소스 파일 경로를 지정
  swDest: "public/sw.js", // 빌드 결과물을 `public/sw.js`로 생성
});

export default serverRuntimeConfig.isDevelopment
  ? nextConfig
  : withSerwist(nextConfig);
```

루트 레이아웃에서 서비스 워커를 등록해줘야 한다.

```tsx
// layout.tsx
export default function RootLayout() {
  useSerwistRegistration();

  useEffect(() => {
    if (!enabled || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js");
  }, [enabled]);

  return (
    // ...
  )
}
```

마지막으로 `sw.ts`에서 Serwist 인스턴스를 만들고 기본 이벤트를 등록하면 된다.

```ts
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST, // 빌드 시점에 생성된 정적 리소스 목록을 미리 캐시에 저장
  skipWaiting: true, // 새 서비스 워커가 설치되면 대기하지 않고 바로 활성화
  clientsClaim: true, // 활성화 직후 현재 열려 있는 페이지(클라이언트)의 제어권을 가져옴
});

serwist.addEventListeners();
```

`serwist.addEventListeners()`를 호출하면 Serwist가 제공하는 기본 이벤트 핸들러가 연결된다.
