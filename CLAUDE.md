# Nghị trường số – hướng dẫn cho Claude Code

Game học tập về trục Hội đồng nhân dân hai cấp tỉnh Thanh Hóa. Trang tĩnh, không có bước build: mở `index.html` là chạy. Toàn bộ chữ trong game và tài liệu viết bằng tiếng Việt.

## Cấu trúc

- `index.html`: toàn bộ giao diện và lô-gic (HTML, CSS, JS trong một tệp). Nạp thêm `data/cau-hoi.js`, `assets/img/credits.js`, `assets/art.js`, `assets/img/gallery.js`.
- `data/cau-hoi.json`: ngân hàng câu hỏi bản đầy đủ (nguồn chính để sửa). `data/cau-hoi.js`: bản gọn sinh tự động, không sửa tay.
- `nguon/`: nguyên văn văn bản pháp luật và bài Wikipedia làm căn cứ câu hỏi; mỗi câu hỏi trỏ tới một tệp ở đây qua trường `tep_nguon`.
- `assets/art.js`: 10 tranh SVG phong cách sơn mài cho 10 chặng. `assets/img/gallery.js`: thư viện ảnh tư liệu (Wikimedia Commons). `assets/img/credits.js`: ảnh chính của từng chặng.
- `tools/`: `build_bank.py` (sinh cau-hoi.js), `kiem_tra_cau_hoi.py` (kiểm tra câu hỏi), `tai_anh_ve_may.py` (tải ảnh Commons về kho), `phim/` (dựng phim giới thiệu).

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

## Đưa lên mạng

- Trang công khai: https://sonthkh-alt.github.io/gamehdnd/, GitHub Pages phục vụ từ nhánh `gh-pages`.
- Workflow `.github/workflows/dong-bo-trang-web.yml` tự đưa `gh-pages` về bản mới nhất của `main` sau mỗi lần push lên `main`, nên chỉ cần commit và push lên `main`.

## Kiểm tra giao diện

Chạy `python -m http.server 8765` ở thư mục gốc rồi mở http://localhost:8765. Kiểm tra ở cỡ điện thoại (khoảng 390px), không được tràn ngang, không lỗi console.
