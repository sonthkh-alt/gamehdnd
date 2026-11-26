# gamehdnd – Nghị trường số

Bộ câu hỏi về trục Hội đồng nhân dân, đóng gói thành game học tập **"Nghị trường số – Hành trình Đại biểu HĐND hai cấp tỉnh Thanh Hóa"**.

**Chơi trực tuyến:** https://sonthkh-alt.github.io/gamehdnd/

## Nội dung game

- **Hành trình dọc sông Mã:** 5 chặng (Hàm Rồng, Thành nhà Hồ, Lam Kinh, Pù Luông, Nghi Sơn), mỗi chặng 6 câu. Mỗi câu đúng làm tăng GRDP của "tỉnh ảo"; đích là mốc 11%, đúng mục tiêu tăng trưởng năm 2026 của tỉnh.
- **Đấu trường 60 giây:** trả lời nhanh 36 câu, chuỗi đúng được nhân điểm, cuối lượt có phần ôn câu sai.
- **Mini-game:** "Ai có thẩm quyền?" (8 thẻ) và "Xếp đúng quy trình" (giám sát chuyên đề, chuẩn bị kỳ họp).
- **Điểm thưởng:** XP, 5 cấp danh hiệu, 12 huy hiệu, nhiệm vụ hằng ngày, chuỗi ngày học, xếp hạng theo đội.
- Linh vật **Voi Đồng** giải thích đáp án và căn cứ pháp lý sau mỗi câu.

## Cấu trúc kho

| Tệp | Nội dung |
|---|---|
| `index.html` | Toàn bộ game (HTML, CSS, JavaScript trong một tệp, chạy được cả khi mở trực tiếp trên máy) |
| `data/cau-hoi.json` | Bộ câu hỏi xuất ra dạng dữ liệu để rà soát, góp ý; đáp án đúng là phần tử có chỉ số `c` (đếm từ 0) trong mảng `a` |
| `.nojekyll` | Để GitHub Pages phục vụ nguyên trạng các tệp |

Khi sửa câu hỏi, sửa trực tiếp các mảng `STAGES`, `EXTRA`, `CARDS`, `PROCS` trong `index.html`, rồi cập nhật `data/cau-hoi.json` cho khớp.

## Căn cứ nội dung

Luật Tổ chức chính quyền địa phương số 72/2025/QH15; Luật Hoạt động giám sát của Quốc hội và HĐND số 121/2025/QH15; Luật Ban hành văn bản quy phạm pháp luật số 64/2025/QH15 (sửa đổi bởi Luật số 87/2025/QH15); các Nghị quyết 103, 104, 106, 114, 116/2025/UBTVQH15; Chỉ thị 14/CT-TTg năm 2026; số liệu, chỉ tiêu kinh tế - xã hội tỉnh Thanh Hóa cập nhật đến tháng 11/2026.

## Lưu ý

- Đây là **bản demo**. Bộ câu hỏi mẫu cần được Phòng Công tác HĐND rà soát trước khi phát hành chính thức.
- Điểm của các đội trên bảng xếp hạng là dữ liệu minh họa.
- Tiến trình người chơi chỉ lưu trên trình duyệt của từng máy; game không thu thập hay gửi dữ liệu cá nhân đi đâu.
