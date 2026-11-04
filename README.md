# Mạch Văn

App hỗ trợ viết tiếng Việt, chạy local với Ollama. Bạn giữ quyền tác giả và duyệt mọi chỉnh sửa. Không cần npm hay thư viện Python ngoài.

## Chạy trên máy của bạn

1. Máy cần Python 3.10+; dùng Ollama và Qwen bạn đã cài sẵn, không cần tải lại model.
2. Chạy `ollama serve` nếu Ollama chưa chạy nền.
3. Chạy `ollama list` để xác nhận model đã cài. Tên “qwen 3.8 27b” chưa được xác minh; app không giả định tag này tồn tại. Nếu chưa có model, dùng `ollama pull <tag-chính-xác>` theo danh mục Ollama.
4. Trên Windows, **nhấp đúp `start.bat`** trong thư mục gốc (cạnh `server.py`). App tự mở trình duyệt. Không mở `static/app.js` bằng cách nhấp đúp. Hoặc chạy:

```sh
python server.py
```

5. Mở **http://127.0.0.1:8787**, chọn **Kết nối Ollama**, chọn model thực tế. Trên Windows có thể dùng `py server.py`.

Server mặc định nối Ollama tại `http://127.0.0.1:11434`. Có thể đặt biến môi trường `OLLAMA_URL` để đổi địa chỉ, `PORT` để đổi cổng app. Server chỉ lắng nghe trên loopback. App và Ollama cần chạy trên máy của bạn; localhost trong môi trường cloud không phải máy cá nhân của bạn.

## Sử dụng

- **Thủ công:** bôi đen đoạn trong bản thảo, chọn trau chuốt, chính tả, gợi ý hướng đi, bố cục hoặc nhận diện nhân vật. Chỉ đoạn được chọn được gửi tới model. Chỉ trau chuốt/chính tả có nút áp dụng.
- **Tự động:** sau 3 giây ngừng gõ, gửi toàn chương để đề xuất sửa chính tả. Không tự thay văn bản; bấm áp dụng để duyệt. Bật chế độ trước khi tiếp tục gõ.
- **Bố cục/hướng đi:** AI đề xuất để tác giả tự sửa. Chế độ tự động dùng toàn chương; chế độ thủ công dùng đoạn chọn.
- **Nhân vật & hội thoại:** bấm nhận diện để phân tích toàn chương, hoặc nhận diện đoạn chọn từ khung trợ lý. Chọn tên nhân vật để nhập lời thoại của chính bạn; lời thoại được chèn tại vị trí con trỏ đã lưu. Có thể thêm nhân vật thủ công.
- **Kỹ năng:** bật/tắt văn chương, hội thoại, nhịp truyện/cao trào, nhất quán; nhập chỉ dẫn riêng. Đây là prompt cho model, không phải huấn luyện hoặc nạp kiến thức mới.
- **Bản thảo:** thêm chương, sửa tên, lưu tự động bằng localStorage, xuất/nhập JSON và hoàn tác thay đổi văn bản trong phiên. Xuất bản thảo định kỳ; xóa dữ liệu trình duyệt sẽ xóa bản lưu local.

## Giới hạn bản đầu

- Chưa có tìm kiếm xuyên toàn tiểu thuyết, bộ nhớ nhân vật dài hạn hoặc xuất DOCX/PDF.
- Tự động hiện phân tích chính tả; nhận diện nhân vật và bố cục được gọi bằng nút.
- Chất lượng gợi ý và nhận diện phụ thuộc model, khả năng tiếng Việt, RAM/VRAM và độ dài context. Chương quá dài có thể vượt context model.
- Có chặn áp dụng đề xuất khi nội dung đã thay đổi. Tuy vậy vẫn nên đọc lại, vì AI có thể sửa sai hoặc suy diễn.
- Giao diện dùng font hệ thống và biểu tượng SVG local, không tải tài nguyên từ CDN. Văn bản truyện chỉ gửi tới Ollama qua server local.
- Không có kiểm thử trình duyệt trong môi trường tạo bản này; tích hợp Ollama được kiểm tra bằng mock, chưa chạy model thật.

## Kiểm tra

```sh
python -m unittest -v
node --check static/app.js
node --check static/agent-ui.js
node test_agent_ui.cjs
node test_runtime.cjs
node test_ui.cjs
```


## Trợ lý AI Agent (bản mới)

Bấm nút nổi **Trợ lý AI** ở góc dưới bên phải, hoặc nhấn **Alt + J** (cũng có nút mở ở thanh bên). Agent gọi model đang chọn qua Ollama local, dùng JSON có kiểm tra để điều khiển các thao tác được app cho phép; không yêu cầu model hỗ trợ native tool calling.

