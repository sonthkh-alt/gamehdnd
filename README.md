# gamehdnd – Nghị trường số

Game học tập về trục Hội đồng nhân dân: **"Nghị trường số – Hành trình Đại biểu HĐND hai cấp tỉnh Thanh Hóa"**.

**Chơi trực tuyến:** https://sonthkh-alt.github.io/gamehdnd/

## Nội dung game

- **Hành trình dọc sông Mã:** 10 chặng gắn với 10 di tích, thắng cảnh xứ Thanh; mỗi chặng một chuyên đề và ba cấp độ Dễ, Vừa, Khó. Mỗi lượt 8 câu, đúng từ 5 câu thì vượt cấp. Mỗi ngôi sao làm tăng GRDP của "tỉnh ảo"; đích là mốc 11%.
- **Ngân hàng 570 câu hỏi** (198 dễ, 224 vừa, 148 khó; 219 câu tình huống), mỗi câu có giải thích và căn cứ đến điều, khoản.
- **Thi đấu:** Đấu trường 60 giây (chọn cấp độ), Thi thử 30 câu trong 25 phút (đạt từ 21/30).
- **Trò chơi nhỏ:** Ai có thẩm quyền?, Xếp đúng quy trình, Lật thẻ di sản.
- **Thẻ di sản:** vượt cấp Dễ của mỗi chặng để mở một thẻ tranh sơn mài kèm lời dẫn và ảnh tư liệu.
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
| `assets/art.js` | Bộ 10 tranh phong cách sơn mài (vẽ bằng SVG) cho 10 chặng |
| `assets/img/` | Ảnh tư liệu (Wikimedia Commons) và `credits.js` ghi tác giả, giấy phép |
| `assets/video/` | Phim giới thiệu `gioi-thieu.mp4` và ảnh bìa |
| `.nojekyll` | Để GitHub Pages phục vụ nguyên trạng các tệp |

### Sửa, thêm câu hỏi

1. Sửa `data/cau-hoi.json`. Mỗi câu gồm: `id`, `cd` (mã chuyên đề), `m` (1 dễ, 2 vừa, 3 khó), `loai` (`kt` kiến thức, `th` tình huống), `q`, `a` (4 phương án, **phương án đúng đứng đầu**, game tự trộn), `why`, `cc`, `nguon`, `trich`.
2. Chạy `python3 tools/build_bank.py` để sinh lại `data/cau-hoi.js`.
3. Mở `index.html` để thử.

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
- Mười bức tranh của các chặng được vẽ riêng cho game. Ảnh tư liệu lấy từ Wikimedia Commons theo giấy phép ghi trong `assets/img/credits.js` và trong mục "Căn cứ pháp lý và nguồn ảnh" của game. Hiện có ảnh cho 5 chặng (Đông Sơn, Hàm Rồng, Thành nhà Hồ, Lam Kinh, Pù Luông); muốn thêm ảnh cho chặng khác, đặt tệp `assets/img/<mã>.jpg` (mã: `batrieu`, `samson`, `camluong`, `nghison`, `hacthanh`) và thêm mục tương ứng vào `credits.js`.
- Nhạc và tiếng trống trong phim, trong game được tổng hợp bằng máy.
