# Nghị trường số – hướng dẫn cho Claude Code

Game học tập về trục Hội đồng nhân dân hai cấp tỉnh Thanh Hóa. Trang tĩnh, không có bước build: mở `index.html` là chạy. Toàn bộ chữ trong game và tài liệu viết bằng tiếng Việt. Tác giả game: Hà Ngọc Sơn, Phó Chánh Văn phòng Đoàn ĐBQH và HĐND tỉnh Thanh Hóa (ghi ở màn hình "Tác giả, căn cứ và nguồn", cuối tab Hồ sơ, thẻ meta author và README).

## Cấu trúc

- `index.html`: toàn bộ giao diện và lô-gic (HTML, CSS, JS trong một tệp). Nạp thêm `data/cau-hoi.js`, `data/bo-may.js`, `data/thuyet-minh.js`, `assets/img/credits.js`, `assets/art.js`, `assets/img/gallery.js`, rồi `assets/vendor/three.min.js`, `assets/3d/mo-hinh.js`, `assets/3d/the-gioi.js`.
- `assets/3d/mo-hinh.js` (`window.NTS_MODELS`): mô hình dựng bằng mã, gồm Voi Đồng, trống đồng và 10 hàm `build.<khóa>` cho 10 chặng. `assets/3d/the-gioi.js` (`window.NTS_3D`): sa bàn, camera, ghim chặng, hiệu ứng. `assets/vendor/three.min.js`: three.js r170 gộp một tệp, không sửa tay.
- `manifest.webmanifest`, `sw.js`, `assets/icon/`: cài game như ứng dụng, chơi khi mất mạng. Thêm tệp mã mới thì bổ sung vào mảng `CORE` trong `sw.js`.
- `data/cau-hoi.json`: ngân hàng câu hỏi bản đầy đủ (nguồn chính để sửa). `data/cau-hoi.js`: bản gọn sinh tự động, không sửa tay.
- `data/bo-may.json`, `data/bo-may.js` (`window.NTS_BOMAY`): dữ liệu mục Bộ máy, sinh bằng `tools/lay_bo_may.py` từ Cổng thông tin điện tử dbndthanhhoa.gov.vn; không sửa tay. Ảnh chân dung đại biểu ở `assets/img/db/`.
- `nguon/`: nguyên văn văn bản pháp luật và bài Wikipedia làm căn cứ câu hỏi; mỗi câu hỏi trỏ tới một tệp ở đây qua trường `tep_nguon`.
- `assets/art.js`: 10 tranh SVG phong cách sơn mài cho 10 chặng. `assets/img/gallery.js`: thư viện ảnh tư liệu (Wikimedia Commons). `assets/img/credits.js`: ảnh chính của từng chặng.
- `tools/`: `build_bank.py` (sinh cau-hoi.js), `kiem_tra_cau_hoi.py` (kiểm tra câu hỏi), `lay_bo_may.py` (lấy dữ liệu mục Bộ máy từ Cổng), `tao_thuyet_minh.py` (sinh dữ liệu và tệp âm thanh thuyết minh), `tai_anh_ve_may.py` (tải ảnh Commons về kho), `xem-3d.html` (xem riêng sa bàn 3D), `phim/` (dựng phim giới thiệu).

## Đồ họa 3D

- Giữ nguyên tắc không có bước build và mở `index.html` bằng tệp vẫn chạy: chỉ dùng thẻ `<script>` thường, không dùng `type="module"`, không nạp thư viện từ CDN.
- Mô hình chỉ dựng bằng mã và họa tiết canvas; không thêm tệp mô hình, ảnh chất liệu tải từ nơi khác.
- `index.html` nói chuyện với 3D qua `NTS_3D` trong hàm `sync3d()` (đặt khung vào `#stage` trên màn hình rộng, `#hero3d` ở tab Hành trình, `#ov3d` khi đang chơi) và `renderHud()`. Biến `g3` là đang chạy 3D; mọi lời gọi `G3.*` phải kiểm tra `g3` vì máy không có WebGL hoặc người chơi chọn 2D thì game dùng giao diện 2D cũ (phải luôn chạy được).
- Cụm mô hình quay mặt chính về +z, mặt đất y = 0; hàm `build.<khóa>` trả về `{obj, H, R, spot, face, tick}`. Khối chuyển động phải đánh dấu `dyn(...)` trước khi `bake()` gộp lưới.
- Vị trí 10 chặng nằm trong bảng `PLACE` của `the-gioi.js`; đổi vị trí phải xem lại sông (`RIV`) và bờ biển (`coastX`) để mô hình không nằm đè lên nước.
- Sau khi sửa 3D: mở `tools/xem-3d.html?v=focus&i=<0..9>` xem từng chặng, rồi kiểm tra game ở cỡ điện thoại và cỡ màn hình rộng, cả khi chọn Đồ họa 2D.

## Nội dung trò chơi nhỏ

