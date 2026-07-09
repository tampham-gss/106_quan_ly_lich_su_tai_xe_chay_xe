# 106 — Quản lý hoạt động tài xế (Prototype)

Prototype React + Vite cho màn hình **Quản lý hoạt động tài xế**, gồm 2 tab:

## Tab Lịch sử chạy xe
- Bộ lọc: Từ ngày, Đến ngày, Khu vực, Tài xế, Xe
- Bảng: Tài xế, Xe (danh sách ngăn cách dấu phẩy), Từ ngày, Đến ngày
- Gom nhóm theo tài xế; nếu 1 tài xế chạy nhiều xe trong khoảng lọc thì có dòng phụ mở rộng (tham khảo prototype 105)

## Tab Vi phạm (CRUD)
- Thêm / Sửa / Xóa bản ghi vi phạm
- Các cột: Ngày vi phạm, Hình thức quan sát, Số phương tiện, Loại phương tiện, Chi nhánh, Nhân sự vi phạm, Nội dung vi phạm, Phân loại lỗi, Ca trực ghi nhận, Kết quả
- Danh sách chọn có sẵn cho Nội dung / Phân loại lỗi / Ca trực, hỗ trợ nhập thêm

## Chạy prototype

```bash
npm install
npm run dev
```

Mở trình duyệt tại địa chỉ Vite hiển thị (thường là http://localhost:5173).
