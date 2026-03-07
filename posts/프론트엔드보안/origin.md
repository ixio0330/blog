---
title: 동일 출처와 CORS
tags: [개발, 웹 보안]
---

## 동일 출처

동일 출처란 브라우저에 내장된 접근 제한 방식이다.

브라우저는 잘못된 접근을 막기 위해서 웹 앱 사이에 `출처`라는 경계를 설정해서 서로의 접근을 제한한다.

출처란 다른 웹 앱 간의 접근을 제한하기 위한 경계다.

| https:// | example.com | :443      |
| -------- | ----------- | --------- |
| 스키마   | 호스트명    | 포트 번호 |

이 자체를 출처라고 한다.

브라우저는 기본이 동일 출처 정책으로 설정되어 있고, 아래와 같은 접근을 제한한다.

- js로 요청 전송
- js로 iframe 페이지 접근
- canvas 요소 데이터에 접근
- web storage, indexed db 데이터 접근

## CORS

CORS란 교차 출처로 요청을 전송할 수 있는 방식이다.

SOP에 의하면 원래 교차 출처 리소스에 접근이 불가능하지만, CORS를 설정하면 http 헤더에 서버로부터 허가를 받은 리소스는 접근이 가능하도록 한다. (요청 자체는 전송되나, 응답을 JS로 가져올 수 없다.)

img, link의 GET 요청과 form 요소로 전송하는 GET, POST 를 `Simple Request(단순 요청)`이라고 한다. CORS safelisted 로 간주되는 HTTP 메서드와 HTTP 헤더만 전송하는 요청이다.

CORS safelisted method: GET, HEAD, POST
CORS safelisted request_header: Accept, Accept-Language, Content-Language, Content-Type(application/x-www-form=unlencoded, multipart/form-date, text/plain)

접근 허가 출처는 Access-Control-Allow-Origin 헤더를 사용한다. 이 헤더에 두개 이상의 출처 지정이 불가능하다. 즉 하나만 가능하다.

`*`(와일드카드) 사용시 모든 출처의 접근을 허가한다.

## Preflight Request

Simple Request 조건을 만족하지 않는 경우 Preflight Request가 필요하다.

custom header를 사용하거나, PUT DELETE 메서드 사용시 사전에 브라우저-서버 간의 합의가 이루어진다.

Preflight Request는 합의된 요청을 허가된 상태에서만 전송하는 것이며, OPTIONS 메서드를 사용한다.

- Access-Control-Allow-Methods: 허용하는 메서드
- Access-Control-Allow-Headers: 허용하는 헤더
- Access-Control-Max-Age: Preflight Request TTL

## 쿠키를 포함하는 요청 전송

JS로 교차 출처로 통신할 때는 쿠키를 서버로 전송하지 않는다. 쿠키를 포함하는 요청을 전송한다고 명시해야 하며, 이때 credentials 옵션을 사용한다.

HTTP 헤더로는 `Access-Control-Allow-Credentials`를 사용하며, 이때 `Access-Control-Allow-Origin` 헤더는 와일드카드가 아니고 명시적인 출처를 지정해야 한다. 모든 출처에 쿠키를 전송할 위험이 있기 때문이다.

| 옵션        | 기능             |
| ----------- | ---------------- |
| same-origin | 동일 출처만 전송 |
| omit        | 전송하지 않음    |
| include     | 모든 출처 전송   |

## CORS 요청 모드

프론트엔드도 CORS 옵션을 설정할 수 있는데, 브라우저 기본 값은 CORS다.

| 옵션        | 기능                                       |
| ----------- | ------------------------------------------ |
| same-origin | 교차 출처에 요청이 전송되지 않고 오류 발생 |
| cors        | CORS 위반하는 요청이 전송되면 에러 발생    |
| no-cors     | 교차 출처로 요청은 단순 요청으로만 제한    |

## crossorigin 속성을 사용하는 CORS 요청

HTML 요소도 crossorigin 속성을 부여하면 `img` `link`와 같은 리소스를 가져올 때도 CORS 모드로 요청을 전송할 수 있다.

| 옵션            | 기능             |
| --------------- | ---------------- |
| ""              | 동일 출처만 전송 |
| anonymous       | 전송하지 않음    |
| use-credentials | 모든 출처 전송   |

## postMessage를 사용해 iframe으로 데이터 전송하기

웹 페이지 간의 교차 출처 통신이 필요한 경우가 있다.

postMessage 함수를 사용하면 iframe을 통해 교차 출처 간 데이터를 전송할 수 있다. 수신 측은 발신자의 출처를 체크할 수 있으므로 신뢰할 수 있는 출처만 안전하게 데이터를 전송할 수 있다.

## 사이드 채널 공격

사이드 채널 공격이란 컴퓨터의 CPU, 메모리 등 하드웨어에 대한 공격이다.

브라우저는 `사이트`라는 단위로 프로세스를 분리한다. 이 구조를 `site isolation`이라고 하는데, `사이트`라는 단위는 출처와는 다른 정의를 갖는 보안을 위한 경계이다. 도메인이 동일하면 같은 사이트로 간주되므로, `a.example.com`과 `b.example.com`은 같은 사이트로 취급되어 같은 프로세스에서 실행된다.

만약 `b.example.com`가 보안에 취약하다면 `a.example.com`도 영향을 받을 수 있다. 이처럼 출처 단위의 사이드 채널 공격은 막지 못한다. 출처마다 프로세스를 나눠 사이드 채널 공격을 방지해야 하며 출처마다 프로세스를 분리하는 구조를 `cross-origin isolation`이라고 한다.

| 옵션 | 설명                                                            | 헤더                                                                          |
| ---- | --------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| CORP | 동일 출처, 동일 사이트로 제한한다. 리소스별로 설정 가능하다.    | Cross-Origin-Resource-Policy: same-origin(출처 기준) / same-site(사이트 기준) |
| COEP | 모든 리소스에 CORP 혹은 CORS 헤더를 강제한다.                   | Cross-Origin-Embedded-Policy: require-cors / require-corp                     |
| COOP | window.open, a 등으로 교차 출처 페이지의 접근을 제한할 수 있다. | Cross-Origin-Opener-Policy: same-origin                                       |

COOP 설정은 연쪽과 열린쪽 모두 COOP 헤더를 설정해야 접근이 가능하다. 소셜 로그인과 결제 서비스 등과 같은 교차 출처 서비스는 열린 페이지가 COOP 설정을 하지 않아도 접근 허용하는 `same-origin-allow-popups` 을 사용한다.
