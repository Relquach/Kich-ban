# Mạch Văn — app viết local với Ollama

Bạn là tác giả chính. AI hỗ trợ câu chữ, gợi ý theo hồ sơ nhân vật và thao tác canvas theo yêu cầu. App dùng Ollama và Qwen đã có trên máy, không tải lại model và không dùng dịch vụ AI đám mây.

## Mở app trên Windows

1. Máy cần Python 3.10+; mở Ollama đã cài sẵn.
2. Giải nén app, nhấp đúp **start.bat** trong thư mục chứa `server.py`. Không nhấp đúp file JavaScript trong `static`.
3. Mở **http://127.0.0.1:8787**, vào **Cài đặt** chọn model Qwen đúng tag đã cài.

Hoặc chạy `py server.py` / `python server.py`. Giữ cửa sổ server mở trong lúc sử dụng. Server chỉ lắng nghe loopback; Ollama mặc định ở `http://127.0.0.1:11434`. Biến môi trường `OLLAMA_URL` và `PORT` cho phép đổi địa chỉ/cổng. App và Ollama cần chạy trên máy cá nhân; localhost của môi trường cloud không nối tới máy bạn.

## Cập nhật từ bản cũ

Trước khi thay bản app, xuất bản thảo JSON cũ nếu đã viết. Dừng server cũ bằng Ctrl+C, giải nén bản mới, chạy `start.bat` và mở cùng địa chỉ. Nhấn **Ctrl+F5** nếu còn giao diện cũ.

Bản thảo local dùng cùng khóa `machvan-v1`. Danh sách tên nhân vật cũ được chuyển thành **hồ sơ nhân vật toàn dự án**; chưa có tính cách thì để trống để tác giả tự thiết kế. Không tự tạo quá khứ hay sở thích. Có thể mở file JSON xuất từ các phiên bản trước. Nếu không đọc được bản lưu cũ, dữ liệu gốc được giữ trong khóa `machvan-recovery` của localStorage thay vì bị bỏ đi.

## Lưu và mở dự án thành file

- Đặt tên dự án ở thanh trên, chọn **Lưu dự án**. File tên `ten-du-an.machvan.json` chứa mọi chương, hồ sơ nhân vật, canvas (nút, dây, nhãn, tọa độ), model đã chọn và kỹ năng.
- Chrome/Edge trên localhost: lần đầu chọn file; các lần lưu tiếp trong phiên ghi lại vào file đó. Nếu mở một dự án từ file, nút lưu tiếp sẽ ghi vào file đã mở. Đổi tên dự án trong app không tự đổi tên file đã chọn.
- Trình duyệt không có API ghi file, hoặc không ghi được file đã chọn: app tải bản sao JSON xuống thư mục tải về. Giữ bản mới nhất để mở lần sau.
- Chọn **Mở dự án**, chọn file và xác nhận thay không gian hiện tại. Dữ liệu được kiểm tra trước khi thay; file hỏng không làm mất dự án đang mở. Chưa có đồng bộ đám mây hoặc tự ghi file vào ổ đĩa.
- Lưu tự động trong trình duyệt vẫn hoạt động, nhưng không thay cho nút **Lưu dự án**. Xóa dữ liệu trình duyệt có thể xóa bản local; file đã lưu vẫn mở lại được.
- File dự án tối đa 20 MB; có thể mở cả file JSON bản cũ. Chủ đề sáng/tối, cỡ chữ, zoom canvas và hội thoại agent là tùy chọn/phiên giao diện, không nằm trong file dự án.

## Bản thảo và giao diện

