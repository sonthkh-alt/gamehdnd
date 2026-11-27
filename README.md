# gamehdnd – Nghị trường số

Game học tập về trục Hội đồng nhân dân: **"Nghị trường số – Hành trình Đại biểu HĐND hai cấp tỉnh Thanh Hóa"**.

**Chơi trực tuyến:** https://sonthkh-alt.github.io/gamehdnd/

## Nội dung game

- **Hành trình dọc sông Mã:** 10 chặng gắn với 10 di tích, thắng cảnh xứ Thanh; mỗi chặng một chuyên đề và ba cấp độ Dễ, Vừa, Khó. Mỗi lượt 8 câu, đúng từ 5 câu thì vượt cấp. Mỗi ngôi sao làm tăng GRDP của "tỉnh ảo"; đích là mốc 11%.
- **Ngân hàng 570 câu hỏi** (198 dễ, 224 vừa, 148 khó; 219 câu tình huống), mỗi câu có giải thích và căn cứ đến điều, khoản.
- **Thi đấu:** Đấu trường 60 giây (chọn cấp độ), Thi thử 30 câu trong 25 phút (đạt từ 21/30).
- **Trò chơi nhỏ:** Ai có thẩm quyền?, Xếp đúng quy trình, Lật thẻ di sản, Ảnh này ở đâu? (đoán địa danh qua ảnh thật).
- **Thẻ di sản:** vượt cấp Dễ của mỗi chặng để mở một thẻ tranh sơn mài kèm lời dẫn và ảnh tư liệu.
- **Thư viện ảnh xứ Thanh:** 59 ảnh tư liệu từ Wikimedia Commons về cả 10 chặng và nhiều địa danh khác (Bến En, đảo Hòn Nẹ, núi Nưa, sông Mã, đền Lê Lai, đền Lê Hoàn, nghè Xuân Phả, đền Mai An Tiêm, cửa biển Lạch Sung, hang Co Luồng, đảo cò Tiến Nông, chùa Sùng Nghiêm...), có chú thích, tác giả, giấy phép; lọc theo địa danh, xem ảnh lớn.
- **Phim giới thiệu** 46 giây, âm thanh trống hội, trợ giúp 50:50 và "xem căn cứ", 22 huy hiệu, nhiệm vụ hằng ngày, chuỗi ngày học.
- **Chế độ ôn tập tự do** (trong Hồ sơ): mở sẵn mọi chặng để tập huấn theo chuyên đề.

| Chặng | Di sản | Chuyên đề | Số câu |
|---|---|---|---|
| 1 | Đông Sơn | Nền tảng chính quyền hai cấp | 47 |
| 2 | Hàm Rồng | Bầu cử đại biểu HĐND | 46 |
| 3 | Thành nhà Hồ | Tổ chức HĐND và đại biểu | 53 |
| 4 | Lam Kinh | Nhiệm vụ, quyền hạn | 48 |
| 5 | Đền Bà Triệu | Kỳ họp và quy chế làm việc | 77 |
| 6 | Sầm Sơn | Hoạt động giám sát | 104 |
| 7 | Pù Luông | Cử tri và dân nguyện | 67 |
| 8 | Cẩm Lương | Ban hành nghị quyết, văn bản | 42 |
| 9 | Nghi Sơn | Ngân sách và đầu tư công | 38 |
| 10 | Hạc Thành | Thanh Hóa: quê hương và khát vọng | 48 |

## Cấu trúc kho

