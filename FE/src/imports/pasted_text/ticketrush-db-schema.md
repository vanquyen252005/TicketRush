TÀI LIỆU ĐẶC TẢ HỆ THỐNG - TICKETRUSH

Dự án: TicketRush - Nền tảng phân phối vé sự kiện (INT3306)
Phiên bản: 2.0.0 (Bản hoàn chỉnh tích hợp Database & UI/UX Logic)
Mục tiêu: Xây dựng nền tảng đặt vé chịu tải cao (High-Concurrency), xử lý tranh chấp vé thời gian thực (Real-time Race Condition), quản trị sự kiện động và tích hợp luồng soát vé tại cổng.

PHẦN I: THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE SCHEMA)

1. Tổng quan các bảng (7 Bảng)

Hệ thống sử dụng cơ sở dữ liệu quan hệ với các khóa chính dạng UUID (BINARY(16)) cho các bảng giao dịch lớn để tối ưu việc scale hệ thống phân tán.

users: Quản lý người dùng và xác thực.

events: Quản lý thông tin sự kiện.

zones: Quản lý khu vực sân khấu, phân hạng vé và giá niêm yết.

seats: Quản lý chi tiết từng ghế và trạng thái giữ chỗ (lock).

bookings: Quản lý phiên giao dịch / đơn đặt vé tổng thể.

booking_items: Chi tiết từng vé (đóng vai trò là Vé điện tử - E-Ticket).

payment_transactions: Lịch sử các phiên thanh toán với đối tác thứ 3.

2. Đặc tả chi tiết từng bảng

2.1. Bảng users (Người dùng)

Mục đích: Lưu thông tin tài khoản người dùng, hỗ trợ Local & Social Login.

Cột

Kiểu dữ liệu

Mô tả

id

BINARY(16)

Primary key (UUID)

auth_provider

ENUM

Phương thức đăng nhập ('LOCAL', 'GOOGLE')

google_id

VARCHAR(100)

ID định danh từ Google (nếu login bằng Gmail)

email

VARCHAR(100)

Email đăng nhập / nhận vé

password

VARCHAR(255)

Mật khẩu (hash) - Null nếu đăng nhập qua Google

full_name

VARCHAR(100)

Họ tên đầy đủ

phone_number

VARCHAR(20)

Số điện thoại liên hệ

date_of_birth

DATE

Ngày sinh

gender

VARCHAR(50)

Giới tính

role

ENUM

Vai trò ('CUSTOMER', 'ADMIN', 'ORGANIZER')

status

ENUM

Trạng thái ('ACTIVE', 'BANNED')

created_at

DATETIME(6)

Ngày tạo tài khoản

updated_at

DATETIME(6)

Ngày cập nhật cuối

2.2. Bảng events (Sự kiện)

Mục đích: Thông tin hiển thị của sự kiện.

Cột

Kiểu dữ liệu

Mô tả

id

BIGINT

Primary key

name

VARCHAR(255)

Tên sự kiện

description

TEXT

Thông tin mô tả chi tiết

location

VARCHAR(255)

Địa điểm tổ chức

start_time

DATETIME(6)

Thời gian bắt đầu sự kiện

end_time

DATETIME(6)

Thời gian kết thúc dự kiến

status

ENUM

Trạng thái ('DRAFT', 'COMING_SOON', 'SELLING', 'SOLD_OUT', 'COMPLETED')

created_at

DATETIME(6)

Ngày tạo

updated_at

DATETIME(6)

Ngày cập nhật

2.3. Bảng zones (Khu vực / Hạng vé)

Mục đích: Gom nhóm ghế theo khu vực (Ví dụ: VIP A, Standard), thiết lập giá niêm yết và màu sắc hiển thị trên sơ đồ UI.

Cột

Kiểu dữ liệu

Mô tả

id

BIGINT

Primary key

event_id

BIGINT

FK -> events.id

name

VARCHAR(100)

Tên khu vực (VD: VIP A, GA-1)

base_price

DECIMAL(10,2)

Giá niêm yết gốc cho khu vực này

color_hex

VARCHAR(7)

