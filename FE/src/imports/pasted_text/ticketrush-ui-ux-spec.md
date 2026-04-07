TÀI LIỆU ĐẶC TẢ LOGIC UI/UX - TICKETRUSH
Dự án: TicketRush - Nền tảng phân phối vé sự kiện (INT3306)
Phiên bản: 1.0.0
Mục tiêu: Xây dựng luồng giao diện chịu tải cao, xử lý tranh chấp vé thời gian thực và quản trị sự kiện động.

1. SITEMAP (Cấu trúc trang)
1.1. Customer Portal (Khán giả)
Trang chủ (Home): Khám phá sự kiện.

Trang chờ ảo (Virtual Queue): Hàng đợi khi hệ thống quá tải.

Trang Chi tiết Sự kiện & Chọn ghế (Event Detail & Booking): Thông tin + Interactive Seat Map.

Trang Thanh toán (Checkout): Tóm tắt đơn hàng & Xác nhận.

Trang Cá nhân (My Tickets): Quản lý QR Code vé.

1.2. Admin Portal (Ban Tổ Chức)
Đăng nhập (Admin Login): Xác thực quyền.

Real-time Dashboard: Thống kê tổng quan (Doanh thu, Lấp đầy, Demographic).

Quản lý Sự kiện (Event Manager): CRUD sự kiện.

Bộ dựng Sơ đồ ghế (Seat Matrix Builder): Thiết lập ma trận, phân khu, gán giá.

2. CHI TIẾT LUỒNG LOGIC: CUSTOMER (KHÁN GIẢ)
Bước 1: Khám phá & Chọn Sự kiện (Home)
UI Elements: Carousel Banner, Thanh tìm kiếm (Tên, Địa điểm, Thời gian), Lưới danh sách sự kiện (Grid view).

Trạng thái hiển thị Sự kiện:

Sắp mở bán: Nút CTA bị disable, hiện đồng hồ đếm ngược đến giờ G.

Đang mở bán: Nút CTA màu Primary, hiệu ứng "Hot/Pulse".

Sold Out: Nút CTA màu xám, dán nhãn Sold Out chéo trên ảnh.

Logic Action: Người dùng click vào sự kiện Đang mở bán -> Kích hoạt API kiểm tra tình trạng tải của server.

Bước 2: Hàng đợi Ảo (Virtual Queue - Flash Sale Scenario)
Trigger Condition: Nếu số lượng người truy cập (CCU) > Ngưỡng cấu hình của hệ thống.

UI Elements:

Hình ảnh/GIF chờ mang tính thư giãn (Ví dụ: Chibi nghệ sĩ đang chạy).

Text: "Bạn đang ở vị trí thứ [105] trong hàng đợi. Thời gian dự kiến: [02:30]".

Cảnh báo (Màu đỏ/vàng): "Vui lòng KHÔNG tải lại (F5) trang để tránh mất lượt".

Thanh tiến trình (Progress bar) tăng dần.

Logic Action: Khi đến lượt (Hệ thống cấp token qua WebSocket/Polling) -> Auto-redirect người dùng vào Màn hình Chọn ghế.

Bước 3: Trải nghiệm Sơ đồ ghế (Core Feature)
UI Elements:

Mini-map: Sân vận động thu nhỏ, click để chọn Khu vực (Zone A, Zone B).

Seat Matrix: Lưới ghế hiển thị dưới dạng các biểu tượng hình vuông/tròn bo góc.

Panel bên phải/dưới: Tóm tắt ghế đang chọn, Tổng tiền, Đồng hồ đếm ngược (Mặc định ẩn, chỉ hiện khi chọn ghế).

State Machine của một Ghế (Seat States):

[Trống - Available]: Màu Trắng/Xám nhạt viền xanh. Hover có hiệu ứng. Click để chuyển sang [Đang chọn].

[Đang chọn - Selected]: Màu Vàng/Cam. User có thể click lại để bỏ chọn.

[Người khác đang giữ - Locked by other]: Màu Đỏ. Disable click. (Cập nhật Real-time qua WebSocket).

[Đã bán - Sold]: Màu Xám đậm, có icon (x) hoặc gạch chéo. Disable click.

Logic Xử lý Tranh chấp (Race Condition):

Kịch bản: User A click vào ghế V-01. Call API giữ ghế.

Thành công: Ghế chuyển Vàng. Panel hiện: "Bạn có 10:00 để thanh toán".

