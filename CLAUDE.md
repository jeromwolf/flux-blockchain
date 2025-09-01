# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Flux Blockchain - 블록체인 관련 프로젝트 (초기 설정 단계)

This is a new blockchain project that is part of the Flux ecosystem, which includes:
- **flux-game**: 모바일 우선 웹 게임 플랫폼
- **flux-rag**: RAG (Retrieval-Augmented Generation) AI 시스템
- **flux-blockchain**: 블록체인 기술 구현 (현재 프로젝트)

## Development Commands

현재 프로젝트가 초기화되지 않은 상태입니다. 블록체인 프레임워크 선택 후 다음과 같은 명령어들이 추가될 예정:

### 예상되는 명령어 (프레임워크별):

**Hardhat (Ethereum):**
```bash
npm install
npm run compile
npm run test
npm run deploy
```

**Foundry:**
```bash
forge build
forge test
forge deploy
```

**Anchor (Solana):**
```bash
anchor build
anchor test
anchor deploy
```

## Architecture

### 현재 상태
- 프로젝트 디렉토리만 생성된 상태
- `.claude/` 설정 디렉토리 존재 (권한 설정 포함)

### 예상 구조
블록체인 프로젝트의 일반적인 구조:
```
flux-blockchain/
├── contracts/          # 스마트 컨트랙트 코드
├── scripts/           # 배포 및 상호작용 스크립트
├── test/              # 컨트랙트 테스트
├── frontend/          # DApp 프론트엔드 (선택사항)
├── hardhat.config.js  # 또는 foundry.toml 등
└── package.json       # Node.js 의존성
```

## Key Decisions & Implementation Notes

### 초기 설정 시 고려사항:
1. **블록체인 플랫폼 선택**: Ethereum, Solana, Polygon 등
2. **개발 프레임워크**: Hardhat, Foundry, Truffle, Anchor 등
3. **프로그래밍 언어**: Solidity, Rust, Vyper 등
4. **테스트 전략**: 유닛 테스트, 통합 테스트, 포크 테스트
5. **보안 고려사항**: 감사(Audit), 모범 사례 준수

### Flux 생태계 통합:
- flux-game과의 토큰/NFT 통합 가능성
- flux-rag를 활용한 스마트 컨트랙트 분석 도구 개발 가능성

## Recent Updates

### 2025-09-01
- 프로젝트 디렉토리 생성
- 초기 CLAUDE.md 파일 작성
- Flux 생태계의 세 번째 프로젝트로 시작

## Future Plans

### 단기 계획:
1. 블록체인 플랫폼 및 프레임워크 선택
2. 개발 환경 설정 (package.json, 설정 파일 등)
3. 기본 스마트 컨트랙트 템플릿 작성
4. 테스트 환경 구축

### 장기 계획:
- Flux 게임 플랫폼과의 통합 (게임 내 토큰/NFT)
- DeFi 기능 구현
- 거버넌스 시스템 구축
- 크로스체인 기능 개발

## Notes for Claude Code

1. 프로젝트가 초기 단계이므로 프레임워크 선택 시 사용자의 요구사항을 확인하세요
2. 다른 Flux 프로젝트들과의 일관성을 유지하세요 (코딩 스타일, 문서화 등)
3. 블록체인 개발의 보안 모범 사례를 항상 준수하세요
4. 테스트 작성을 우선시하세요 - 스마트 컨트랙트는 불변성을 가지므로 버그 예방이 중요합니다
5. Gas 최적화와 보안 사이의 균형을 고려하세요