Mã màu hiển thị (VD: #FF5733)

capacity

INT

Tổng số ghế/vé tối đa của khu vực này

2.4. Bảng seats (Ghế)

Mục đích: Bản đồ ghế chi tiết, xử lý khóa (lock) chống tranh chấp khi đặt vé.

Cột

Kiểu dữ liệu

Mô tả

id

BIGINT

Primary key

zone_id

BIGINT

FK -> zones.id (Khu vực ghế thuộc về)

row_label

VARCHAR(10)

Hàng (VD: A, B, C)

seat_number

VARCHAR(10)

Số ghế (VD: 01, 02)

status

ENUM

Trạng thái ghế ('AVAILABLE', 'LOCKED', 'BOOKED')

lock_expires_at

DATETIME(6)

Thời điểm tự động nhả ghế nếu người dùng không thanh toán kịp

locked_by_user_id

BINARY(16)

FK -> users.id (User đang tạm thời giữ ghế)

user_id

BINARY(16)

FK -> users.id (User đã mua thành công)

2.5. Bảng bookings (Đơn đặt vé / Giỏ hàng)

Mục đích: Lưu trạng thái của phiên mua vé (có thể gồm nhiều vé).

Cột

Kiểu dữ liệu

Mô tả

id

BINARY(16)

Primary key (UUID)

user_id

BINARY(16)

FK -> users.id

event_id

BIGINT

FK -> events.id

total_amount

DECIMAL(10,2)

Tổng tiền thanh toán

status

ENUM

Trạng thái ('PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED')

payment_transaction_id

VARCHAR(100)

Mã tham chiếu khi thanh toán thành công

expires_at

DATETIME(6)

Thời hạn chót thanh toán của đơn hàng (Đồng bộ với UI Timer)

created_at

DATETIME(6)

Ngày tạo

updated_at

DATETIME(6)

Ngày cập nhật

2.6. Bảng booking_items (Vé điện tử - E-Ticket)

Mục đích: Chi tiết từng chiếc vé bán ra, lưu trữ giá tại thời điểm mua và mã QR phục vụ soát vé.

Cột

Kiểu dữ liệu

Mô tả

id

BINARY(16)

Primary key (UUID)

booking_id

BINARY(16)

FK -> bookings.id

seat_id

BIGINT

FK -> seats.id

seat_label

VARCHAR(50)

Nhãn ghế cố định lưu lại (VD: VIP-A-01)

price_at_purchase

DECIMAL(10,2)

Giá vé thực tế tại thời điểm mua (Tránh lỗi khi giá niêm yết thay đổi)

ticket_code

VARCHAR(50)

Mã vé độc nhất gen thành QR (VD: TR-9A8B7C)

check_in_status

ENUM

Trạng thái sử dụng vé ('UNUSED', 'USED', 'REFUNDED')

checked_in_at

DATETIME(6)

Thời gian quét mã QR qua cổng

2.7. Bảng payment_transactions (Lịch sử thanh toán)

Mục đích: Audit và đối soát với cổng thanh toán (VNPay, Momo, Stripe).

Cột

Kiểu dữ liệu

Mô tả

id

BINARY(16)

Primary key (UUID)

booking_id

BINARY(16)

FK -> bookings.id

user_id

BINARY(16)

FK -> users.id

amount

DECIMAL(12,2)

Số tiền thanh toán

currency

VARCHAR(3)

Loại tiền (VD: VND, USD)

payment_method

ENUM

Phương thức ('CREDIT_CARD', 'MOMO', 'VNPAY', 'BANK_TRANSFER')

status

ENUM

Trạng thái ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED')

gateway_transaction_id

VARCHAR(100)

Mã ID do cổng thanh toán trả về

reference_txn_id

VARCHAR(100)

Mã tham chiếu hoàn tiền (nếu có)

gateway_response_raw

TEXT

JSON response từ cổng thanh toán (Dành cho Debug)

error_message

VARCHAR(255)

Tin nhắn lỗi (nếu thất bại)

created_at

DATETIME(6)

Ngày tạo

updated_at

DATETIME(6)

Ngày cập nhật

3. Các mối quan hệ (Relationships)

users (1) - (N) bookings, payment_transactions

events (1) - (N) zones, bookings

zones (1) - (N) seats

bookings (1) - (N) booking_items

seats (1) - (N) booking_items

bookings (1) - (1) payment_transactions (Thường là 1-1 cho GD thành công)

PHẦN II: SITEMAP & CẤU TRÚC GIAO DIỆN (UI/UX)

Thiết kế chung: Tone màu chủ đạo là Xanh Pastel, phong cách hiện đại, năng động. Header Navigation luôn cố định (fixed) trên đầu trang chứa các liên kết: Trang chủ, Sự kiện, Vé của tôi, Avatar/Đăng nhập.
Dữ liệu Mock: Sử dụng mockData/*.json để render giao diện trong lúc chờ API từ backend.

1. Customer Portal (Khán giả)

Đăng ký / Đăng nhập: Hỗ trợ form cơ bản (SĐT/Email) và Nút Đăng nhập nhanh bằng Google (OAuth2).

Trang chủ (Home): Khám phá sự kiện qua Carousel Banner, Thanh tìm kiếm (Tên, Địa điểm, Thời gian), Lưới sự kiện (Grid view). Có Skeleton Loader khi tải.

Trang chờ ảo (Virtual Queue): Giao diện hàng đợi chống quá tải server.

Trang Chi tiết & Chọn ghế: Interactive Seat Map (Bản đồ chọn ghế tương tác Real-time).

Trang Thanh toán (Checkout): Tóm tắt đơn hàng, đồng hồ đếm ngược giữ ghế.

Trang Cá nhân (Infomation ): Quản lý vé điện tử, hiển thị mã QR soát vé, thông tin về người dùng.

2. Admin Portal (Ban Tổ Chức)

Admin Login: Đăng nhập riêng biệt cho Ban tổ chức (via Gmail hoặc số điện thoại, mật khẩu).

Real-time Dashboard: Thống kê tổng quan (Doanh thu, Lấp đầy sự kiện, biểu đồ về doanh thu và biểu đồ về số lượng vé, vé bán ra của các sự kiện theo từng mốc thời gian có thể điều chính thời gian)

Quản lý Sự kiện (Event Manager): CRUD sự kiện, xem thống kê chi tiết theo từng event (vé bán ra, vé tồn, doanh thu).

Bộ dựng Sơ đồ ghế (Seat Matrix Builder): Công cụ kéo thả/tạo lưới để thiết lập ma trận ghế, phân khu vực (Zones) và áp giá bán.

Admin cũng có quyền đặt vé và xem vé của bản thân. 

PHẦN III: CHI TIẾT LUỒNG LOGIC NGHIỆP VỤ

1. Luồng Khán giả (Customer Flow)

Bước 1: Khám phá & Chọn Sự kiện (Trang chủ)

Sắp mở bán: Nút CTA (Call to Action) bị Disable, hiển thị đồng hồ đếm ngược đến giờ mở bán.

Đang mở bán: Nút CTA chuyển màu Primary (Xanh Pastel), có hiệu ứng "Pulse/Nhịp đập". Khi Click -> Gọi API kiểm tra tình trạng tải của server.

Sold Out (Hết vé): Nút CTA xám, nhãn "Sold Out" vắt chéo ảnh. Nếu hết vé cục bộ (VD: VIP hết, Standard còn), nhãn của khu vực VIP sẽ hiển thị chữ "Hết vé".

Bước 2: Hàng đợi Ảo (Virtual Queue - Flash Sale)

Trigger: Mở khi số lượng kết nối đồng thời (CCU) vượt ngưỡng chịu tải cấu hình.

UI/UX:

Hiển thị ảnh/GIF chờ thư giãn (VD: Mascot hệ thống đang chạy).

Text thông báo: "Bạn đang ở vị trí thứ (105)... Thời gian dự kiến: [02:30]".

Cảnh báo màu Đỏ/Vàng: "Vui lòng KHÔNG F5 để tránh mất lượt".

Thanh tiến trình (Progress bar) tăng dần.

Logic: Khi đến lượt, Server cấp phiên làm việc (Token) qua WebSocket/Polling -> Tự động Redirect vào trang Chọn ghế.

Bước 3: Sơ đồ ghế & Xử lý Tranh chấp (Core Feature)

UI/UX:

Mini-map: Chọn khu vực tổng quan (Click vào Zone A, Zone B).

Seat Matrix: Lưới ghế chi tiết.

Panel giỏ hàng (Bên phải/dưới): Hiện tổng tiền và Đồng hồ đếm ngược giữ ghế (Mặc định ẩn, hiện khi bắt đầu chọn ghế).

Trạng thái Ghế (Seat States):

Available (Trống): Nền xám/trắng, viền xanh. Hover đổi màu. Click để chọn.

Selected (Đang chọn): Màu Vàng/Cam.

Locked (Đang bị người khác giữ): Màu Đỏ. Disable click. (Cập nhật Real-time qua WebSocket).

Sold (Đã bán): Màu Xám đậm, icon X/Gạch chéo. Disable click.

Logic Xử lý Tranh chấp (Race Condition):

Hành động: User A click ghế V-01. Gửi request khóa ghế (lock_expires_at).

Thành công: Ghế chuyển Vàng. Panel hiện: "Bạn có 10:00 để thanh toán".

Thất bại (User B nhanh tay hơn): Trả lỗi ngay lập tức -> Hiển thị Toast Notification: "Ghế V-01 vừa được người khác chọn". Ghế V-01 trên màn hình User A lập tức nháy đỏ và đổi sang trạng thái Locked.

Bước 4: Thanh toán (Checkout)

UI/UX: Bảng tóm tắt (Tên Event, Vị trí ghế, Mã đặt chỗ), Tổng tiền, Input nhập thông tin nhận vé. Nút "XÁC NHẬN THANH TOÁN".

Logic Hết giờ (Timeout):

Đồng hồ đếm ngược chạy liên tục từ Bước 3.

Nếu về 00:00 -> Bắn Popup: "Hết thời gian giữ chỗ" -> Đẩy User về trang Chọn ghế.

Backend Cronjob/Worker tự động chuyển trạng thái ghế trong DB từ LOCKED về AVAILABLE.

Thanh toán thành công: Cập nhật DB (Bảng bookings, booking_items, payment_transactions) -> Sinh mã ticket_code -> Chuyển sang trang "Thành công".

Bước 5: Quản lý Vé & Soát vé (My Tickets)

UI/UX: Vé hiển thị dạng thẻ (Boarding pass).

Logic QR: Click vào vé để hiện QR Code lớn. Tích hợp API Browser để tự động tăng tối đa độ sáng màn hình điện thoại giúp máy quét dễ đọc.

Tại cổng (Check-in): Staff quét mã -> API cập nhật check_in_status = 'USED' và lưu checked_in_at.

2. Luồng Ban Tổ Chức (Admin Flow)

Bước 1: Thiết lập Sự kiện

Nhập thông tin: Tên, Mô tả, Thời gian, Poster.

Bước 2: Thiết lập Sơ đồ ghế (Seat Matrix Builder)

Tạo lưới: Admin nhập số hàng (VD: 10), số cột (VD: 15) -> Hệ thống auto-gen lưới 150 ghế.

Bulk Edit (Sửa hàng loạt): Admin dùng thao tác kéo thả chuột (Drag Selection) để chọn nhiều ghế cùng lúc.

Phân khu & Định giá: Gán tập hợp ghế vừa chọn vào một zone_id (VD: Zone VIP A), thiết lập base_price (VD: 2.000.000đ) và chọn color_hex hiển thị. Lưu vào bảng zones và update seats.

Bước 3: Mở bán

Gạt công tắc (Toggle) Open Sale để cập nhật status sự kiện thành SELLING.

PHẦN IV: QUY TẮC HIỂN THỊ LỖI (ERROR HANDLING)

Để đảm bảo UX mượt mà khi hệ thống chịu tải cao, cần chuẩn hóa các thông báo lỗi:

Lỗi Disconnect (Mất mạng tạm thời): Phủ lớp Overlay xám nhẹ lên toàn màn hình + Text: "Đang kết nối lại với hệ thống... Vui lòng không làm mới trang".

Lỗi Thanh toán từ Gateway: Giữ nguyên giao diện Checkout + Toast: "Có lỗi xảy ra trong quá trình xử lý. Ghế của bạn vẫn được giữ trong [X] phút nữa. Vui lòng thử lại".

Hết vé cục bộ (Zone Sold Out): Xử lý thay đổi Label tag ngay từ màn hình ngoài thay vì để User click vào tận sơ đồ mới báo lỗi.

PHẦN V: THÀNH PHẦN THIẾT KẾ CHO FIGMA (UI COMPONENTS)

Các Dev/Designer cần xây dựng các Master Components sau:

Seat Component: (Kích thước khuyên dùng 24x24px hoặc 32x32px). Cần thiết kế 4 Variants: Available, Selected, Locked, Sold.

Timer Component: Đặt góc phải màn hình, có Animation nháy và đổi sang màu Đỏ khi thời gian < 01:00.

Toast Notification: Khối thông báo nhỏ góc màn hình cho sự kiện Real-time (VD: "Có 500 người đang xem sự kiện này").

Skeleton Loader: Các khối xám nhấp nháy dùng cho trang Home và Danh sách vé trước khi data đổ về để chống cảm giác "đơ/giật".

Disconnect Overlay: Component overlay mờ dùng chung cho toàn dự án khi mất kết nối WebSocket/API.