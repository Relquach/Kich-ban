# Mạch Văn — app viết local với Ollama

Bạn là tác giả chính. AI hỗ trợ câu chữ, gợi ý theo hồ sơ nhân vật và thao tác canvas theo yêu cầu. Mặc định app dùng Ollama và Qwen đã có trên máy; có thể cấu hình AI cloud hoặc máy chủ local tương thích OpenAI trong Cài đặt. Không tự tải model.

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

## Bản cập nhật: canvas tham chiếu, viết nhanh, màu và kịch bản tổng

### Canvas nối dây và menu nút

- Dấu **+** ở cạnh phải mỗi nút: bấm rồi bấm nút đích, hoặc kéo dây từ dấu + tới nút đích. Thanh chọn mục tiêu có thể dùng bằng bàn phím, kèm loại quan hệ.
- **Chương / Nhân vật**: chọn một chương và nhiều hồ sơ nhân vật để đưa vào canvas. Khi chọn nối tự động, app tạo dây **Tham gia chương** từ chương tới từng nhân vật. Ví dụ Chương 1 → Tâm, Lan, Tú. Thẻ tham chiếu dùng ID dữ liệu thật; đổi tên nguồn sẽ cập nhật tên hiển thị. Không sao chép hoặc thay nội dung chương/hồ sơ khi kéo thẻ.
- Các dây **Tham gia chương** và **Tham chiếu** không được hiểu là quan hệ nhân quả. Vẫn có các loại nhân quả, cú ngoặt, hé lộ, tiếp diễn.
- Chuột phải trên nút, nút **⋯**, hoặc Shift+F10 khi focus nút để mở menu: **Đưa cho agent, Nối tới mục tiêu, Mở dữ liệu gốc, Làm nổi bật, Ghim vị trí, Xóa**. Escape đóng; mũi tên lên/xuống di chuyển trong menu.
- Ghim khóa vị trí, không khóa nội dung ghi chú hoặc dây nối. Bỏ ghim trước khi kéo, dùng mũi tên/tọa độ hoặc nhờ agent di chuyển. Ghim và nổi bật lưu trong file dự án.
- **Đưa cho agent** thêm thẻ ngữ cảnh vào chat, chưa gửi yêu cầu. Bạn nhập yêu cầu rồi gửi. Chương đính kèm có nguyên văn tối đa 100k ký tự (nếu dài hơn có cờ truncated để agent biết giới hạn); thẻ nhân vật chứa hồ sơ đã lưu. Tối đa 6 thẻ mỗi lần. Agent vẫn đọc toàn bộ sơ đồ và hồ sơ như trước.
- Khi xóa hồ sơ nhân vật, các thẻ liên kết hồ sơ trên canvas và dây liên quan được xóa cùng sau xác nhận; nội dung truyện giữ nguyên.
- Cách tổ chức nút/tham chiếu/chat tham khảo tài liệu Topview Canvas; không cần tài khoản Topview, không dùng dịch vụ Topview hoặc gửi bản thảo sang đó. Đây không phải bản sao đầy đủ giao diện Topview.

### Viết nhanh trong bản thảo

- Gõ `/` ở đầu dòng hoặc sau khoảng trắng để mở danh sách nhân vật; `/T` lọc các tên có từ bắt đầu bằng T. Có lọc không dấu và hỗ trợ Đ/đ. Dùng ↑/↓ và Enter/Tab để chọn, Escape để đóng, hoặc bấm mục.
- Chọn nhân vật sẽ chèn tên. Gõ `:` sau tên nhân vật ở đầu dòng (ví dụ `Tâm:`) để mở **ô nhập lời thoại**. Nhập rồi bấm Chèn. Có nút gợi ý theo hồ sơ và bạn chọn/sửa trước khi dùng. Dấu `:` trong giờ hoặc câu văn khác không tự mở ô thoại.
- `/ngat` chèn dấu ngắt cảnh, `/ghichu` chèn khung ghi chú tác giả. Không tự gửi những thao tác này cho AI.