- Chương ở thanh bên. Đổi tên chương bằng ô tiêu đề, thêm chương bằng dấu cộng.
- Thủ công: bôi đen đoạn rồi chọn trau chuốt hoặc sửa chính tả. Chỉ đoạn chọn được sửa khi bấm **Áp dụng**.
- Tự động: sau 3 giây ngừng gõ, AI đề xuất chính tả toàn chương; không tự thay chữ. Gợi mở hướng đi là lời khuyên, không tự viết tiếp.
- **Đã bỏ tính năng sắp xếp bố cục** và mục nhận diện tên/hộp thoại cũ.
- Giao diện đã thu gọn tiêu đề, khoảng cách, nội dung trang trí. **Noto Sans** đóng gói local, bao gồm ký tự và dấu tổ hợp tiếng Việt; không còn dùng Georgia/Times cho bản thảo/tiêu đề. Giấy phép font trong `static/fonts/LICENSE.txt`.
- Nút mặt trời/mặt trăng đổi sáng/tối. Cài đặt có chế độ theo hệ thống và cỡ chữ bản thảo 16–26px. Giảm chuyển động theo cài đặt hệ điều hành.

## Hồ sơ nhân vật và gợi ý thoại/hành động/suy nghĩ

Mỗi hồ sơ gồm tên, vai trò/tuổi/cách xưng hô, tính cách, giọng nói, sở thích, điều không thích, mục tiêu, nỗi sợ, quá khứ và quan hệ. Hồ sơ lưu tự động và dùng chung mọi chương trong dự án.

1. Mở **Hồ sơ nhân vật**, thêm nhân vật và tự thiết kế đặc điểm.
2. Chọn nhân vật, tùy chọn người đối thoại, nhập bối cảnh. Nếu để trống bối cảnh, app dùng đoạn đang chọn hoặc chương hiện tại.
3. Bấm **Tạo thoại AI**, **Gợi ý hành động**, **Gợi ý suy nghĩ** hoặc **Cả ba**. Có nút nhanh ngay cạnh bản thảo.
4. Model nhận hồ sơ đã lưu cùng bối cảnh và chỉ dẫn phong cách riêng; trả từ 1–3 phương án kèm lý do phù hợp. Bạn có thể sửa nội dung từng phương án trước khi chọn **Chèn vào bản thảo**.
5. Nội dung được chèn tại vị trí con trỏ đã ghi nhớ (sau đoạn chọn nếu có). Không tự ghi đè đoạn văn. Nếu chương, hồ sơ hoặc dự án đã thay đổi từ lúc tạo, app yêu cầu tạo lại. Có thể hoàn tác đoạn đã chèn.

“Tạo thoại AI” là tạo gợi ý tự động theo hồ sơ, không phải liên tục viết thoại hoặc tự chèn khi bạn đang gõ. Bản đầu chưa tự huấn luyện model hoặc tự xác minh mọi chi tiết tính cách; đọc lại trước khi dùng.

## Canvas cốt truyện

Canvas là sơ đồ do app quản lý, không cần Topview hay tài khoản bên ngoài.

- Nút: **Sự kiện, Cú ngoặt, Hé lộ, Kết cục**. Mỗi nút có tiêu đề và diễn biến/lý do.
- Dây có mũi tên nguồn → đích. Loại quan hệ: **Nhân quả, Cú ngoặt, Hé lộ, Tiếp diễn**; nhãn ghi nguyên nhân, điều kiện hoặc cách chuyển hướng.
- Bấm **Thêm nút**, kéo nút để di chuyển. Bàn phím: Tab tới nút, phím mũi tên di chuyển 20 đơn vị; giữ Shift để di chuyển 5 đơn vị. Có thể nhập tọa độ X/Y trong khung chi tiết, không bắt buộc kéo thả.
- Bấm **Nối dây**, chọn nguồn rồi đích. Chọn dây từ danh sách bên phải để sửa loại và lý do hoặc xóa.
- Zoom bằng nút +/-; cuộn vùng canvas để xem xa hơn. Vị trí nút và dây được lưu vào dự án, zoom chỉ trong phiên.
- Xóa nút cũng xóa dây liên quan. Nút **Hoàn tác** phục hồi thay đổi canvas trong phiên (ngân sách 25 bước/2 MiB).
- Nút **Nhờ agent** mở trợ lý nổi cùng ngữ cảnh sơ đồ. Agent đọc ID, tiêu đề, diễn biến, loại nút, tọa độ và toàn bộ dây, không chỉ ảnh chụp.

## AI agent nổi

Mở ở góc phải hoặc **Alt+J**; **Escape** thu gọn. Hội thoại và câu đang nhập được giữ khi thu gọn, xóa khi tải lại trang hoặc mở dự án khác. Agent luôn dùng model đang chọn trong Ollama.

