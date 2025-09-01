# Flux Blockchain

The Interplanetary Digital Asset Protocol - 차세대 게임 자산 및 디지털 경제 플랫폼

## 프로젝트 개요

Flux Blockchain은 게임과 현실 경제를 연결하는 글로벌 블록체인 인프라입니다. 지구에서 시작해 화성까지, 인류가 다행성 종족이 되는 미래에 필요한 범우주적 디지털 경제 시스템을 구축합니다.

## 기술 스택

- **블록체인**: Polygon (Layer 2)
- **스마트 컨트랙트**: Solidity 0.8.x
- **개발 프레임워크**: Hardhat
- **백엔드**: Node.js, TypeScript, NestJS
- **테스트**: Chai, Waffle

## 프로젝트 구조

```
flux-blockchain/
├── contracts/          # 스마트 컨트랙트
├── scripts/           # 배포 스크립트
├── test/              # 테스트 파일
├── sdk/               # JavaScript/TypeScript SDK
├── docs/              # 문서
└── backend/           # API 서버
```

## 개발 시작하기

### 필수 조건

- Node.js v18+
- npm or yarn
- Git

### 설치

```bash
# 의존성 설치
npm install

# 환경 설정
cp .env.example .env

# 컴파일
npm run compile

# 테스트
npm run test

# 로컬 노드 실행
npm run node

# 배포 (로컬)
npm run deploy:local
```

## 주요 기능

### Phase 1 (MVP)
- [ ] ERC-20 $FLUX 토큰
- [ ] ERC-721/1155 NFT 지원
- [ ] P2P 거래 시스템
- [ ] JavaScript/TypeScript SDK

### Phase 2 (게임 통합)
- [ ] Flux Game 연동
- [ ] NFT 마켓플레이스
- [ ] 다양한 지갑 지원

### Phase 3 (고급 기능)
- [ ] AI 가격 예측
- [ ] DeFi (스테이킹, 유동성 풀)
- [ ] 크로스체인 브리지

### Phase 4 (SF 혁신)
- [ ] VR/AR NFT
- [ ] AI 경제 시스템
- [ ] 우주 경제 인프라

## 문서

- [PRD (Product Requirements Document)](./PRD.md)
- [태스크 목록](./TASKS.md)
- [상세 태스크](./DETAILED_TASKS.md)
- [Claude 가이드](./CLAUDE.md)

## 기여하기

기여를 환영합니다! PR을 제출하기 전에 다음을 확인해주세요:

1. 코드 스타일 가이드 준수
2. 모든 테스트 통과
3. 문서 업데이트

## 라이선스

MIT License

## 연락처

- GitHub: [@flux-blockchain](https://github.com/flux-blockchain)
- Discord: [Flux Community](https://discord.gg/flux)

---

*"우리는 단순한 블록체인 게임 플랫폼을 만드는 것이 아닙니다. 우리는 인류가 다행성 종족이 되는 미래를 준비하고 있습니다."*