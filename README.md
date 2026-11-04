# Mạch Văn

App hỗ trợ viết tiếng Việt, chạy local với Ollama. Bạn giữ quyền tác giả và duyệt mọi chỉnh sửa. Không cần npm hay thư viện Python ngoài.

## Chạy trên máy của bạn

1. Cài Python 3.10+ và Ollama.
2. Chạy `ollama serve` nếu Ollama chưa chạy nền.
3. Chạy `ollama list` để xác nhận model đã cài. Tên “qwen 3.8 27b” chưa được xác minh; app không giả định tag này tồn tại. Nếu chưa có model, dùng `ollama pull <tag-chính-xác>` theo danh mục Ollama.
4. Trong thư mục app, chạy:

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
```
