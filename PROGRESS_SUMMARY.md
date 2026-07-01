# Tóm tắt tiến độ — Movie Schedule CRUD (Backend)

Ngày: 01/07/2026
Phạm vi: Backend cho chức năng Staff quản lý lịch chiếu phim (`cinemax-theater-be`)

---

## 1. Schema (entity) đã sửa

| File | Thay đổi |
|---|---|
| `entity/Movie.java` | Thêm `endDate` (ngày kết thúc chiếu), đổi `status` sang enum `MovieStatus` |
| `entity/theater/TheaterStock.java` | Thêm `status` (`TheaterStockStatus`), thêm `imageURL` |
| `entity/theater/Room.java` | Đổi `status` sang enum `RoomStatus` |
| `entity/theater/Seat.java` | Đổi `status`/`seatType` sang enum `SeatStatus`/`SeatType` |
| `entity/theater/Schedule.java` | Đổi `status` sang enum `MovieScheduleStatus` (`ACTIVE`/`INACTIVE`) |
| `entity/User.java` | Đổi `status` sang enum `UserStatus` |
| `entity/enums/*.java` (8 file mới) | `MovieStatus`, `RoomStatus`, `SeatStatus`, `SeatType`, `MovieScheduleStatus`, `TheaterStockStatus`, `ItemTheaterStock`, `UserStatus` |

## 2. Code mới cho Movie Schedule CRUD

```
features/movieschedule/
├── repositories/MovieScheduleRepository.java   # JpaRepository + query check trùng lịch theo room
├── dtos/ScheduleRequest.java                   # movieId, roomId, date, startTime (+validation)
├── dtos/ScheduleResponse.java                  # id, movie/room info, startTime, endTime, status
├── mappers/ScheduleMapper.java                 # MapStruct: Schedule -> ScheduleResponse
├── services/MovieScheduleService.java           # interface
├── services/MovieScheduleServiceImpl.java       # toàn bộ business rule (xem mục 3)
└── controllers/MovieScheduleController.java     # REST endpoints (xem mục 4)

features/movie/repositories/MovieRepository.java   # tối thiểu, chỉ để Schedule tra cứu Movie
features/room/repositories/RoomRepository.java     # tối thiểu, chỉ để Schedule tra cứu Room

exception/
├── ResourceNotFoundException.java   # -> HTTP 404
├── BusinessRuleException.java       # -> HTTP 409
└── GlobalException.java             # @RestControllerAdvice, dùng chung cho mọi feature sau này

utils/ApiPath.java                   # hằng số path: /api/v1/schedules
config/SecurityConfig.java           # TẠM permitAll (xem mục 5)
```

## 3. Business rule đã code trong `MovieScheduleServiceImpl`

- Ngày set lịch phải nằm trong khoảng `releaseDate` → `endDate` của phim, và không được là ngày trong quá khứ.
- Room phải tồn tại và đang `ACTIVE`.
- `endTime` = `startTime` + `movie.durationMinutes`.
- Check trùng lịch: so với các schedule khác **cùng room**, **đang ACTIVE**, cộng buffer 15 phút dọn phòng ở cả 2 đầu; khi update thì loại trừ chính bản ghi đang sửa.
- Xoá: hard-delete (đúng theo RDS — không phải soft-delete).

## 4. API đã có (`/api/v1/schedules`)

| Method | Path | Mô tả |
|---|---|---|
| GET | `/api/v1/schedules?movieId=` | Danh sách lịch chiếu của 1 phim |
| GET | `/api/v1/schedules/{id}` | Chi tiết 1 lịch chiếu |
| POST | `/api/v1/schedules` | Tạo lịch mới |
| PUT | `/api/v1/schedules/{id}` | Sửa lịch |
| DELETE | `/api/v1/schedules/{id}` | Xoá lịch |

## 5. Việc còn thiếu / cần bạn quyết định trước khi test

- **Chưa cấu hình datasource** — `application.properties` chỉ có dòng comment mẫu, cần điền URL/username/password SQL Server thật.
- **Chưa có Security/JWT thật** — đang tạm `SecurityConfig` permitAll toàn bộ để API không bị Spring Security khoá mặc định. Role STAFF **chưa được enforce**, cần làm riêng (tái dùng cách đã làm ở `ats_be`).
- **Rule "chặn xoá lịch nếu đã có booking"** chưa code được vì project chưa có entity Booking/Ticket — hiện tại xoá là xoá thẳng không check.
- **Chưa test bằng Postman** — cần làm sau khi có datasource.

## 6. Kết quả build

`mvn clean compile` → **BUILD SUCCESS** (33 file nguồn, MapStruct sinh `ScheduleMapperImpl` đúng, không lỗi compile).

---

Checklist đầy đủ các phase còn lại (Food & Drink, Frontend, test end-to-end): xem [STAFF_TASKS.md](STAFF_TASKS.md).
