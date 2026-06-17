#!/bin/bash

echo "==========================================="
echo "   KHỞI ĐỘNG HỆ THỐNG (START SCRIPT)       "
echo "==========================================="

echo "[1/2] Khởi động OpenClaw Gateway (Docker)..."
cd ./openclaw
docker compose up -d
echo "✅ Đã khởi động OpenClaw Gateway"

echo ""
echo "[2/2] Khởi động Next.js Frontend..."
cd ..
echo "Đang mở server Next.js (bạn có thể bấm Ctrl+C để dừng giao diện bất kỳ lúc nào)..."
npm run dev
