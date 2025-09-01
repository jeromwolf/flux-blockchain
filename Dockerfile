# Node.js 18 Alpine 이미지 사용 (가볍고 보안성 높음)
FROM node:18-alpine

# 필요한 시스템 패키지 설치
RUN apk add --no-cache git python3 make g++

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci --only=production
RUN npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# 소스 코드 복사
COPY . .

# 컨트랙트 컴파일
RUN npx hardhat compile

# 포트 노출 (Hardhat 노드용)
EXPOSE 8545

# 기본 명령어 (Hardhat 노드 실행)
CMD ["npx", "hardhat", "node"]