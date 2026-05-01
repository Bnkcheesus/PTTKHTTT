# PTTKHTTT
# Hệ thống Quản lý Kí túc xá (Dormitory Management System)

Dự án quản lý kí túc xá được xây dựng với kiến trúc Fullstack (React + Node.js) và cơ sở dữ liệu SQL Server.



## Cấu trúc dự án
- **`/frontend`**: Giao diện người dùng (React, Vite, Tailwind CSS).
- **`/backend`**: API Server (Node.js, Express, mssql).
- **`/database`**: Scripts tạo bảng, dữ liệu mẫu và Stored Procedures.


## Hướng dẫn cài đặt 

### 1. Cơ sở dữ liệu (Database)
1. Mở SQL Server và tạo một database tên là `QUANLYKHACHSAN`.
2. Chạy lần lượt các file trong thư mục `/database`:
3. Chạy `python gen_data.py` nếu muốn tạo thêm nhiều dữ liệu ảo.

### 2. Cấu hình Backend
1. Truy cập vào thư mục `backend`: `cd backend`
2. Cài đặt thư viện: `npm install`
3. Copy file `.env.example` thành `.env`:
   - Nếu dùng **Windows Authentication**: Để `DB_TRUSTED_CONNECTION=true`.
   - Nếu dùng **SQL Login**: Điền `DB_USER` và `DB_PASSWORD`.
4. Chạy server: `npm start` hoặc `node src/server.js`.

### 3. Cấu hình Frontend
1. Truy cập vào thư mục `frontend`: `cd frontend`
2. Cài đặt thư viện: `npm install`
3. Chạy ứng dụng: `npm run dev`

---

## Công nghệ sử dụng (Tech Stack)

| Thành phần | Công nghệ |
|---|---|
| **Frontend** | ReactJS, Vite, Tailwind CSS |
| **Backend** | Node.js, Express |
| **Database** | SQL Server (MSSQL) |
| **Authentication** | Windows Authentication / JWT |

---

## Thành viên thực hiện