Thất bại (Do User B nhanh tay hơn 1ms): Bắn Toast notification lỗi "Ghế V-01 vừa được người khác chọn". Ghế V-01 trên màn hình User A lập tức nháy đỏ và chuyển sang trạng thái [Locked].

Bước 4: Thanh toán (Checkout)
UI Elements: Bảng tóm tắt (Tên sự kiện, Vị trí ghế, Mã đặt chỗ), Tổng tiền, Input nhập thông tin người nhận vé (Tên, Email). Nút "XÁC NHẬN THANH TOÁN".

Đồng hồ đếm ngược (Countdown Timer): Tiếp tục chạy từ thời gian còn lại ở Bước 3.

Logic Hết giờ (Timeout): Nếu đồng hồ về 00:00, văng Popup: "Hết thời gian giữ chỗ" -> Kick về trang Chọn ghế. DB tự động trigger Background worker giải phóng (Release) các ghế này thành Available.

Logic Thành công: Click "Xác nhận" -> Chuyển sang màn hình "Thành công", tạo QR Code vé.

Bước 5: Quản lý Vé (My Tickets)
UI Elements: Danh sách vé dạng thẻ (như boarding pass).

Ticket Detail: Hiển thị QR Code lớn, độ sáng màn hình tự động tăng tối đa (nếu làm web mobile).

3. CHI TIẾT LUỒNG LOGIC: ADMIN (BAN TỔ CHỨC)
Bước 1: Real-time Dashboard
UI Elements:

Top Cards: Tổng doanh thu, Số vé đã bán/Tổng vé, Tỷ lệ lấp đầy (%).

Live Traffic Chart: Biểu đồ Line cập nhật mỗi giây (Transactions per second).

Heatmap Sơ đồ: Sơ đồ sân vận động thu nhỏ, khu vực nào bán chạy sẽ có màu đậm hơn (Nóng), khu vực ế màu nhạt (Lạnh).

Audience Demographics: Biểu đồ Pie/Bar về Giới tính, Độ tuổi.

Bước 2: Thiết lập Sự kiện & Sơ đồ ghế (Event & Matrix Setup)
Tạo sự kiện: Nhập Tên, Thời gian, Poster.

UI Matrix Builder (Công cụ tạo sơ đồ):

Admin nhập: Khu vực (Tên: VIP A), Số hàng (Row: 10), Số cột (Col: 15) -> Hệ thống tự Gen ra lưới 150 ghế.

Công cụ Bulk Edit (Sửa hàng loạt): Quét chuột (Drag selection) để chọn nhiều ghế cùng lúc.

Nhập giá cho nhóm ghế vừa chọn (VD: 2.000.000 VNĐ) và lưu lại.

Trạng thái kích hoạt: Admin có nút gạt (Toggle) Open Sale để chính thức mở bán.

4. QUY TẮC HIỂN THỊ LỖI (ERROR HANDLING & EDGE CASES)
Để UX mượt mà nhất trong môi trường High-Concurrency (Tải cao), cần chú ý các thông báo sau trên giao diện:

Lỗi Disconnect (Mất mạng tạm thời): Màn hình xám nhẹ (Overlay) + Text "Đang kết nối lại với hệ thống... Vui lòng không làm mới trang".

Lỗi Thanh toán: "Có lỗi xảy ra trong quá trình xử lý. Ghế của bạn vẫn được giữ trong phút nữa. Vui lòng thử lại".

Hết vé cục bộ (Zone Sold Out): Khi người dùng đang ở ngoài trang chủ, nếu một khu vực hết vé, tag tên khu vực đó đổi thành "Hết vé" thay vì cho người dùng bấm vào rồi mới báo lỗi.

5. THÀNH PHẦN THIẾT KẾ CHO FIGMA (UI COMPONENTS)
Bạn cần tạo các Master Components sau trong Figma trước khi ráp màn hình:

Seat Component: Kích thước khuyên dùng 24x24px hoặc 32x32px. Đặt các Variant: Available, Selected, Locked, Sold.

Timer Component: Đặt ở góc phải màn hình, có hiệu ứng đổi sang màu đỏ khi thời gian < 01:00.

Toast Notification: Khối thông báo nhỏ góc trên hoặc góc dưới màn hình để báo các sự kiện Real-time (VD: "Có 500 người đang xem sự kiện này").

Skeleton Loader: Các khối xám nhấp nháy dùng cho trang Home và trang Danh sách vé trước khi dữ liệu từ API trả về, giúp người dùng không cảm thấy ứng dụng bị đơ.