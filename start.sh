#!/bin/bash

echo "==========================================="
echo "   KHỞI ĐỘNG HỆ THỐNG (START SCRIPT)       "
echo "==========================================="

echo "[1/3] Khởi động Ollama..."
# Kiểm tra xem Ollama đã chạy chưa (để hỗ trợ cả WSL gọi qua Windows)
if curl -s -f -o /dev/null "http://127.0.0.1:11434/api/tags"; then
    echo "✅ Ollama đang chạy sẵn (trên cổng 11434)."
else
    # Thử khởi động qua systemctl
    sudo systemctl start ollama 2>/dev/null
    # Nếu không phải service, chạy dưới background
    if ! pgrep -x "ollama" > /dev/null
    then
        ollama serve > /dev/null 2>&1 &
        sleep 2
    fi
    echo "✅ Đã gửi lệnh khởi động Ollama."
fi

echo ""
echo "[2/3] Khởi động OpenClaw Gateway (Docker)..."
cd /mnt/d/SDH/MonDangHoc/7.YKhoa/demo/lcld/openclaw
docker compose up -d
echo "✅ Đã khởi động OpenClaw Gateway"

echo ""
echo "[3/3] Khởi động Next.js Frontend..."
cd /mnt/d/SDH/MonDangHoc/7.YKhoa/demo/lcld
echo "Đang mở server Next.js (bạn có thể bấm Ctrl+C để dừng giao diện bất kỳ lúc nào)..."
npm run dev
