# Flux Blockchain - Docker 실행 가이드 🐳

## 빠른 시작

### 1. 사전 요구사항
- Docker Desktop 설치
- Docker Compose 설치

### 2. 간단 실행 (추천) 🚀
```bash
# 실행 스크립트 사용
npm run docker:start
```

### 3. 수동 실행
```bash
# 도커 이미지 빌드
docker-compose build

# 전체 환경 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 중지
docker-compose down
```

## 도커 서비스 구성

### 1. **hardhat-node** (블록체인 노드)
- 포트: 8545
- 로컬 블록체인 네트워크 제공
- 10개의 테스트 계정 자동 생성

### 2. **deployer** (스마트 컨트랙트 배포)
- hardhat-node에 컨트랙트 자동 배포
- 배포 정보는 `deployments/docker-deployment.json`에 저장

### 3. **test-runner** (테스트 실행)
- 97개의 모든 테스트 자동 실행
- 커버리지 리포트 생성

### 4. **ipfs** (분산 스토리지)
- 포트: 5001 (API), 8080 (Gateway)
- NFT 메타데이터 저장용

### 5. **ganache-gui** (선택사항)
- 포트: 7545
- 시각적 블록체인 탐색기

## 주요 명령어

```bash
# 도커 환경 시작 (대화형 메뉴)
npm run docker:start

# 이미지 빌드
npm run docker:build

# 컨테이너 시작
npm run docker:up

# 컨테이너 중지
npm run docker:down

# 테스트 실행
npm run docker:test

# 로그 보기
npm run docker:logs
```

## 개발 워크플로우

### 1. 컨트랙트 수정
```bash
# 1. 컨트랙트 수정
# 2. 도커 환경에서 자동 재컴파일
# 3. 테스트 실행
npm run docker:test
```

### 2. 프론트엔드 연결
```javascript
// MetaMask 또는 Web3 Provider 설정
const provider = new ethers.JsonRpcProvider("http://localhost:8545");

// 배포된 컨트랙트 주소 가져오기
const deployment = require('./deployments/docker-deployment.json');
const tokenAddress = deployment.contracts.FluxToken;
```

### 3. 테스트 계정
```
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
Balance: 10000 ETH

Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
Balance: 10000 ETH
```

## 환경 변수 설정

`.env` 파일 생성:
```env
# 배포자 개인키 (선택사항)
DEPLOYER_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# IPFS 설정
IPFS_API_URL=http://localhost:5001
IPFS_GATEWAY_URL=http://localhost:8080
```

## 문제 해결

### 포트 충돌
```bash
# 사용 중인 포트 확인
lsof -i :8545
lsof -i :5001

# 포트 변경 (docker-compose.yml 수정)
ports:
  - "8546:8545"  # 8546으로 변경
```

### 컨테이너 재시작
```bash
# 특정 서비스만 재시작
docker-compose restart hardhat-node

# 전체 초기화
docker-compose down -v
docker-compose up -d
```

### 로그 확인
```bash
# 특정 서비스 로그
docker-compose logs hardhat-node
docker-compose logs deployer

# 실시간 로그
docker-compose logs -f
```

## 프로덕션 배포

### 1. 테스트넷 배포
```bash
# Mumbai 테스트넷
npm run deploy:mumbai

# Polygon 메인넷
npm run deploy:polygon
```

### 2. 도커 이미지 배포
```bash
# 이미지 태그
docker tag flux-blockchain:latest your-registry/flux-blockchain:v1.0.0

# 레지스트리 푸시
docker push your-registry/flux-blockchain:v1.0.0
```

## 모니터링

### 1. 컨테이너 상태
```bash
docker-compose ps
docker stats
```

### 2. 네트워크 상태
```bash
# Hardhat 노드 상태 확인
curl http://localhost:8545 \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### 3. IPFS 상태
```bash
# IPFS 피어 확인
curl http://localhost:5001/api/v0/swarm/peers
```

## 보안 주의사항

⚠️ **주의**: 
- 테스트 계정의 개인키는 공개되어 있으므로 실제 자금을 보내지 마세요
- 프로덕션 환경에서는 환경 변수를 안전하게 관리하세요
- IPFS 게이트웨이는 프로덕션에서 인증을 추가하세요

## 지원

문제가 있으신가요?
- GitHub Issues: [flux-blockchain/issues](https://github.com/flux-blockchain/issues)
- Discord: [Flux Community](https://discord.gg/flux)
- 문서: [docs.fluxblockchain.io](https://docs.fluxblockchain.io)