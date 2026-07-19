---
title: 딥링크(Deep Link)
tags: [개발]
---

## 딥링크란?

앱 개발을 하면 필수로 알아야 하는 딥링크!

웹에서 각 페이지에 고유한 라우트 경로가 있듯 앱에서도 각 화면을 특정할 수 있는 링크가 있는데, 이 링크를 딥링크라고 한다. 웹사이트의 경우 URL을 통해 바로 특정 페이지로 라우팅이 되듯 앱에서도 딥링크를 사용하면 특정 화면으로 이동시킬 수 있다.

### URI 스킴 방식

기본적으로 URI 스킴 방식을 이용해서 딥링크를 지원할 수 있다.

예를 들어, 앱에 상품 목록 페이지가 있다고 가정했을 때 URI 스킴 방식의 경우 이렇게 동작한다.

| URI 스킴             | 동작                             |
| -------------------- | -------------------------------- |
| `myapp://products`   | 상품 목록 화면으로 이동          |
| `myapp://products/1` | id가 1인 상품 상세 화면으로 이동 |

URI 스킴은 OS가 등록된 스킴을 로컬에서 바로 매칭해서 앱을 실행하는 방식이라, 네트워크 요청 없이 즉시 동작한다.

### URI 스킴 방식의 한계

URI 스킴 방식은 간편하지만 한계가 있다.

1. 앱 미설치 시 동작을 하지 않으며, 대응할 수 있는 방법이 없다. 네트워크 요청 자체가 없기 때문에 에러 핸들링이나 fallback 처리가 불가능하다.
2. URI 스킴은 중복 등록이 가능하기 때문에 다른 앱으로 납치될 수 있는 위험이 있다.

## Universal Link와 App Link

URI 스킴 방식의 한계를 해결하기 위해 나온 방법이 iOS의 Universal Link와 Android의 App Link다.

가장 큰 특징은 HTTPS 도메인 기반으로 동작한다는 것이고, 앱 미설치시 웹으로 fallback을 하거나 스토어 링크로 redirect 할 수 있다.

또한 중복 URI 스킴 허용의 문제도 도메인 소유권 검증(파일 기반 인증)을 거치기 때문에 납치 위험을 제거할 수 있다.

- iOS는 `apple-app-site-association` 파일 사용
- Android는 `assetlinks.json` 파일 사용
- 두 파일 모두 `/.well-known/` 경로에, 리다이렉트 없이, 정확한 Content-Type으로 서빙되어야 검증이 통과된다.

링크를 실행하면 OS가 먼저 AASA 혹은 assetlinks.json으로 검증된 앱이 설치되어 있는지 로컬에서 확인한다. 앱이 있으면 그대로 가로채서 실행하고, 없으면 실제로 브라우저가 서버에 GET 요청을 보내 웹 페이지를 띄운다.

### iOS - apple-app-site-association

- `https://example.com/.well-known/apple-app-site-association`
- 확장자 없이 `Content-Type: application/json`으로 요청

```json
{
  "applinks": {
    "details": [
      {
        "appIDs": ["TEAMID.com.example.myapp"],
        "components": [
          {
            "/": "/products/*",
            "comment": "상품 목록/상세 화면 매칭"
          }
        ]
      }
    ]
  }
}
```

> TEAMID는 Apple Developer 계정의 Team ID(10자리 영숫자 조합, 예: ABCDE12345)로, `Apple Developer 계정 → Membership` 페이지에서 확인할 수 있다.

### Android - assetlinks.json

- `https://example.com/.well-known/assetlinks.json`

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.example.myapp",
      "sha256_cert_fingerprints": [
        "14:6D:E9:83:C5:73:06:50:D8:EE:B9:95:2F:34:FC:64:16:A0:83:42:E6:1D:BE:A8:8A:04:96:B2:3F:CF:44:E5"
      ]
    }
  }
]
```

> `sha256_cert_fingerprints`는 앱 서명 키의 인증서 fingerprint이기 때문에 keystore마다 값이 다르므로, 배포 환경에 맞는 값을 넣어야 한다. 플레이 스토어에서 서명을 한번 더 하기 때문에 `Google Play로 보호됨 → Play 스토어 보호 토글 버튼 클릭 → 앱 서명 키 보호 항목의 Play 앱 서명 관리` 페이지에서 확인 할 수 있다(최근에 서명키 조회하는 화면 경로가 변경되어서 꽤 헷갈린다).

## 디퍼드 딥링크

일반 딥링크는 앱 설치 여부에 따라 즉시 앱 실행 또는 웹 fallback으로 분기되는 반면, 디퍼드 딥링크는 앱이 설치되어 있지 않을 경우 딥링크 정보를 어딘가에 저장해뒀다가, 앱 설치 후 최초 실행 시 저장된 딥링크 목적지로 이동시키는 방법이다.

예: 마케팅 링크 클릭 → 스토어 설치 → 앱 최초 실행 시 원래 보려던 상품 상세 화면으로 바로 이동

### 구현 방식

- Android는 Play Install Referrer API를 이용해 스토어 설치 시점의 referrer 값(원본 링크 정보)을 앱이 조회할 수 있다.
- iOS는 공식 API가 없어서 클립보드 매칭이나 fingerprint matching(설치 시점의 디바이스/IP 등의 네트워크 정보를 추정해서 매칭)을 활용하는 경우가 많은데, 정확도가 떨어지는 편이다.
- 실무에서는 AppsFlyer, AirBridge 같은 SDK를 붙여서 처리하는 경우가 많다.
