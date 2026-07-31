---
title: 제대로 알고 사용하자, JWT
tags: [개발]
---

실무에서 많이 사용되는 JWT.

백엔드에서 서명과 검증을 담당하기 때문에 인증할 때 사용하는 토큰이라고만 알고 사용하고 있었는데, 자주 사용하는만큼 정확하게 알아야겠다는 생각이 들어서 RFC 문서를 읽으면서 정리해보게 되었다.

참고로 [JSON Web Token (JWT) Debugger](https://www.jwt.io/)를 이용하면 인코딩, 디코딩 결과를 바로 확인해볼 수 있다.

# JWT(JSON Web Token) 개요

[RFC 7519](https://translate.autocrypt.io/rfc7519)에 의하면 JWT는 JWS 또는 JWE 구조로 인코딩된 JSON 객체로, 클레임 집합(Claims Set)을 표현하는 토큰이다.

## JOSE Header

JOSE 헤더는 JWT의 Claims Set에 적용되는 암호화 작업과 관련된 정보를 나타낸다.

- typ: 토큰 타입
- alg: 암호화 작업에 사용할 알고리즘
  - JWS: 서명 알고리즘, 대표적으로 HS256(대칭키 방식)와 RS256(비대칭키 방식)이 있다.
  - JWE: 키 관리 알고리즘
- crit: 필수 필드 지정
- kid: 서명/암호화에 사용된 키를 식별, 여러 키를 운용(키 로테이션 등)할 때 검증 측이 이 값으로 어떤 키를 사용해야 하는지 찾는다.
- jku: 검증에 사용할 공개키 집합(JWK Set)을 가져올 수 있는 URL

### Unsecured JWTs

서명이나 암호화 없이 JWT를 생성할 수 있다.

```json
{
  "alg": "none"
}
```

서명 없이 JWT를 아래 Payload로 생성하면,

```json
{
  "sub": "1234567890",
  "name": "John Doe",
  "admin": true,
  "iat": 1785593388
}
```

JWT는 이렇게 생성된다.

```
eyJhbGciOiJub25lIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTc4NTU5MzQ1Mn0.
```

서명과 검증시 "alg"을 명시해야 하는데, 이유는 "alg"을 "none"으로 설정하면 서명 없는 JWT가 생성되기 때문이다. 서버가 "alg" 값을 그대로 신뢰하면, 공격자가 서명된 토큰의 "alg"을 "none"으로 바꿔치기해 검증을 우회할 수 있다(RFC 8725 2.1). 따라서 허용할 알고리즘을 화이트리스트로 강제하고 "none"은 명시적으로 거부해야 한다.

### JWS와 JWE

JWS와 JWE는 JWT를 어떤 방식으로 보호할지를 결정하는 방식이다.

#### JWS(JSON Web Signature)

JWT의 클레임 세트에 전자서명을 적용해 무결성과 서명 주체를 검증할 수 있다.

JWS를 사용하면 JWT는 아래 구조로 생성된다.

```
JOSE Header.Payload.Signature
```

만약 아래 JOSE Header, Payload로 JWT를 생성하면,

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

```json
{
  "sub": "1234567890",
  "name": "John Doe",
  "admin": true,
  "iat": 1785593388
}
```

JWT는 이렇게 생성된다.

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTc4NTU5MzM4OH0.Y2gCf_21lMcpyAjBKU7rbkUfg-L6gJDLHKopWGWk1Vo
```

#### JWE(JSON Web Encryption)

JWT의 클레임 세트를 암호화하여 기밀성을 보호한다.

JWE를 사용하면 JWT는 아래 구조로 생성된다.

```
JOSE Header.Encrypted Key.IV.Ciphertext.Authentication Tag
```

## Payload(Claim)

클레임은 JWT가 나타내는 이름/값의 쌍(멤버)을 의미한다.

```json
{
  "sub": "1234567890",
  "name": "John Doe",
  "admin": true,
  "iat": 1516239022
}
```

여기서 "sub": "1234567890"가 클레임이고 "sub"은 클레임 네임, "1234567890"는 클레임 값이라고 한다.

클레임 세트는 해당 JSON 객체 자체를 의미한다.

### Claim Names

클레임 네임은 3가지로 나뉜다.

#### Registered Claim Names

아래 클래임 이름들은 IANA "JSON 웹 토큰 클레임" 레지스트리에 등록되어 있으며, 선택 사항이다.

- sub: JWT 주체인 개체 식별, 발급자의 컨텍스트에서 로컬로 고유하거나 전역적으로 고유한 값이어야 한다. user_id처럼 발급 서비스 내에서 JWT 주체를 식별할 수 있는 고유한 값이거나, IPv4/IPv6처럼 전역적으로 고유한 값이어야 한다.
- iss: JWT 발급 주체 식별
- aud: JWT가 대상인 수신자를 식별하며, aud로 자신을 식별하지 않으면 JWT는 거부해야 한다.
- exp: 만료 시간
- nbf: JWT가 이 시각 이전에는 수락되어서는 안 되는 시간
- iat: 발급된 시간
- jti: JWT에 대해 고유 식별자이며, JWT가 재사용되는 것을 방지한다. 일회용으로 사용하는 토큰인 경우에 이 클레임을 사용할 수 있다.

#### Public Claim Names

JWT를 사용하는 사용자가 자유롭게 정의할 수 있다.

```json
{
  "https://domain.com/role": "admin"
}
```

#### Private Claim Names

JWT의 생산자와 소비자는 비공개 이름인 클레임 이름을 사용하는 데 동의할 수 있다.

```json
{
  "role": "admin"
}
```

# [RFC8725](https://translate.autocrypt.io/rfc8725)

이 문서의 목표는 JWT의 안전한 구현 및 배포를 용이하게 하는 것인데, 실무에서 사용할 수 있는 Best Practices가 정리되어 있다.

주로 JWS가 사용되기 때문에 JWE 관련된 항목은 생략했다.

| #   | 공격                           | 설명                                                                                                        | 대응 방안 (섹션)                              |
| --- | ------------------------------ | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| 2.1 | **약한 서명 / 서명 검증 미흡** | `alg`를 `"none"`으로 바꿔도 통과되거나, `RS256`(비대칭)을 `HS256`(대칭)으로 바꿔서 공개키를 비밀키처럼 악용 | 3.1 알고리즘 검증, 3.2 적절한 알고리즘만 허용 |
| 2.2 | **약한 대칭키**                | HS256에 사람이 외우기 쉬운 암호(엔트로피 낮음) 씀 → 오프라인 brute-force 가능                               | 3.5 충분한 엔트로피의 키 사용                 |
| 2.6 | **JSON 인코딩 다양성 악용**    | UTF-8 아닌 다른 인코딩(UTF-16 등) 허용 시 파싱 결과가 달라져 검증 우회 가능                                 | 3.7 UTF-8만 사용                              |
| 2.7 | **대체 공격 (Substitution)**   | 내 것으로 받은 JWT를, 의도되지 않은 다른 리소스/서비스에 재사용                                             | 3.8 발급자/주체 검증, 3.9 aud 검증            |
| 2.8 | **Cross-JWT Confusion**        | 특정 목적으로 발급된 JWT가 다른 용도(다른 API)에 잘못 쓰임                                                  | 3.8, 3.9, 3.11, 3.12                          |
| 2.9 | **서버 대상 간접 공격**        | `kid`, `jku`, `x5u` 같은 클레임 값을 그대로 DB/LDAP 쿼리나 URL 요청에 써서 인젝션/SSRF 유발                 | 3.10 수신 클레임을 맹목적으로 신뢰하지 않기   |

## 참조

- [RFC 7519](https://translate.autocrypt.io/rfc7519)
- [RFC 7515](https://translate.autocrypt.io/rfc7515)
- [RFC 7516](https://translate.autocrypt.io/rfc7516)
- [RFC 8725](https://translate.autocrypt.io/rfc8725)
