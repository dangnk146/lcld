#!/bin/bash

echo "==========================================="
echo "   DỪNG TẤT CẢ DỊCH VỤ (STOP SCRIPT)       "
echo "==========================================="

echo "[1/3] Dừng Next.js Frontend (Cổng 3000)..."
# Tắt tiến trình Next.js hoặc npm run dev
pkill -f "next dev" 2>/dev/null
pkill -f "npm run dev" 2>/dev/null
# Đảm bảo dọn dẹp port 3000
fuser -k 3000/tcp 2>/dev/null
echo "✅ Đã tắt Next.js"

echo ""
echo "[2/3] Dừng OpenClaw Gateway (Docker)..."
cd /mnt/d/SDH/MonDangHoc/7.YKhoa/demo/lcld/openclaw
docker compose down
echo "✅ Đã tắt OpenClaw Gateway"

echo ""
echo "[3/3] Dừng Ollama..."
# Tắt qua systemctl (nếu cài qua service)
sudo systemctl stop ollama 2>/dev/null
# Tắt trực tiếp tiến trình (nếu chạy tay)
killall ollama 2>/dev/null
echo "✅ Đã tắt Ollama"

echo ""
echo "🎉 Đã dừng toàn bộ hệ thống!"
