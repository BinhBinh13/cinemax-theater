# Staff Features Checklist — Movie Schedule & Food/Drink CRUD

Hệ thống: **1 rạp duy nhất** (Theater seed sẵn 1 dòng, không CRUD).
Nguồn yêu cầu: `Cinemax_RDS.docx` (UC-37.x Movie Schedule, UC-38.x Food & Drink, UC-41/42 Room & Seat).

---

## Phase 0 — Vá schema entity (Backend)
- [x] Thêm `endDate` vào `Movie` (dùng để validate ngày set lịch nằm trong khoảng chiếu)
- [x] Thêm `status` (`TheaterStockStatus`) vào `TheaterStock`
- [x] Thêm `imageURL` vào `TheaterStock`
- [x] Chuyển các field status dạng String sang enum (`RoomStatus`, `SeatStatus`, `MovieStatus`, `SeatType`, `ItemTheaterStock`, `MovieScheduleStatus`, `UserStatus`, `TheaterStockStatus`)
- [x] Quyết định `MovieScheduleStatus` = `ACTIVE / INACTIVE` (giữ đơn giản, "đã chiếu xong" tính bằng cách so `endTime` với thời gian hiện tại, không lưu thành state riêng)
- [ ] Xác nhận Room/Seat đã có dữ liệu seed sẵn trong DB để test Schedule (hoặc ai đang làm Room/Seat CRUD)

## Phase 1 — Backend: Movie Schedule CRUD
- [x] `MovieScheduleRepository` (extends JpaRepository) — `features/movieschedule/repositories/`
- [x] Query tìm lịch trùng theo `room_id` trong khoảng thời gian (conflict check, loại trừ chính bản ghi khi update)
- [x] `ScheduleRequest` (movieId, roomId, date, startTime) — `features/movieschedule/dtos/`
- [x] `ScheduleResponse` (id, movie info, room info, startTime, endTime, status) — bỏ `price` vì RDS không có field giá ở form Add/Update Schedule (giá nằm ở Seat)
- [x] `MovieScheduleServiceImpl`:
  - [x] Validate ngày nằm trong `releaseDate` → `endDate` của phim
  - [x] Validate Room tồn tại, status ACTIVE
  - [x] Tính `endTime` = `startTime` + `durationMinutes`
  - [x] Check trùng lịch cùng room (+ buffer 15 phút dọn phòng)
  - [ ] Chặn xoá nếu đã có booking (TODO: cần entity Booking, hiện đang hard-delete không check — nhớ quay lại bổ sung khi có module đặt vé)
- [x] `MovieScheduleController`: GET list (filter theo movieId), GET detail, POST, PUT, DELETE
- [x] `MovieRepository`, `RoomRepository` (mới tạo, chỉ đủ dùng cho Schedule — chưa có Service/Controller riêng cho Movie/Room)
- [x] `ResourceNotFoundException`, `BusinessRuleException`, `GlobalException` (`@RestControllerAdvice`) — dùng chung cho các feature sau
- [x] `ApiPath` (`/api/v1/schedules`)
- [x] `mvn clean compile` chạy thành công (33 file, không lỗi)
- [ ] **Chưa test được qua Postman** — thiếu 2 thứ:
  - [ ] Cấu hình datasource thật trong `application.properties` (đang để comment sẵn, cần điền URL/username/password SQL Server)
  - [ ] Role STAFF chưa được enforce — đang tạm `SecurityConfig` permitAll toàn bộ để API không bị Spring Security khoá mặc định; cần thay bằng JWT + role thật sau (có thể tái dùng cách làm từ project `ats_be`)
- [ ] Test Postman: thêm lịch hợp lệ / thêm lịch trùng giờ (phải lỗi) / sửa / xoá

## Phase 2 — Backend: Food & Drink (TheaterStock) CRUD
- [ ] `TheaterStockRepository` (search theo tên, filter theo status, sort, phân trang)
- [ ] `FoodDrinkRequestDTO` / `FoodDrinkResponseDTO`
- [ ] `TheaterStockService`:
  - [ ] Validate `itemName` unique toàn hệ thống
  - [ ] Validate `quantity >= 1`, `price >= 1000 VND`
  - [ ] Chặn xoá nếu item đã từng bán (TODO: cần entity Order/Invoice, tạm bỏ qua nếu chưa có)
- [ ] `TheaterStockController`: GET list, GET detail, POST, PUT, DELETE — role STAFF
- [ ] Test Postman: thêm item / thêm trùng tên (phải lỗi) / sửa / xoá

## Phase 3 — Frontend: Movie Schedule
- [ ] Sửa `movieService.js`: bỏ mock data, gọi API thật (axios)
- [ ] Nối `ViewListOfScreeningMovies` + `MovieScheduleDetail` vào API thật
- [ ] Form **Add new schedule** (chọn ngày, giờ, room; hiển thị lỗi conflict/validate từ backend)
- [ ] Form **Update schedule** + nút **Delete** (confirm dialog)

## Phase 4 — Frontend: Food & Drink (làm từ đầu)
- [ ] Trang danh sách (search, filter status, sort, phân trang)
- [ ] Form **Add new item** (tên, số lượng, giá, status, upload ảnh)
- [ ] Form **Update item**
- [ ] Nút **Delete** + confirm dialog

## Phase 5 — Kiểm thử end-to-end
- [ ] Chạy full flow trên UI thật: thêm/sửa/xoá lịch chiếu
- [ ] Chạy full flow trên UI thật: thêm/sửa/xoá món ăn/nước uống
- [ ] Kiểm tra thông báo lỗi hiển thị đúng (trùng lịch, trùng tên món, thiếu field)

---

## Ghi chú / Quyết định đã chốt
- Hệ thống chỉ có **1 rạp** → bỏ hẳn UC-40 (CRUD Theater), bỏ rule multi-theater cho Food & Drink.
- `MovieScheduleStatus`: `ACTIVE / INACTIVE`, không lưu `FINISHED` — suy ra từ `endTime` lúc query.
- Còn thiếu entity Booking/Order → 2 rule "chặn xoá khi đã có booking/đã bán" ở Phase 1 & 2 chưa code được, đánh dấu TODO chờ module đặt vé.