### Đánh dấu màu và yêu cầu agent sửa đúng đoạn

- Bôi đen văn bản → chọn màu → **Tô đoạn chọn**. **Bỏ màu** xóa màu trong đoạn chọn, không xóa chữ.
- Đỏ, xanh, vàng, tím chỉ là nhãn phân biệt các đoạn văn; không màu nào có chức năng cố định. Bạn nói cần làm gì với từng màu trong mỗi yêu cầu. Cùng một màu có thể phục vụ nhiệm vụ khác ở lượt sau.
- Agent nhận danh sách ID, tên màu thuần túy, vị trí và nguyên văn các đoạn màu **trong chương hiện tại**. Ví dụ: “Thêm ánh sáng cho đoạn đỏ”, “Sửa thoại ở đoạn xanh”; ở lượt sau bạn có thể yêu cầu “Rút gọn đoạn đỏ”. **Nhờ agent theo màu** mở chat, chỉ gợi sẵn phần chọn màu nếu ô chat đang trống; bạn tự viết nhiệm vụ rồi gửi. Nội dung đang nhập được giữ nguyên. Nếu chưa nói cần làm gì, agent được chỉ dẫn hỏi lại, không tự chọn việc theo màu.
- Agent có công cụ riêng sửa đúng đoạn màu, không cần thay cả chương. Mọi đoạn thay đều có phần trước/sau và cần duyệt. Các phần văn bản bên ngoài được giữ.
- Khi gõ/chèn chữ, vị trí màu được dịch theo thay đổi. Chèn trong đoạn màu kéo dài đoạn đó; sửa chồng lấn một phần có thể bỏ đánh dấu bị chồng lấn để tránh chỉ nhầm nội dung. Nút hoàn tác phục hồi cả chữ và màu.
- Vẫn dùng textarea native cho soạn thảo; lớp mirror chỉ hiển thị nền màu. Copy/paste là văn bản thuần, không phải rich text HTML. Tối đa 500 đoạn màu mỗi chương; file dự án giữ các màu và vị trí.

### Font và kiểu hiển thị

Thanh trên bản thảo có **Noto Sans** (hiện đại), **Noto Serif** (văn chương), **Liberation Mono** (đơn cách); mỗi họ có thường, đậm, nghiêng và đậm nghiêng, tổng 12 kiểu font thật. WOFF2 đóng gói local, đủ ký tự tiếng Việt và dấu tổ hợp; tải font theo họ/kiểu đang dùng, không gọi Google Fonts. Giấy phép Liberation và Noto nằm trong `static/fonts`.

Lựa chọn font và kiểu áp dụng cho **toàn bộ phần hiển thị bản thảo**, không định dạng nghiêng/đậm riêng từng từ, và lưu trong file dự án. Giao diện app vẫn dùng Noto Sans. Cỡ chữ và chủ đề tiếp tục là thiết lập trình duyệt như trước.

### Kịch bản tổng

Trang **Kịch bản tổng** có ý tưởng/xung đột chính, tóm tắt diễn biến toàn truyện và kết thúc dự kiến. Tác giả nhập, lưu tự động và xuất cùng dự án. Agent luôn nhận phần này cùng canvas, hồ sơ và chương hiện tại; có thể đề xuất cập nhật kịch bản tổng để bạn duyệt. Nút Agent hỗ trợ mở chat với yêu cầu kiểm tra tổng quan.

Agent không mặc định đọc nguyên văn mọi chương; chỉ chương hiện tại và các chương được đính kèm qua canvas nằm trong ngữ cảnh. Kịch bản tổng giúp định hướng nhưng không thay cho toàn văn chưa đọc. Bản đầu không tự tóm tắt toàn bộ tiểu thuyết bằng một nút.

File dự án mới có version 4; mở được file version 2/3 và JSON bản thảo cũ. App cũ có thể không mở được file version 4 — dùng bản mới khi mở lại.