| Tệp | Nội dung |
|---|---|
| `index.html` | Giao diện và toàn bộ lô-gic game (HTML, CSS, JavaScript); mở trực tiếp trên máy cũng chạy |
| `data/cau-hoi.json` | Ngân hàng câu hỏi bản đầy đủ để rà soát: câu hỏi, 4 phương án, giải thích, căn cứ, văn bản nguồn và đoạn trích nguyên văn |
| `data/cau-hoi.js` | Bản gọn để game nạp, sinh tự động từ tệp JSON |
| `tools/build_bank.py` | Kiểm tra và sinh `data/cau-hoi.js` từ `data/cau-hoi.json` |
| `tools/kiem_tra_cau_hoi.py` | Kiểm tra định dạng câu hỏi và đối chiếu từng đoạn trích với văn bản trong `nguon/` |
| `tools/tai_anh_ve_may.py` | Tải các ảnh đang nạp từ Wikimedia Commons về lưu hẳn trong kho |
| `tools/phim/` | Bộ công cụ dựng lại phim giới thiệu (xem `tools/phim/HUONG-DAN.md`) |
| `nguon/` | Nguyên văn 26 văn bản pháp luật, văn bản của tỉnh và 22 bài Wikipedia làm căn cứ câu hỏi |
| `CLAUDE.md` | Hướng dẫn cho Claude Code khi làm việc với kho này |
| `RA-SOAT.md` | Danh sách câu hỏi nên được Phòng Công tác HĐND xem kỹ, kèm lý do |
| `tools/HUONG-DAN-SOAN-CAU-HOI.md` | Quy trình soạn và rà soát câu hỏi mới |
| `.github/workflows/dong-bo-trang-web.yml` | Tự cập nhật trang web sau mỗi lần đẩy lên nhánh `main` |
| `assets/art.js` | Bộ 10 tranh phong cách sơn mài (vẽ bằng SVG) cho 10 chặng |
| `assets/img/` | Ảnh tư liệu lưu trong kho, `credits.js` (ảnh chính của từng chặng) và `gallery.js` (thư viện ảnh: chú thích, địa danh, tác giả, giấy phép, đường dẫn) |
| `assets/video/` | Phim giới thiệu `gioi-thieu.mp4` và ảnh bìa |
| `.nojekyll` | Để GitHub Pages phục vụ nguyên trạng các tệp |

### Sửa, thêm câu hỏi

1. Sửa `data/cau-hoi.json`. Mỗi câu gồm: `id`, `cd` (mã chuyên đề), `m` (1 dễ, 2 vừa, 3 khó), `loai` (`kt` kiến thức, `th` tình huống), `q`, `a` (4 phương án, **phương án đúng đứng đầu**, game tự trộn), `why`, `cc`, `nguon`, `tep_nguon` (tên tệp trong `nguon/`), `trich` (đoạn chép nguyên văn từ tệp đó).
2. Chạy `python tools/kiem_tra_cau_hoi.py` cho đến khi in `OK`.
3. Chạy `python tools/build_bank.py` để sinh lại `data/cau-hoi.js`.
4. Mở `index.html` để thử.

## Làm việc trên máy tính

### Tải kho về thư mục Gamehdnd (làm một lần)

Cách 1, dùng GitHub Desktop: File → Clone repository → chọn `sonthkh-alt/gamehdnd` → Local path chọn thư mục cha của `Gamehdnd` và đặt tên thư mục là `Gamehdnd` (thư mục phải đang trống).

Cách 2, dùng Git trong PowerShell (thư mục `Gamehdnd` trống hoặc chưa có):

```powershell
cd "đường dẫn tới thư mục cha"
git clone https://github.com/sonthkh-alt/gamehdnd.git Gamehdnd
```

Nếu thư mục `Gamehdnd` đã có tệp khác, mở PowerShell trong thư mục đó rồi chạy:

```powershell
git init
git remote add origin https://github.com/sonthkh-alt/gamehdnd.git
git fetch origin
git checkout -b main --track origin/main
```

Cách 3, không dùng Git: tải tệp ZIP tại https://github.com/sonthkh-alt/gamehdnd/archive/refs/heads/main.zip rồi giải nén vào `Gamehdnd` (cách này không tự đẩy lên GitHub được).

### Sửa và đưa lên mạng

1. Sửa tệp, kiểm tra (`python tools/kiem_tra_cau_hoi.py`, `python tools/build_bank.py`), mở `index.html` xem thử. Muốn xem đúng như trên mạng: `python -m http.server 8765` rồi mở http://localhost:8765.
2. Commit và push lên nhánh `main` (GitHub Desktop: Commit to main → Push origin).
3. Workflow "Dong bo trang web" tự đưa bản mới lên nhánh `gh-pages`; trang https://sonthkh-alt.github.io/gamehdnd/ cập nhật sau khoảng 1–2 phút. Xem tiến trình ở tab Actions của kho.

### Lưu hẳn ảnh vào kho

Máy chủ đám mây soạn game bị Wikimedia giới hạn tải ảnh, nên phần lớn ảnh đang được trình duyệt nạp thẳng từ Commons. Trên máy tính của bạn, chạy `python tools/tai_anh_ve_may.py` để tải toàn bộ ảnh về `assets/img/g/` và chuyển game sang dùng ảnh trong kho, rồi commit, push. Sau đó có thể dựng lại phim giới thiệu với ảnh thật theo `tools/phim/HUONG-DAN.md`.

## Căn cứ nội dung

Bộ câu hỏi được soạn từ nguyên văn các văn bản hiện hành (cập nhật tháng 11/2026) và đã đối chiếu máy từng đoạn trích với văn bản nguồn, sau đó rà soát chéo lần hai:

- Hiến pháp năm 2013, sửa đổi, bổ sung theo Nghị quyết 203/2025/QH15.
- Luật Tổ chức chính quyền địa phương số 72/2025/QH15.
- Luật Hoạt động giám sát của Quốc hội và HĐND số 121/2025/QH15; Nghị quyết 114/2025/UBTVQH15; Nghị quyết 96/2023/QH15.
- Luật Bầu cử đại biểu Quốc hội và đại biểu HĐND (văn bản hợp nhất 83/VBHN-VPQH năm 2026); Nghị quyết 107/2025/UBTVQH15.
- Luật Ban hành văn bản quy phạm pháp luật số 64/2025/QH15, sửa đổi bởi Luật số 87/2025/QH15.
- Luật Ngân sách nhà nước số 89/2025/QH15.
- Luật Tiếp công dân năm 2013, sửa đổi bởi Luật số 136/2025/QH15; Nghị quyết 116/2025/UBTVQH15.
- Nghị quyết 103/2025/UBTVQH15, 104/2025/UBTVQH15 (Quy chế làm việc mẫu của HĐND cấp tỉnh, cấp xã); Nghị quyết 106/2025/UBTVQH15, 108/2025/UBTVQH15.
- Nghị quyết liên tịch 72/2025/NQLT/UBTVQH15-CP-ĐCTUBTWMTTQVN về tiếp xúc cử tri (văn bản hợp nhất 162/VBHN-VPQH năm 2025).
- Nghị quyết 202/2025/QH15; Nghị quyết 1686/NQ-UBTVQH15 về sắp xếp đơn vị hành chính cấp xã của tỉnh Thanh Hóa.
- Nghị quyết 45/2025/NQ-HĐND, 36/2026/NQ-HĐND và 55/NQ-HĐND năm 2026 của HĐND tỉnh Thanh Hóa; Chỉ thị 08/CT-TTg và 14/CT-TTg năm 2026.
- Báo Thanh Hóa điện tử và Wikipedia tiếng Việt (riêng phần lịch sử, văn hóa, di sản).

## Lưu ý

- Bộ câu hỏi **cần được Phòng Công tác HĐND rà soát trước khi dùng chính thức**. Một số điểm nên xem kỹ:
  - Quy chế làm việc mẫu (điểm a khoản 2 Điều 16 của Nghị quyết 103 và 104) ghi Chủ tịch HĐND giới thiệu cả Phó Chủ tịch, Ủy viên UBND, trong khi Điều 36 Luật 72/2025/QH15 giao Chủ tịch UBND giới thiệu. Các câu hỏi chỉ dùng phần hai văn bản thống nhất.
  - Nghị quyết 96/2023/QH15 về lấy phiếu tín nhiệm ban hành khi còn cấp huyện; 6 câu liên quan chỉ hỏi quy tắc chung hoặc cấp tỉnh.
  - Câu hỏi về mục tiêu, chỉ tiêu của tỉnh lấy theo Nghị quyết 55/NQ-HĐND ngày 17/7/2026; cần cập nhật khi tỉnh điều chỉnh.
- Điểm của các đội trên bảng xếp hạng là dữ liệu minh họa.
- Tiến trình người chơi chỉ lưu trên trình duyệt của từng máy; game không thu thập hay gửi dữ liệu cá nhân đi đâu.
- Mười bức tranh của các chặng được vẽ riêng cho game. Ảnh tư liệu lấy từ Wikimedia Commons, chỉ chọn ảnh giấy phép tự do (CC BY, CC BY-SA, CC0, phạm vi công cộng); tác giả, giấy phép ghi trong `assets/img/gallery.js`, `assets/img/credits.js` và mục "Căn cứ pháp lý và nguồn ảnh" của game.
- 5 ảnh được lưu trong kho; 54 ảnh còn lại được trình duyệt người chơi nạp trực tiếp từ máy chủ Wikimedia Commons ở cỡ ảnh chuẩn mà Commons cho phép nhúng (vì máy chủ đám mây soạn game bị Wikimedia giới hạn tải). Vì vậy khi mở game, trình duyệt sẽ kết nối tới upload.wikimedia.org. Nếu nơi nhúng trang chặn ảnh ngoài, game tự dùng 5 ảnh trong kho và ẩn trò "Ảnh này ở đâu?".
- Muốn lưu hẳn một ảnh vào kho: tải ảnh từ trang gốc ghi trong `gallery.js`, đặt vào `assets/img/g/<khóa>.jpg` rồi sửa `src` của mục đó thành đường dẫn trong kho.
- Nhạc và tiếng trống trong phim, trong game được tổng hợp bằng máy.