- Thẻ "Ai có thẩm quyền?" (`CARDS`) và các bước "Xếp đúng quy trình" (`PROCS`) nằm trong `index.html`, cũng chỉ soạn từ văn bản trong `nguon/`; phần `why`, `cc` ghi rõ điều, khoản. Mỗi thẻ chỉ được đúng với một trong bốn chủ thể.

## Thuyết minh bằng giọng nói

- Lời đọc ở `data/thuyet-minh.json` (trường `doc`: viết đủ chữ, số và ngày tháng viết bằng chữ, không viết tắt); `data/thuyet-minh.js` (`window.NTS_TM`) sinh bằng `python tools/tao_thuyet_minh.py`, không sửa tay. Lời của `c0` đến `c9` phải khớp nội dung với `lore` của chặng trong `index.html`; sửa một bên thì sửa cả bên kia.
- Trong `index.html`, đối tượng `TM` phát thuyết minh: có tệp `assets/audio/tm/<giọng>/<khóa>.mp3` khớp mã băm thì phát tệp, không thì đọc bằng giọng tiếng Việt của thiết bị (`speechSynthesis`). Mọi chỗ phát đều đi qua `TM.play(khóa)`; `TM.on()` đã gồm điều kiện bật âm thanh (`S.snd`) và bật thuyết minh (`S.tm`). Mở màn mới, đổi tab, đóng màn phủ đều phải dừng (`TM.stop()`).
- Mỗi lần mở game có màn chào `#chaoM`; chạm "Vào nghị trường" (`ACT.vao`) mới đặt `entered=true`, mở bảng chọn nhân vật cho người mới, đọc lời nói đầu (`tmHello`, `tmLoiDau`) và bật nhạc nền. Không gọi phát tiếng trước thời điểm này.
- Chuyện kể dọc sông Mã: mục `chuyen` của `data/thuyet-minh.json` (28 đoạn `s01` đến `s28`, trường `loi` là lời hiện trên màn hình, công cụ tự đổi số thành chữ để đọc; `st` là chặng ống kính ghé, `nguon` là tệp căn cứ trong `nguon/`). Trong `index.html`: `KCD` (các đoạn), `KCC` (các chương), màn phủ `run.type==='kc'`, các hàm `kcOpen`, `kcPlay`, `kcPause`, `kcResume`, `kcJump`. Hết đoạn tự sang đoạn sau qua hàm gọi lại của `TM.play`; không có tiếng thì chữ tự chạy bằng hẹn giờ. Chỉ kể điều có trong `nguon/`, truyền thuyết phải nói rõ là tương truyền.
- `TM` dùng lại một thẻ audio cho mọi đoạn (`TM.el`): trình duyệt điện thoại chỉ cho thẻ đã được người chơi bấm phát tự phát tiếp đoạn sau. Không tạo `new Audio()` cho từng đoạn.
- Nhạc nền: đối tượng `NH` phát bản người chơi chọn (`S.nhacK`) trong danh sách `NHDS` lấy từ mục `nhac.ds` của `data/thuyet-minh.json`; mặc định là bản thu thật `assets/audio/nhac-dan-day.mp3` (Freesound 440632, CC BY 4.0, phải giữ ghi nguồn), còn `assets/audio/nhac-nen.mp3` là nhạc tự soạn tạo bằng `tools/tao_nhac_nen.py`. `NH.sync()` tự quyết định phát, nhỏ lại hay dừng theo màn đang mở; thêm loại màn chơi mới thì xem lại hàm `NH.factor()`. Thêm bản thu thật chỉ qua `tools/nhan_nhac_nen.py` và chỉ khi có căn cứ được phép phát hành lại (tham số `--quyen`): giấy phép tự do do chính người thu cấp, hoặc văn bản đồng ý của đơn vị giữ quyền. Không lấy bản thu trên YouTube, trang nhạc, báo, đài; không tin nhãn CC của đĩa thương mại do người khác tải lên Internet Archive.
- Chỉ tự phát sau một thao tác của người chơi (trình duyệt chặn tự phát âm thanh) và mỗi đoạn chỉ tự phát một lần trong một phiên (`tmAuto`).
- Tệp âm thanh chỉ tạo bằng công cụ có quyền phát hành lại: VieNeu-TTS (Apache 2.0) qua `tools/tao_thuyet_minh.py --tong-hop` hoặc workflow "Tao thuyet minh", hoặc giọng người thật. Không dùng `edge-tts` hay dịch vụ không cấp quyền phát hành lại. Màn hình nguồn luôn ghi rõ giọng nào là giọng máy, giọng nào là người đọc thật.
- Giọng người đọc thật: thu bằng `tools/thu-am.html`, nhận bằng `python tools/nhan_giong_doc.py <tệp .zip> --nguoi ... --quyen ...` vào `assets/audio/tm/nguoi/`; giọng này có `"nguoi": true` trong mục `giong`, `TM.clip()` luôn ưu tiên nó, workflow không tổng hợp đè. Người dùng yêu cầu giọng kể không phải giọng máy: không tìm cách thay bằng giọng máy "hay hơn".

## Mục Bộ máy