Kiểm tra bổ sung: `node test_canvas_writer.cjs` (mô phỏng, không phải browser QA), `python -m unittest -v test_agent_tools`. Chưa kiểm thử thao tác kéo dây, typography/mirror và IME trực quan trong browser thật ở môi trường này; cần kiểm tra trên máy dùng app. Chất lượng sinh văn bản vẫn tùy model Qwen.


### Phân biệt Kịch bản tổng với canvas

Kịch bản tổng luôn được gửi cùng mỗi yêu cầu agent, kể cả khi canvas chưa có nút hoặc dây. Chỉ nhập ý tưởng chính cũng đủ để hỏi AI về ý tưởng đó; tóm tắt diễn biến/kết thúc có thể còn trống. Nếu hỏi “Kiểm tra quan hệ nhân quả trên canvas”, agent sẽ kiểm tra sơ đồ và có thể báo canvas trống — điều đó không có nghĩa agent không truy cập được Kịch bản tổng.

Nút gợi ý trong chat thay đổi theo trang đang mở. Tại Kịch bản tổng có “Đọc và góp ý cho kịch bản tổng”; tại canvas có “Kiểm tra quan hệ nhân quả trên canvas”. Nút **Agent hỗ trợ** trong Kịch bản tổng điền yêu cầu đọc phần tổng quan. Mục **Ngữ cảnh** trên chat cho biết có bao nhiêu ô tổng quan có nội dung và bao nhiêu nút canvas; mở mục này để xem từng ô đã nhập/chưa nhập. Đây là thông tin app gửi, không phải bảo đảm model đã hiểu đúng.

Kiểm tra đường truyền dữ liệu bằng mô phỏng: `node test_overview_context.cjs`, và kiểm tra API tương ứng trong `test_server.py`. Chưa kiểm thử phản hồi của Qwen thật trong môi trường này.

### Di chuyển vùng nhìn và chọn dây

Giữ chuột giữa (nút con lăn) và kéo trong canvas để di chuyển vùng nhìn; thả nút để dừng. Thao tác hoạt động cả khi bắt đầu trên nút, không kéo nút và không sửa dữ liệu sơ đồ. Cuộn bằng con lăn và thanh cuộn vẫn dùng như trước.

Bấm trực tiếp lên dây (vùng bấm được mở rộng), nhãn hoặc mục trong danh sách dây để chọn. Dây được chọn sáng và dày hơn, hai đầu được làm nổi bật, các dây khác được làm mờ. Khung thông tin hiển thị đầy đủ tên hai nút và ghi chú quan hệ, có nút **Xem hai đầu dây** để đưa chúng vào vùng nhìn và **Bỏ chọn**. Các nút không bị tự sắp xếp lại.

Kiểm tra mô phỏng: `node test_canvas_navigation.cjs`; chưa kiểm thử trực quan bằng browser thật trong môi trường này.

## Canvas tập trung vào node, kéo thả và Turbo