Agent có thể:

- Đọc chương hiện tại, hồ sơ nhân vật, toàn bộ canvas, tên/ID các chương và kỹ năng.
- Gợi ý thoại/hành động/suy nghĩ phù hợp hồ sơ; phân tích lỗ hổng nhân quả, setup/payoff và cú ngoặt.
- Mở trang, chuyển chương; tạo chương rỗng, đổi tên, bật tắt kỹ năng.
- Đề xuất tạo/sửa hồ sơ khi bạn yêu cầu; không tự thay tính cách.
- Tạo, sửa, di chuyển nút; nối dây, đổi loại/nhãn dây. Có thể tạo nút rồi nối các nút vừa tạo trong cùng kế hoạch.
- Đề xuất sửa văn bản trong phạm vi cho phép; thủ công không có đoạn chọn thì không được sửa.

Các thay đổi dữ liệu cần bạn xem kế hoạch và **Duyệt và thực hiện**. Tối đa 10 thao tác mỗi lượt; yêu cầu lớn có thể chia thành nhiều lượt. Nếu trạng thái dự án thay đổi, kế hoạch cũ không áp dụng được. Kế hoạch thực thi lỗi sẽ khôi phục dữ liệu về trạng thái trước kế hoạch. Agent không chạy shell, đọc file máy tính, tự tải model hoặc xóa chương/nút/hồ sơ. Mở trang/chuyển chương đơn thuần chạy ngay; kế hoạch có cả thay đổi dữ liệu sẽ tạm bỏ phần điều hướng để giữ phạm vi sửa.

Ví dụ: “Dựa vào ý tưởng tôi vừa mô tả, tạo 3 nút sự kiện rồi nối nhân quả”, “Đổi dây này thành cú ngoặt và ghi rõ lý do”, “Kiểm tra sơ đồ có bước nào thiếu nguyên nhân”, “Gợi ý Lan phản ứng thế nào dựa trên hồ sơ”.

## Hiệu năng và giới hạn

- Frontend HTML/CSS/JS thuần, SVG local và font local, không cần npm hoặc CDN.
- Gộp serialize/ghi bản thảo sau 450ms ngừng gõ; cố gắng flush khi ẩn/rời trang. Đếm từ trễ 180ms; nhóm undo gõ 700ms, ngân sách 4 MiB.
- Canvas chỉ cập nhật nút kéo và các dây liên quan trong animation frame, không vẽ lại toàn bộ giao diện mỗi sự kiện kéo. Tối đa 500 nút, 1.500 dây trong file dự án.
- Hội thoại agent giới hạn 24 tin/120k ký tự trong bộ nhớ, 80 khối hiển thị và một kế hoạch còn hiệu lực. Model nhận tối đa 12 tin gần nhất.
- App và server chỉ cho một suy luận mỗi lần; giữ model 5 phút qua Ollama `keep_alive`. Từ chối kết quả bị cắt do giới hạn đầu ra.
- Tối đa 100k ký tự nội dung cho một lượt AI và 1 MB request. Hồ sơ/canvas lớn có thể vượt request hoặc context model; chia nhỏ dự án/yêu cầu nếu cần. Chưa có retrieval cho truyện dài hoặc bộ nhớ toàn văn tất cả chương.
- RAM/VRAM và cấu hình Qwen quyết định tốc độ/chất lượng. API và giao diện được kiểm tra bằng mô phỏng; chưa chạy Qwen thật hay kiểm thử trực quan trình duyệt trong môi trường tạo bản này.

## Kiểm tra cho người phát triển

Không cần thư viện Python ngoài khi chạy app hoặc các test Python.

```sh
python -m unittest -v
node test_runtime.cjs
node test_ui.cjs
node test_agent_ui.cjs
node test_workspace.cjs
```

`test_dom.cjs` là mô phỏng DOM dùng trong test, không phải kiểm thử browser. Thiết kế tham khảo [UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/main/.claude/skills/ui-ux-pro-max/SKILL.md); quyết định mới ghi trong `design-system/MASTER.md`.
