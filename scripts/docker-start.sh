#!/bin/bash

echo "🐳 Flux Blockchain Docker Environment"
echo "===================================="

# 색상 정의
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 함수: 도커가 설치되어 있는지 확인
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker가 설치되어 있지 않습니다.${NC}"
        echo "https://www.docker.com/get-started 에서 Docker를 설치해주세요."
        exit 1
    fi
    echo -e "${GREEN}✅ Docker 확인됨${NC}"
}

# 함수: 도커 컴포즈 확인
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose가 설치되어 있지 않습니다.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Docker Compose 확인됨${NC}"
}

# 메인 메뉴
show_menu() {
    echo -e "\n${BLUE}선택하세요:${NC}"
    echo "1) 🚀 전체 환경 시작 (node + deploy)"
    echo "2) 🧪 테스트만 실행"
    echo "3) 📦 빌드만 실행"
    echo "4) 🛑 모든 컨테이너 중지"
    echo "5) 🧹 모든 컨테이너 및 볼륨 제거"
    echo "6) 📊 컨테이너 상태 확인"
    echo "7) 📜 로그 보기"
    echo "0) 종료"
}

# 도커 확인
check_docker
check_docker_compose

while true; do
    show_menu
    read -p "선택: " choice
    
    case $choice in
        1)
            echo -e "\n${BLUE}🚀 Flux Blockchain 환경을 시작합니다...${NC}"
            docker-compose up -d hardhat-node
            echo "⏳ Hardhat 노드가 시작될 때까지 대기 중..."
            sleep 5
            docker-compose up deployer
            echo -e "${GREEN}✅ 배포 완료!${NC}"
            echo -e "\n${BLUE}접속 정보:${NC}"
            echo "- RPC URL: http://localhost:8545"
            echo "- Chain ID: 31337"
            echo "- IPFS Gateway: http://localhost:8080"
            ;;
        2)
            echo -e "\n${BLUE}🧪 테스트를 실행합니다...${NC}"
            docker-compose run --rm test-runner
            ;;
        3)
            echo -e "\n${BLUE}📦 도커 이미지를 빌드합니다...${NC}"
            docker-compose build
            ;;
        4)
            echo -e "\n${BLUE}🛑 모든 컨테이너를 중지합니다...${NC}"
            docker-compose down
            ;;
        5)
            echo -e "\n${RED}⚠️  모든 데이터가 삭제됩니다!${NC}"
            read -p "정말로 진행하시겠습니까? (y/N): " confirm
            if [[ $confirm == "y" || $confirm == "Y" ]]; then
                docker-compose down -v
                echo -e "${GREEN}✅ 정리 완료${NC}"
            fi
            ;;
        6)
            echo -e "\n${BLUE}📊 컨테이너 상태:${NC}"
            docker-compose ps
            ;;
        7)
            echo -e "\n${BLUE}📜 로그 옵션:${NC}"
            echo "1) Hardhat 노드 로그"
            echo "2) 배포자 로그"
            echo "3) 모든 로그"
            read -p "선택: " log_choice
            case $log_choice in
                1) docker-compose logs -f hardhat-node ;;
                2) docker-compose logs deployer ;;
                3) docker-compose logs -f ;;
            esac
            ;;
        0)
            echo -e "\n${GREEN}👋 안녕히 가세요!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}잘못된 선택입니다.${NC}"
            ;;
    esac
done