- Khung sửa cố định bên phải được thay bằng **hộp sửa nổi cạnh node/đầu dây đang chọn**. Bấm × hoặc nền trống để đóng. Danh sách dây chuyển thành mục có thể mở/thu gọn dưới canvas. Hộp theo vị trí nút khi kéo/cuộn, giới hạn trong vùng nhìn; canvas có thêm diện tích ngang.
- Các chương ở thanh bên trái có thể kéo vào canvas. Khi ở trang canvas, thư viện nhân vật cũng hiện ở thanh bên trái: kéo nhân vật vào canvas hoặc bấm để thêm (cách thay thế cho thiết bị không kéo thả). Tọa độ thả tính cả zoom và vị trí cuộn; thẻ tham chiếu vẫn dùng ID nguồn và không bị nhân đôi nếu đã tồn tại.
- `/l` lọc **tên hoặc bí danh chứa chữ l**, không chỉ đầu từ; không phân biệt hoa/thường hoặc dấu tiếng Việt. Danh sách cập nhật trong lúc dùng IME, đặt cạnh vị trí dấu `/`, dịch theo cuộn và chuyển lên trên nếu không đủ chỗ bên dưới. `/T` vì vậy cũng có thể tìm tên chứa T giữa từ. Tiện ích `/ngat`, `/ghichu` vẫn lọc bằng tên lệnh.
- Trong hồ sơ có mục **Bí danh / tên viết tắt** (ví dụ `TT, Tất`). Bí danh được lưu trong file cùng hồ sơ.
- Chat có chế độ **Đầy đủ / Turbo**. Bạn nhập yêu cầu vào cùng ô chat rồi bấm Gửi để xem đề xuất trước/sau và duyệt; không có nút tác vụ viết tắt riêng. Việc mở rộng bí danh chạy hoàn toàn trong app, không gọi Ollama, kể cả chưa chọn model. Chỉ thay các bí danh nguyên từ đã khai báo; bí danh trùng nhiều nhân vật bị bỏ qua.
- Turbo cho việc khác (chính tả, dấu câu, chuẩn hóa tên) chỉ gửi đoạn cần xử lý tối đa 6.000 ký tự, danh sách tên/bí danh và yêu cầu hiện tại. Không gửi tổng quan, canvas, hồ sơ dài hoặc lịch sử chat; giới hạn đầu ra 1.536 token, `think=false`. Thủ công vẫn yêu cầu chọn đoạn; chế độ tự động cho phép xử lý chương nếu vừa giới hạn. Cần phân tích cốt truyện thì dùng Đầy đủ.
- Turbo AI vẫn dùng model Qwen đang chọn, không tự tải/chuyển model. Ngữ cảnh ngắn giảm xử lý prompt nhưng **không loại bỏ thời gian nạp trọng số nếu model chưa nằm trong bộ nhớ**. Chỉ mở rộng bí danh local là không cần suy luận/nạp model. Kết quả bị cắt được từ chối, không áp dụng thiếu nội dung.
- Font và màu là cơ chế riêng; Turbo không gửi các đoạn màu, không phân tích canvas và không đổi quy ước màu tự do.

Kiểm tra bổ sung: `node test_canvas_turbo.cjs`, `python -m unittest -v test_turbo`. Chưa kiểm thử trực quan vị trí popup, kéo thả hoặc tốc độ Qwen thật trên Windows trong môi trường này.


## Canvas và trợ lý gọn hơn

- **Cuộn lên/xuống trên canvas để phóng to/thu nhỏ**, giữ điểm đang trỏ chuột ở nguyên chỗ trong vùng nhìn. Giới hạn hiện tại 40–160%. Giữ chuột giữa để di chuyển vùng nhìn như trước. Ctrl/Command+cuộn vẫn dành cho trình duyệt; Shift+cuộn và cuộn trong hộp sửa nổi vẫn cuộn bình thường.
- **Delete** xóa node đang chọn và các dây liên quan khi focus ở canvas, có thể dùng **Hoàn tác** để phục hồi. Không bắt Delete khi đang nhập trong input, textarea, select hoặc vùng contenteditable; không xóa node khi chat, dialog hay màn hình khác đang nhận thao tác.
- Trợ lý chỉ còn một bộ chọn **Đầy đủ / Turbo** trên thanh tiêu đề, một ô nhập và nút gửi. Nút xóa hội thoại ở thanh tiêu đề; thông tin ngữ cảnh và gợi ý yêu cầu mặc định thu gọn, không còn dải cuộn ngang. Tin mở đầu ngắn, phản hồi trợ lý bỏ bớt khung và nhãn lặp lại.
- Turbo là chế độ cho yêu cầu đơn giản nói chung; không gắn với một tác vụ ví dụ nào. Không có nút hoặc gợi ý riêng về mở rộng tên tắt. Bạn vẫn có thể yêu cầu tác vụ đó bằng lời khi cần, với cơ chế xử lý hiện có; điều này không ảnh hưởng giới hạn ngữ cảnh hoặc yêu cầu duyệt thay đổi.

