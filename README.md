# Lá Chắn Tâm Mạch (CardioShield)

**Lá Chắn Tâm Mạch** là một ứng dụng hỗ trợ quyết định lâm sàng và chẩn đoán y khoa hiện đại dành cho bác sĩ tim mạch, tập trung vào việc tính toán, phân loại nguy cơ tim mạch và quản lý điều trị hạ lipid máu theo bản cập nhật hướng dẫn **ESC/EAS 2025 Focused Update**.

Ứng dụng kết hợp giữa **thuật toán đối chiếu y văn chính xác (không AI)** cho các tính toán lâm sàng cốt lõi và **AI Agent đa chuyên khoa** để cung cấp các góc nhìn tư vấn lâm sàng sâu rộng và tự động hóa sinh ảnh chân dung bệnh nhân.

---

## 🌟 Tính Năng Cốt Lõi

1. **Phân Loại Nguy Cơ Tim Mạch Tự Động (ESC/EAS 2025)**:
   - Tự động đánh giá nhóm nguy cơ (Thấp, Trung bình, Cao, Rất cao) dựa trên vùng địa lý dịch tễ học của ESC.
   - Xác định chính xác đích LDL-C cần đạt và tỷ lệ phần trăm LDL-C cần giảm thêm.
   - Đối chiếu trực tiếp với ma trận điều trị hạ lipid máu 4 ô tiêu chuẩn ESC/EAS 2025.

2. **Hệ Thống AI Agent Đa Chuyên Khoa (MDT - Multi-Disciplinary Team)**:
   - Đồng thời lấy ý kiến tư vấn từ 5 chuyên gia AI độc lập:
     - **Bác sĩ Tim mạch (Cardiologist)**: Đánh giá nguy cơ xơ vữa động mạch và biến cố tim mạch.
     - **Chuyên gia Lipid máu (Lipidologist)**: Tối ưu hóa phác đồ dùng statin, ezetimibe, bempedoic acid, và kháng thể PCSK9i.
     - **Bác sĩ Nội tiết (Endocrinologist)**: Đánh giá ảnh hưởng của Đái tháo đường (T1DM/T2DM) và các biến chứng lên mạch máu.
     - **Bác sĩ Thận học (Nephrologist)**: Đánh giá bệnh thận mạn (CKD) và cảnh báo tương tác thuốc hạ mỡ máu (đặc biệt khi eGFR thấp).
     - **Chuyên gia Dược lý (Pharmacologist)**: Phân tích tương tác thuốc, phản ứng có hại (ADR) như đau cơ do statin, gút cấp do bempedoic acid.

3. **Tạo Ảnh Chân Dung Bệnh Nhân Bằng AI**:
   - Sử dụng mô hình tạo ảnh **NVIDIA FLUX** để tự động tạo ảnh đại diện trực quan cho bệnh nhân dựa trên độ tuổi, giới tính, tình trạng lâm sàng và trạng thái sinh tồn.

4. **Quản Lý Bệnh Án Theo Tiến Trình (Visits History)**:
   - Theo dõi tiến trình điều trị qua nhiều giai đoạn khác nhau (khởi trị, tăng liều, phối hợp thuốc, đích đạt hoặc các biến cố lâm sàng).
   - Hỗ trợ định tuyến động theo từng bệnh nhân qua URL `/patients/[id]`.

---

## 🛠️ Công Nghệ Sử Dụng

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Ngôn ngữ**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Xử lý văn bản**: React Markdown & Remark GFM
- **Tích hợp LLM**: LangChain (@langchain/core, @langchain/openai) kết nối qua OpenRouter.

---

## 📂 Cấu Trúc Thư Mục Chính

```text
src/
├── app/
│   ├── (dashboard)/       # Route Group cho trang quản trị
│   │   ├── patients/      # Trang quản lý hồ sơ bệnh nhân
│   │   │   ├── [id]/      # Trang chi tiết bệnh nhân (Dynamic Route)
│   │   │   └── page.tsx   # Tự động redirect về bệnh nhân đầu tiên
│   │   ├── ai-agent/      # Panel tương tác với AI Agent chuyên khoa
│   │   └── settings/      # Trang cấu hình API Keys và mô hình AI
│   ├── actions/           # Server Actions gọi APIs (OpenRouter, NVIDIA FLUX)
│   ├── globals.css        # Cấu hình Tailwind CSS v4 & Biến giao diện CSS
│   └── layout.tsx         # Layout gốc của ứng dụng
├── components/            # UI Components tái sử dụng
│   ├── layout/            # DashboardShell, thanh menu và footer
│   └── workspace/         # Panel trạng thái, Sidebar bệnh nhân, Chat AI...
├── context/               # React Context quản lý trạng thái chung (AppContext)
├── lib/                   # Thư viện thuật toán tính toán nguy cơ và dữ liệu mẫu
│   ├── agents/            # Prompts hệ thống cho các chuyên khoa AI
│   └── risk.ts            # Logic tính toán nguy cơ & đối chiếu ESC/EAS 2025
```

---

## 🚀 Hướng Dẫn Cài Đặt và Chạy Dự Án

### Yêu cầu hệ thống
- **Node.js** >= 18.0.0
- **npm** hoặc **yarn** / **pnpm**

### Bước 1: Cài đặt thư viện
Chạy lệnh sau tại thư mục gốc của dự án để cài đặt các dependency:
```bash
npm install
```

### Bước 2: Chạy môi trường phát triển (Development mode)
```bash
npm run dev
```
Ứng dụng sẽ được khởi chạy tại địa chỉ: [http://localhost:3000](http://localhost:3000).

### Bước 3: Cấu hình API Keys (Trong giao diện ứng dụng)
Khi mở ứng dụng, truy cập vào tab **Cấu hình** ở menu bên trái để nhập các khóa API:
1. **OpenRouter API Key**: Dùng cho tính năng hội chẩn AI Agent đa chuyên khoa (khuyên dùng mô hình `deepseek/deepseek-r1` hoặc các mô hình tối ưu khác từ OpenRouter).
2. **NVIDIA API Key**: Dùng để gọi API tạo ảnh chân dung bệnh nhân bằng mô hình FLUX của NVIDIA.

---

## 🩺 Quy Trình Tính Toán Lâm Sàng Cốt Lõi (Theo ESC/EAS 2025)

Hệ thống đánh giá qua 3 bước nghiêm ngặt:
1. **Phân nhóm nguy cơ**:
   - Nếu có **ASCVD** (Bệnh tim mạch do xơ vữa đã xác định) -> Tự động xếp vào nhóm **Nguy cơ rất cao (Very High Risk)**.
   - Nếu có các modifiers khác (FH - Tăng cholesterol gia đình, CKD - Bệnh thận mạn, Đái tháo đường biến chứng...) -> Xếp vào nhóm **Nguy cơ cao hoặc Rất cao**.
   - Nếu không có biến cố -> Dựa trên ma trận vùng dịch tễ nguy cơ của ESC và các thông số huyết áp, lipid máu, tuổi tác để tính nhóm nguy cơ.
2. **Xác định đích LDL-C**:
   - Nhóm nguy cơ rất cao: LDL-C mục tiêu `< 1.4 mmol/L` và phải giảm `> 50%` so với LDL-C nền.
   - Nhóm nguy cơ cao: LDL-C mục tiêu `< 1.8 mmol/L` và phải giảm `> 50%`.
3. **Đối chiếu ma trận**:
   - Xác định vị trí của bệnh nhân trên bảng ma trận điều trị để đề xuất hướng can thiệp thuốc phù hợp.