- Tab "Bộ máy" (`tabBm()` trong `index.html`) và trò "Ai giữ cương vị nào?" (`bmPool()`) chỉ đọc `window.NTS_BOMAY`; không ghi tên người, chức vụ trực tiếp vào `index.html`. Thiếu `data/bo-may.js` thì tab tự ẩn, game vẫn phải chạy.
- Muốn cập nhật nhân sự: chạy `python tools/lay_bo_may.py` (cần Pillow), xem `git diff data/bo-may.json`, không sửa tay dữ liệu và không bổ sung theo trí nhớ. Riêng năm của các khóa nằm trong bảng `NK_QH`, `NK_HD` của công cụ vì Cổng không ghi.
- Chỉ đưa vào kho họ tên, chức vụ, đơn vị bầu cử, giới tính, ảnh chân dung. Không đưa số điện thoại, ngày sinh, quê quán, nơi ở, thư điện tử cá nhân dù Cổng có đăng.
- Luôn ghi nguồn "dbndthanhhoa.gov.vn" và ngày chụp (`BM.ngay`) ở nơi hiển thị; số liệu đếm từ danh sách phải nói rõ là "theo danh sách trên Cổng".

## Quy tắc khi sửa câu hỏi

- Mỗi câu: `id`, `cd` (mã chuyên đề: nt, bc, tc, nv, kh, gs, ct, vb, ns, th), `m` (1 dễ, 2 vừa, 3 khó), `loai` (`kt` kiến thức, `th` tình huống), `q`, `a` (đúng 4 phương án, phương án đúng đứng đầu, `c` luôn = 0, game tự trộn), `why`, `cc` (căn cứ đến điểm, khoản, điều), `nguon`, `tep_nguon`, `trich`.
- `trich` phải là đoạn chép nguyên văn từ `nguon/<tep_nguon>.txt`. Chỉ dựa vào văn bản trong `nguon/`, không dựa vào trí nhớ: nhiều quy định đã đổi năm 2025–2026 (chính quyền 2 cấp từ 01/7/2025, không còn cấp huyện).
- Không dùng phương án kiểu "Tất cả các đáp án trên". Câu nào khác nhau giữa cấp tỉnh và cấp xã phải ghi rõ cấp.
- Sau khi sửa: `python tools/kiem_tra_cau_hoi.py` (phải in OK), rồi `python tools/build_bank.py`.
- Quy trình đầy đủ (soạn, kiểm tra, rà soát độc lập) ở `tools/HUONG-DAN-SOAN-CAU-HOI.md`; câu còn điểm đáng bàn ghi vào `RA-SOAT.md`.
- Chỗ vênh đã biết: điểm a khoản 2 Điều 16 Quy chế làm việc mẫu (NQ 103, 104/2025/UBTVQH15) so với Điều 36 Luật 72/2025/QH15 về người giới thiệu Phó Chủ tịch, Ủy viên UBND; không ra câu hỏi phụ thuộc chỗ vênh này.

## Ảnh

- Chỉ dùng ảnh giấy phép tự do (CC BY, CC BY-SA, CC0, phạm vi công cộng), ghi tác giả và giấy phép trong `gallery.js`. Không dùng ảnh chỉ có giấy phép GFDL, ảnh báo chí, ảnh trang du lịch.
- Mục trong `gallery.js`: `k` khóa, `st` chặng (hoặc `th` cho ảnh chung xứ Thanh), `pl` địa danh (dùng cho trò "Ảnh này ở đâu?"), `cap` chú thích, `src` ảnh lớn, `th` ảnh nhỏ, `author`, `lic`, `page`; `nq: 1` để loại khỏi trò đoán ảnh (ảnh hiện vật bảo tàng, món ăn, ảnh chụp từ trên cao).
- Khi tải từ Wikimedia, dùng User-Agent có địa chỉ kho và tôn trọng Retry-After (đã làm sẵn trong `tools/tai_anh_ve_may.py`).

- Ngoại lệ duy nhất: ảnh chân dung đại biểu trong `assets/img/db/` lấy từ Cổng thông tin điện tử Đoàn ĐBQH và HĐND tỉnh Thanh Hóa (Cổng cho phát hành lại khi ghi rõ nguồn), chỉ dùng trong mục Bộ máy, không đưa vào `gallery.js`. Không lấy ảnh tin bài trên Cổng vì nhiều ảnh là của báo chí.

## Đưa lên mạng

- Trang công khai: https://sonthkh-alt.github.io/gamehdnd/, GitHub Pages phục vụ từ nhánh `gh-pages`.
- Workflow `.github/workflows/dong-bo-trang-web.yml` tự đưa `gh-pages` về bản mới nhất của `main` sau mỗi lần push lên `main`, nên chỉ cần commit và push lên `main`.

## Kiểm tra giao diện

Chạy `python -m http.server 8765` ở thư mục gốc rồi mở http://localhost:8765. Kiểm tra ở cỡ điện thoại (khoảng 390px) và cỡ màn hình rộng (từ 1000px, bố cục hai khoang), không được tràn ngang, không lỗi console.
