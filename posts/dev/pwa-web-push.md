---
title: PWA에서 푸시 알림 보내는 방법
tags: [개발, 프론트엔드, PWA]
---

이전에 쓴 [WIG 개발 후기](https://ixio0330.github.io/blog/posts/wig)에서 왜 PWA로 푸시 알림을 전송하게 되었는지에 대해, 그리고 [PWA로 홈 화면에 추가할 수 있는 웹앱 만들기](https://ixio0330.github.io/blog/posts/pwa)에서는 PWA에 대해 다뤘다. 이번 글에서는 WIG의 PWA에서 푸시 알림이 어떤 흐름으로 동작하는지 정리해보려고 한다.

간략하게 설명하면, 서비스 워커와 브라우저 Push API로 구독을 만들고, 그 구독 정보를 서버 DB에 저장한 뒤, 스케줄러가 내부 발송 API를 호출하면 서버가 VAPID 서명된 Web Push를 각 endpoint로 직접 보내는 구조다.

## 전체 흐름

1. 서비스 워커를 등록한다.
2. 사용자가 알림을 켜면 브라우저 권한을 요청하고 push subscription을 만든다.
3. 구독 정보를 서버에 저장한다.
4. 스케줄러나 API가 푸시 알림 발송 API를 호출한다.
5. 서버가 VAPID 키로 Web Push payload를 만들어 각 endpoint로 직접 전송한다.
6. 서비스 워커가 push 이벤트를 받아 알림을 표시하고, 클릭 시 특정 페이지를 연다.

## 1. 서비스 워커 등록

푸시 알림을 받으려면 먼저 서비스 워커가 등록되어 있어야 한다. 이 글에서는 서비스 워커가 이미 등록되어 있고, `push` 이벤트와 `notificationclick` 이벤트를 처리하고 있다고 가정하고 패스!

## 2. 알림 권한 요청과 구독 생성

서비스 워커가 준비되면 그 다음은 사용자가 실제로 알림을 켜는 순간이다. 이 시점에 브라우저 권한을 요청하고, 허용되면 `PushManager.subscribe()`를 호출해 구독 정보를 발급받는다. 여기서 만들어지는 값은 대략 아래와 같다.

- `endpoint`
- `p256dh`
- `auth`

이 값들은 브라우저가 푸시 서비스를 통해 알림을 받을 수 있게 해주는 주소와 암호화 키라고 보면 된다. 서버는 이 정보를 알아야 이후에 해당 브라우저로 푸시를 보낼 수 있다. 여기서는 기본적으로 알림 기능이 꺼져 있고, 사용자가 설정에서 알림을 켠 뒤 저장하는 시점에 권한 요청과 구독 생성을 하도록 했다.

## 3. 서버에 구독 정보 저장

구독이 생성되면 클라이언트는 `endpoint`, `p256dh`, `auth`를 서버에 전달해 저장한다. 현재 구현에서는 클라이언트가 `userId`를 같이 보내지 않고, 서버가 세션 기준으로 현재 사용자 ID를 판단해 구독 정보를 upsert 하도록 했다.

## 4. 스케줄러로 트리거

푸시 알림은 어떤 액션 직후 API에서 바로 발송할 수도 있고, 정해진 시간에 스케줄러로 발송할 수도 있다. 내 경우에는 매일 리마인드를 보내거나, 매주 목요일에 특정 알림을 보내는 식의 정기 발송이 목적이었기 때문에 GitHub Actions로 스케줄러를 등록해서 처리했다.

예를 들면 이런 식이다.

- 매일 21:00 KST에 일간 리마인드 발송 API 호출
- 매주 목요일 15:00 KST에 주간 포커스 알림 API 호출

스케줄러는 단순히 내부 API를 호출하는 역할만 한다. 실제 발송 로직은 서버 API 안에 있고, 스케줄러는 `Authorization: Bearer <CRON_SECRET>` 같은 헤더를 붙여 보호된 엔드포인트를 호출한다.

## 5. 서버에서 각 endpoint로 직접 Web Push 전송

이제 실제 발송 단계다. 서버는 DB에 저장된 구독 목록을 읽고, 각 구독 정보에 대해 Web Push payload를 만든 뒤 endpoint로 직접 요청을 보낸다. Web Push payload 생성에는 `@block65/webcrypto-web-push` 라이브러리를 사용했다.

이때 필요한 게 VAPID 키다. VAPID는 이 푸시를 보내는 애플리케이션 서버가 누구인지 증명하기 위한 키 쌍이다. 서버는 공개키와 비공개키를 이용해 payload를 서명하고, 각 구독 endpoint에 맞는 요청을 만들어 전송한다.

내가 구현한 방식은 외부 푸시 중계 서비스를 따로 두지 않고, 서버가 각 `endpoint`에 직접 `fetch` 하는 구조다. 라이브러리로 payload를 만든 뒤 다음 정보를 담아 발송한다.

```ts
async function sendPush(subscriptions: Subscription[], vapidKeys: VapidKeys) {
  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      const payload = await buildPushPayload(
        {
          data: JSON.stringify({
            title: "알림 제목",
            body: "알림 내용",
            data: { url: "/target-page" },
          }),
          options: { ttl: 60 },
        },
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
          expirationTime: null,
        },
        vapidKeys,
      );

      await fetch(sub.endpoint, {
        method: payload.method,
        headers: payload.headers,
        body: payload.body as ArrayBuffer,
      });
    }),
  );
}
```
