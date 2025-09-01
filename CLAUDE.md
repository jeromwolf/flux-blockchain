# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Flux Blockchain - 게임과 블록체인을 연결하는 인터플래네터리 디지털 자산 프로토콜

This is a blockchain project that is part of the Flux ecosystem, which includes:
- **flux-game**: 모바일 우선 웹 게임 플랫폼
- **flux-blockchain**: 블록체인 기술 구현 (현재 프로젝트)
- **flux-rag**: RAG (Retrieval-Augmented Generation) AI 시스템

## 프로젝트 현재 상태 (2025년 9월 1일 기준)

### ✅ 완료된 작업

#### 1. 스마트 컨트랙트 구현 (100% 완료)
- **FluxToken (ERC-20)**: 
  - 총 발행량: 420억 토큰 (SF 테마)
  - 베스팅 시스템 (팀/투자자 토큰 잠금)
  - 민팅/소각 기능
  - 일시정지(Pause) 기능
  - 역할 기반 접근 제어
  
- **FluxGameAsset (ERC-721)**: 
  - 게임 아이템 NFT (무기, 방어구, 재료 등)
  - 희귀도 시스템 (1-5)
  - 레벨 업그레이드 (1-100)
  - 아이템 조합 기능
  - 서명 기반 민팅
  - ERC-2981 로열티 (5%)

- **FluxMarketplace**: 
  - P2P 거래 시스템
  - 에스크로 메커니즘
  - 고정가/제안 거래
  - 부분 거래 지원
  - 플랫폼 수수료 (2.5%)
  - ERC-20/721/1155 지원

- **FluxAccessHub**: 
  - 중앙 권한 관리 시스템
  - 시간 잠금 메커니즘
  - 역할 위임 시스템
  - 긴급 대응 시스템
  - 다중 서명 지원
  - 컨트랙트 레지스트리

#### 2. 테스트 및 최적화
- **97개 테스트 모두 통과** ✅
- 가스 최적화 완료 (immutable 변수 사용으로 3.5% 절감)
- Slither 보안 분석 완료
- OpenZeppelin v5 호환성 확보

#### 3. 문서화
- PRD (제품 요구사항 문서)
- 아키텍처 설계 문서 (토큰, NFT, 거래, 접근제어)
- 수익 모델 (연 $19.8M 예상)
- 태스크 분할 (43개 메인, 215개 서브태스크)
- Docker 실행 가이드

#### 4. 개발 환경
- Hardhat 설정 완료
- Docker 환경 구성 (docker-compose)
- 배포 스크립트 작성
- 테스트 자동화

### 기술 스택
- **언어**: Solidity 0.8.24
- **프레임워크**: Hardhat
- **라이브러리**: OpenZeppelin v5
- **블록체인**: Polygon Layer 2
- **개발도구**: Docker, TypeScript, Ethers.js

### 프로젝트 구조
```
flux-blockchain/
├── contracts/           # 스마트 컨트랙트 (2,025줄)
│   ├── FluxToken.sol
│   ├── FluxGameAsset.sol
│   ├── FluxMarketplace.sol
│   ├── FluxAccessHub.sol
│   └── interfaces/     
├── test/               # 테스트 코드 (1,850줄)
├── scripts/            # 배포 스크립트
├── docs/               # 문서
└── docker-compose.yml  # Docker 설정
```

## Development Commands

```bash
# 컴파일
npm run compile

# 테스트
npm test

# 로컬 노드 실행
npm run node

# 배포
npm run deploy:local    # 로컬
npm run deploy:mumbai   # Mumbai 테스트넷
npm run deploy:polygon  # Polygon 메인넷

# Docker 실행
npm run docker:start    # 대화형 메뉴
npm run docker:build    # 이미지 빌드
npm run docker:test     # 테스트 실행
```

## Key Features & Implementation Notes

### 1. 토큰 이코노미
- 총 발행량 420억 개 (고정)
- 소각 메커니즘 (수수료의 10%)
- 스테이킹 APY 10-20%

### 2. 수수료 구조
- 거래 수수료: 2.5%
- NFT 로열티: 5% (창작자 2.5% + 플랫폼 2.5%)
- 브리지 수수료: 0.1%

### 3. 보안 기능
- ReentrancyGuard 적용
- 역할 기반 접근 제어 (RBAC)
- 시간 잠금 (최소 1시간)
- 긴급 정지 기능

### 4. 수익 모델
- 예상 월 수익: $1,650,000
- 예상 연 수익: $19,800,000
- 초기 토큰 판매: $42M~$210M

## Recent Updates

### 2025-09-01
- ✅ TASK-001: 토큰 컨트랙트 구현 완료
- ✅ TASK-002: NFT 컨트랙트 구현 완료
- ✅ TASK-003: 기본 거래 시스템 완료
- ✅ TASK-004: 접근 제어 시스템 완료
- 97개 테스트 모두 통과
- Docker 환경 구성 완료

## Next Steps (TODO)

### 단기 계획
1. **TASK-005**: JavaScript/TypeScript SDK 개발
2. **TASK-006**: 거버넌스 시스템 구현
3. **TASK-007**: 스테이킹 메커니즘 구현
4. Mumbai 테스트넷 배포
5. 프론트엔드 개발 시작

### 장기 계획
- 크로스체인 브리지 개발
- DeFi 기능 확장 (대출, 유동성 풀)
- 게임 파트너십 확보
- 보안 감사 진행
- 메인넷 출시

## Notes for Claude Code

1. **테스트 우선**: 모든 기능은 테스트와 함께 구현됨
2. **가스 최적화**: immutable, 비트 패킹 등 적극 활용
3. **보안 최우선**: OpenZeppelin 라이브러리 사용, 재진입 방지
4. **문서화**: 모든 주요 결정사항과 아키텍처 문서화
5. **Docker 지원**: 개발 환경 일관성 보장

## Integration Points

### Flux Game 통합
- 게임 내 아이템을 NFT로 발행
- FLUX 토큰을 게임 내 화폐로 사용
- 게임 서버와 블록체인 연동

### Flux RAG 통합
- 스마트 컨트랙트 분석 도구
- 자동 문서 생성
- 보안 취약점 검사

## Important Links

- GitHub: https://github.com/jeromwolf/flux-blockchain
- 문서: /docs 디렉토리 참조
- 테스트: /test 디렉토리 참조