# NFT Architecture Design

## Overview
Flux NFT 시스템은 게임 아이템, 업적, 수집품을 블록체인 상에서 관리하는 듀얼 토큰 표준(ERC-721/1155) 시스템입니다.

## NFT 컨트랙트 구조

### 1. FluxGameAsset (ERC-721)
- **용도**: 유니크한 게임 아이템 (희귀 무기, 캐릭터, 랜드 등)
- **특징**: 
  - 각 NFT는 고유한 ID를 가짐
  - 개별 메타데이터
  - 로열티 지원 (EIP-2981)

### 2. FluxGameItem (ERC-1155)
- **용도**: 대량 생산 가능한 아이템 (포션, 재료, 일반 장비 등)
- **특징**:
  - 동일 타입의 여러 개 소유 가능
  - 효율적인 배치 전송
  - 낮은 가스 비용

## 메타데이터 구조

### On-chain 데이터
```json
{
  "itemType": "weapon|armor|consumable|material|character|land",
  "rarity": 1-5,
  "level": 1-100,
  "gameId": "flux-game-001"
}
```

### Off-chain 데이터 (IPFS)
```json
{
  "name": "Legendary Plasma Sword",
  "description": "A sword forged in the heart of a dying star",
  "image": "ipfs://QmXxx...",
  "animation_url": "ipfs://QmYyy...",
  "attributes": [
    {
      "trait_type": "Attack Power",
      "value": 150
    },
    {
      "trait_type": "Element",
      "value": "Plasma"
    },
    {
      "trait_type": "Durability",
      "value": 100,
      "max_value": 100
    }
  ],
  "game_data": {
    "stats": {
      "attack": 150,
      "defense": 20,
      "speed": 10
    },
    "requirements": {
      "level": 50,
      "class": ["warrior", "paladin"]
    },
    "effects": ["burn", "pierce"]
  }
}
```

## 주요 기능

### 1. 민팅 시스템
- **Single Mint**: 개별 NFT 생성
- **Batch Mint**: 대량 생성 (가스 최적화)
- **Lazy Mint**: 구매 시점 민팅
- **Airdrop**: 대량 배포

### 2. 업그레이드 시스템
- 아이템 레벨업
- 속성 강화
- 아이템 합성 (2개 이상의 NFT → 새로운 NFT)

### 3. 로열티 시스템
- 창작자 로열티 (2.5%)
- 게임 개발사 로열티 (2.5%)
- 온체인 자동 분배

### 4. 게임 통합
- 게임 서버 권한 관리
- 아이템 상태 동기화
- 크로스 게임 호환성

## 보안 고려사항

### 1. 권한 관리
- `MINTER_ROLE`: NFT 생성 권한
- `GAME_ROLE`: 게임 서버 권한
- `UPGRADER_ROLE`: 업그레이드 권한

### 2. 재진입 방지
- ReentrancyGuard 사용
- Check-Effects-Interactions 패턴

### 3. 서명 검증
- 게임 서버 서명 검증
- 메타 트랜잭션 지원

## 가스 최적화

### 1. 스토리지 최적화
- 비트 패킹 사용
- 불필요한 스토리지 쓰기 최소화

### 2. 배치 작업
- 멀티콜 패턴
- 배치 민팅/전송

### 3. 메타데이터
- 기본 URI 사용
- 온체인 데이터 최소화

## 확장성

### 1. 프록시 패턴
- UUPS 업그레이드 가능
- 스토리지 레이아웃 보존

### 2. 모듈화
- 기능별 분리
- 플러그인 시스템

### 3. 크로스체인
- 브리지 준비
- 체인별 배포

## 통합 포인트

### 1. 마켓플레이스
- 리스팅/구매 인터페이스
- 로열티 처리
- 메타데이터 쿼리

### 2. 게임 서버
- REST API
- WebSocket 이벤트
- 상태 동기화

### 3. 지갑
- 표준 지갑 지원
- 메타데이터 표시
- 배치 작업

## 구현 우선순위

1. **Phase 1**: 기본 ERC-721 구현
2. **Phase 2**: ERC-1155 추가
3. **Phase 3**: 업그레이드/합성 시스템
4. **Phase 4**: 크로스게임 기능