- Đọc toàn bộ chương hiện tại, danh sách ID/tên chương, các nhân vật của chương, kỹ năng bật và phong cách riêng. Chưa tự đọc nội dung tất cả chương.
- Trò chuyện, phân tích, gợi ý cách viết, nhịp truyện, cao trào.
- Mở trang, chuyển chương bằng yêu cầu tự nhiên.
- Đề xuất tạo chương rỗng, đổi tên chương, thêm nhân vật và bật/tắt kỹ năng.
- Đề xuất chỉnh sửa: thủ công chỉ sửa đoạn bôi đen; tự động cho phép đề xuất sửa toàn chương. Không tự viết tiếp nội dung chương mới.
- Mọi thay đổi dữ liệu được đưa thành kế hoạch có nút **Duyệt và thực hiện** hoặc **Bỏ qua**. Sửa văn bản có cả đoạn trước/sau để so sánh. Mở trang/chuyển chương đơn thuần được chạy ngay.
- Khi kế hoạch có cả điều hướng và thay đổi dữ liệu, app chỉ cho duyệt thay đổi dữ liệu, không chuyển trang/chương trong cùng lượt để giữ phạm vi sửa.
- Kế hoạch cũ không thể áp dụng khi trạng thái app đã thay đổi. Đoạn sửa đã duyệt có thể hoàn tác bằng ↶ ở bản thảo.
- Hội thoại agent lưu trong bộ nhớ phiên tab, không lưu vào bản xuất JSON; tải lại trang sẽ xóa hội thoại. Mỗi lượt gửi tối đa 12 tin gần nhất cho model.
- Agent không có quyền điều khiển Windows, chạy shell, tải model, xóa chương hoặc truy cập file máy tính.

Ví dụ: “Mở phần kỹ năng AI”, “Tạo chương rỗng tên Cuộc gặp gỡ”, “Thêm Lan vào danh sách nhân vật”, “Bật kỹ năng cao trào”, hoặc bôi đen đoạn rồi sang agent yêu cầu “Trau chuốt đoạn tôi chọn, giữ nguyên ý”.

Chất lượng tuân thủ giao thức tùy model Qwen thực tế. Model trả sai JSON sẽ hiện lỗi, không thực thi. Đã kiểm tra giao thức và API bằng mock, chưa chạy Qwen thật hoặc kiểm thử giao diện bằng trình duyệt trong môi trường này.


## Giao diện mới: sáng/tối và agent nổi

Giao diện được thiết kế lại theo [UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/main/.claude/skills/ui-ux-pro-max/SKILL.md), dựa trên gợi ý cho **Notes & Writing App**. Chi tiết quyết định thiết kế: `design-system/MASTER.md`.

- Nút mặt trăng/mặt trời ở thanh trên chuyển sáng/tối. Trong **Cài đặt**, chọn sáng, tối hoặc theo hệ thống. Lựa chọn được nhớ riêng trên trình duyệt.
- Cỡ chữ bản thảo điều chỉnh từ 16–26px trong Cài đặt, ghi nhớ trên trình duyệt.
- Agent nổi có ở tất cả màn hình; không cần chuyển sang một trang chat riêng. Nhấn **Alt+J** để mở/thu gọn, **Escape** để thu gọn. Hội thoại và câu đang nhập được giữ khi thu gọn; khi phản hồi đến lúc đóng, nút mở có chấm báo. Tải lại trang vẫn xóa hội thoại phiên.
- Agent là khung không chặn app. Nếu một điều khiển nhận focus bàn phím nằm phía sau khung chat, khung tự thu gọn để điều khiển không bị che.
- Toàn bộ giao diện dùng tài nguyên local; có hỗ trợ giảm chuyển động theo hệ điều hành.

### Tối ưu hiệu năng bản mới

- Lưu sau 450ms ngừng gõ, chỉ serialize toàn bản thảo khi thực sự ghi; cố gắng lưu ngay khi ẩn hoặc rời trang. Cần xuất sao lưu để bảo vệ dữ liệu nếu trình duyệt bị đóng đột ngột.
- Đếm từ sau 180ms ngừng gõ, cập nhật danh sách tên chương sau 250ms. Soạn thảo không gọi AI nếu chế độ tự động chưa bật.
- Gộp lịch sử gõ theo cụm 700ms, giới hạn bộ nhớ hoàn tác toàn app 4 MiB. Các đoạn quá lớn có thể không có bản hoàn tác trong ngân sách này.
- Giới hạn hội thoại agent trong bộ nhớ: 24 tin/120.000 ký tự, tối đa 80 khối hiển thị; mỗi tin lưu tối đa 16.000 ký tự, model nhận tối đa 12 tin gần nhất. Chỉ một kế hoạch còn hiệu lực để duyệt.
- App và server chỉ xử lý một lượt suy luận mỗi lần, kể cả nhiều tab; yêu cầu thứ hai được báo bận. Giữ model trong bộ nhớ 5 phút qua `keep_alive`, tùy Ollama và tài nguyên máy.
- Không lặp lại toàn văn chương trong editing scope khi gửi agent. Tối đa 100.000 ký tự cho nội dung một lượt; đây là giới hạn app, không đảm bảo vừa context của mọi model.
- Từ chối đề xuất bị cắt do giới hạn đầu ra để tránh áp dụng thiếu nội dung.

Kiểm tra mô phỏng xác nhận 100 thay đổi liên tiếp chỉ tạo một lần serialize/ghi sau thời gian chờ. Điều này không phải đo tốc độ trên máy người dùng. Tốc độ Qwen phụ thuộc cấu hình model, RAM/VRAM và context. Chưa có kiểm thử hình học responsive bằng trình duyệt thật trong môi trường này.

### Cập nhật trên Windows

1. Xuất bản thảo JSON để sao lưu nếu bạn đã viết.
2. Dừng cửa sổ server cũ bằng Ctrl+C.
3. Tải ZIP mới, giải nén, nhấp đúp `start.bat`.
4. Mở cùng địa chỉ `http://127.0.0.1:8787`. Bản thảo local cũ vẫn dùng cùng khóa lưu trữ; nếu trình duyệt đang giữ giao diện cũ, nhấn Ctrl+F5.