Kiểm tra mô phỏng: `node test_canvas_zoom_delete.cjs`; chưa kiểm thử trực quan giao diện bằng browser thật trong môi trường này.


## API AI cloud và local

Trong **Cài đặt → Kết nối AI**, chọn loại API, nhập Base URL, khóa nếu cần, rồi **Áp dụng kết nối API**. Chọn model chat từ danh sách hoặc nhập ID model thủ công và bấm **Dùng model này**. Cấu hình dùng chung cho agent, Turbo AI, sửa văn và gợi ý nhân vật; việc mở rộng bí danh local vẫn không gọi API.

| Loại | Base URL ví dụ | Giao thức |
| --- | --- | --- |
| Ollama local | `http://127.0.0.1:11434` | `/api/tags`, `/api/chat` |
| OpenAI cloud | `https://api.openai.com/v1` | Chat Completions |
| LM Studio local | `http://127.0.0.1:1234/v1` | OpenAI-compatible |
| vLLM local | `http://127.0.0.1:8000/v1` | OpenAI-compatible |
| Cloud khác có API tương thích | URL do nhà cung cấp công bố, thường kết thúc `/v1` | OpenAI-compatible |

App gọi `GET /models` và `POST /chat/completions` đối với OpenAI-compatible. API native khác như Anthropic Messages chưa có adapter riêng; cần endpoint/gateway tương thích Chat Completions. Không phải mọi model trong danh sách đều dùng được để chat — chọn đúng ID. Nếu máy chủ không hỗ trợ liệt kê, nhập ID thủ công. Nếu model không hỗ trợ `response_format: json_object`, bỏ chọn JSON mode; model vẫn cần trả JSON hợp lệ cho agent. Tham số/model chưa tương thích có thể bị máy chủ từ chối; app hiển thị lỗi thay vì tự chuyển nhà cung cấp.

Khóa chỉ nằm trong bộ nhớ Python server, không trả lại cho trình duyệt, không nằm trong localStorage/file dự án/mã nguồn. Để trống khóa khi lưu lại cùng endpoint sẽ giữ khóa hiện có. Đổi loại hoặc URL sẽ xóa khóa cũ, trừ khi nhập khóa mới. Có tùy chọn xóa khóa. Khi dừng/khởi động lại server phải cấu hình lại; có thể dùng biến môi trường `AI_PROVIDER`, `AI_BASE_URL`, `AI_API_KEY` để khởi tạo (không commit file chứa khóa).

Chọn cloud đồng nghĩa phần văn bản/ngữ cảnh cần xử lý được gửi tới endpoint đã chọn; chi phí theo tài khoản nhà cung cấp. App không gửi yêu cầu suy luận khi chỉ lưu cấu hình hoặc lấy danh sách model. Chọn Ollama local để xử lý trên máy như trước. Một server dùng chung cấu hình giữa các tab; đổi API bị chặn trong khi đang có suy luận.

API backend hiện có: `GET /api/provider` (chỉ cấu hình công khai và trạng thái có khóa), `POST /api/provider` (áp dụng cấu hình trong bộ nhớ), `GET /api/models`, `POST /api/assist`, `/api/agent`, `/api/character`, `/api/turbo`. Server chỉ bind loopback, không phải API hosting công khai; POST từ trang web khác origin bị từ chối. Máy chủ API chuyển hướng sang host khác cũng bị chặn để tránh chuyển khóa ngoài endpoint đã chọn.

Kiểm tra adapter và UI bằng mock: `python -m unittest -v test_ai_provider`, `node test_api_settings.cjs`. Chưa kiểm thử bằng tài khoản/key cloud thật, LM Studio hoặc vLLM thật trong môi trường này.
