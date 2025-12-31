# 📖 Hướng Dẫn Sử Dụng Director Chat

## Mục Lục
1. [Giới Thiệu](#giới-thiệu)
2. [Các Lệnh Cơ Bản](#các-lệnh-cơ-bản)
3. [Composite - Ghép Vật Thể](#composite---ghép-vật-thể)
4. [Insert Scene - Chèn Cảnh Mới](#insert-scene---chèn-cảnh-mới)
5. [Sync Style - Đồng Bộ Phong Cách](#sync-style---đồng-bộ-phong-cách)
6. [Mẹo & Thủ Thuật](#mẹo--thủ-thuật)

---

## Giới Thiệu

Director Chat là tính năng chat với AI để điều khiển quá trình tạo ảnh. Thay vì phải chỉnh sửa thủ công từng scene, bạn chỉ cần **nói** với Director những gì bạn muốn.

### Mở Director Chat
1. Nhìn góc dưới bên trái màn hình
2. Có ô input với placeholder: *"Type a command..."*
3. Gõ lệnh và nhấn Enter

---

## Các Lệnh Cơ Bản

### Tạm Dừng / Tiếp Tục
```
Dừng lại
Stop
```

### Tạo Lại Cảnh
```
Tạo lại cảnh 5
Regenerate scene 3 đến 7
```

### Đổi Style
```
Đổi sang phong cách anime
Style: Pixar 3D
```

---

## Composite - Ghép Vật Thể

### Mục đích
Lấy một vật thể từ cảnh này và **ghép vào** cảnh khác.

### Cú Pháp
```
Lấy [vật thể] từ cảnh [X] đặt vào cảnh [Y]
```

### Ví Dụ

| Prompt | Kết Quả |
|--------|---------|
| `Lấy chiếc cặp từ cảnh 2 đặt lên bàn ở cảnh 1` | Cảnh 1 sẽ có thêm chiếc cặp |
| `Tham chiếu cảnh 3, thêm cái ghế vào cảnh 1` | Ghế từ cảnh 3 xuất hiện ở cảnh 1 |
| `Copy cái bàn scene 5 sang scene 2` | Bàn được copy |

### Lưu Ý Quan Trọng
- **Cảnh nguồn** (Source): Cảnh chứa vật thể bạn muốn copy → KHÔNG bị thay đổi
- **Cảnh đích** (Target): Cảnh sẽ được chỉnh sửa → THÊM vật thể mới
- Mô tả **rõ ràng** vật thể (màu sắc, vị trí) để AI nhận diện tốt hơn

### Console Log Đúng
```
✅ [Director] COMPOSITE_OBJECT_TRANSFER
✅ [ImageGen] 🎯 COMPOSITE Mode: Extracting object: chiếc cặp
```

---

## Insert Scene - Chèn Cảnh Mới

### Mục đích
Chèn cảnh mới **dựa trên** cảnh đã có, với góc máy khác.

### Cú Pháp
```
Chèn [sau/trước] cảnh [X], [mô tả góc máy]
```

### Ví Dụ Thay Đổi Góc Máy

| Prompt | Kết Quả |
|--------|---------|
| `Chèn sau cảnh 1, zoom vào tay chú mèo` | Cảnh mới với close-up tay mèo |
| `Thêm dưới cảnh 2, góc wide shot` | Cảnh mới với góc rộng |
| `Insert after scene 3, medium shot` | Cảnh mới với medium shot |

### Keywords Được Nhận Diện
- `zoom` - Zoom in/out
- `close-up` / `closeup` - Cận cảnh
- `wide` - Góc rộng
- `medium` - Góc trung bình
- `long` - Góc xa
- `pan` - Quay ngang
- `angle` - Góc máy
- `shot` - Góc cảnh

### Console Log Đúng
```
✅ [Director] INSERT_SCENE - ANGLE CHANGE mode, skipping referenceImage
✅ [Director] Passing Previous Image as Base Image for Continuity Insert
✅ hasBaseImageMap: true
```

### Lưu Ý
- Cảnh gốc được dùng làm **base** để giữ identity nhân vật
- AI sẽ tạo **góc máy mới** theo yêu cầu
- Nhân vật, bối cảnh giữ nguyên, chỉ đổi góc nhìn

---

## Sync Style - Đồng Bộ Phong Cách

### Mục đích
Làm cho cảnh này **giống** cảnh kia về mặt phong cách, ánh sáng, màu sắc.

### Cú Pháp
```
Cảnh [X] giống cảnh [Y]
Sync cảnh [X] với cảnh [Y]
```

### Ví Dụ
```
Cảnh 5 giống cảnh 1
Sync scene 3 với scene 2
Làm cảnh 4 giống như cảnh 2 đi
```

---

## Mẹo & Thủ Thuật

### 1. Mô Tả Chi Tiết
❌ `Thêm cái gì đó vào cảnh 1`  
✅ `Thêm cái ghế gỗ màu nâu từ cảnh 3 vào góc trái cảnh 1`

### 2. Kiểm Tra Console
Mở DevTools (F12) để xem log:
- `🎯 COMPOSITE Mode` = Đang ghép vật thể
- `🧬 DNA Reference` = Đang giữ style
- `Angle Change Detected: true` = Đang đổi góc máy

### 3. Hard Refresh Khi Cần
Nếu có lỗi lạ, thử `Cmd+Shift+R` (Mac) hoặc `Ctrl+Shift+R` (Windows)

### 4. Chờ Hoàn Thành
- Xem thanh trạng thái **DIR: SUCCESS** trước khi ra lệnh mới
- Tránh spam nhiều lệnh liên tiếp

### 5. Sử Dụng Tiếng Việt Hoặc Anh
Director Chat hiểu cả hai ngôn ngữ!

---

## Câu Hỏi Thường Gặp

### Q: Vật thể không xuất hiện sau khi ghép?
**A:** Kiểm tra Console xem có `🎯 COMPOSITE Mode` không. Nếu thấy `🧬 DNA` thay vào, có thể lệnh chưa rõ ràng.

### Q: Góc máy không đổi khi insert scene?
**A:** Đảm bảo dùng keyword như `zoom`, `wide`, `close-up` trong lệnh.

### Q: Lỗi 404 khi tạo ảnh?
**A:** Kiểm tra API Key có hợp lệ không trong Settings.

---

**Chúc bạn sáng tạo vui vẻ! 🎬**
