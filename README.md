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
- CSS dùng Google Fonts nếu có mạng, tự fallback sang font máy khi offline. Văn bản truyện chỉ gửi tới Ollama qua server local.
- Không có kiểm thử trình duyệt trong môi trường tạo bản này; tích hợp Ollama được kiểm tra bằng mock, chưa chạy model thật.

## Kiểm tra

```sh
python -m unittest -v
node --check static/app.js
node --check static/agent-ui.js
node test_agent_ui.cjs
```


## Trợ lý AI Agent (bản mới)

Mở **Trợ lý AI Agent** ở thanh bên. Agent gọi model đang chọn qua Ollama local, dùng JSON có kiểm tra để điều khiển các thao tác được app cho phép; không yêu cầu model hỗ trợ native tool calling.

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
