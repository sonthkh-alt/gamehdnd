# Văn bản nguồn

Nguyên văn các văn bản làm căn cứ cho ngân hàng câu hỏi. Mỗi câu hỏi trong `data/cau-hoi.json` có trường `tep_nguon` trỏ tới một tệp ở đây (không có đuôi `.txt`) và trường `trich` là đoạn chép nguyên văn từ tệp đó; `python tools/kiem_tra_cau_hoi.py` đối chiếu tự động.

Văn bản pháp luật được lấy nguyên văn từ luatvietnam.vn (toàn văn) và Công báo (datafiles.chinhphu.vn), ngày 26/11/2026. Văn bản quy phạm pháp luật và văn bản hành chính không thuộc đối tượng bảo hộ quyền tác giả (Điều 15 Luật Sở hữu trí tuệ). Khi văn bản được sửa đổi, thay thế, hãy tải bản mới, thay tệp tương ứng và chạy lại công cụ kiểm tra để biết câu nào cần sửa.

| Tệp | Văn bản |
|---|---|
| `hienphap` | Hiến pháp năm 2013, văn bản hợp nhất 52/VBHN-VPQH năm 2025 |
| `nq203` | Nghị quyết 203/2025/QH15 sửa đổi, bổ sung một số điều của Hiến pháp |
| `nq202` | Nghị quyết 202/2025/QH15 về sắp xếp đơn vị hành chính cấp tỉnh |
| `l72` | Luật Tổ chức chính quyền địa phương số 72/2025/QH15 |
| `nq106` | Nghị quyết 106/2025/UBTVQH15 về số lượng Phó Chủ tịch, Phó Trưởng Ban HĐND |
| `nq108` | Nghị quyết 108/2025/UBTVQH15 về tiêu chuẩn thành lập Ban Dân tộc HĐND cấp tỉnh |
| `nq103` | Nghị quyết 103/2025/UBTVQH15, Quy chế làm việc mẫu của HĐND cấp tỉnh |
| `nq104` | Nghị quyết 104/2025/UBTVQH15, Quy chế làm việc mẫu của HĐND cấp xã |
| `l121` | Luật Hoạt động giám sát của Quốc hội và HĐND số 121/2025/QH15 |
| `nq114` | Nghị quyết 114/2025/UBTVQH15 hướng dẫn hoạt động giám sát của HĐND |
| `nq96` | Nghị quyết 96/2023/QH15 về lấy phiếu tín nhiệm, bỏ phiếu tín nhiệm |
| `txct` | Văn bản hợp nhất 162/VBHN-VPQH năm 2025 (Nghị quyết liên tịch 72/2025 về tiếp xúc cử tri) |
| `nq116` | Nghị quyết 116/2025/UBTVQH15 về tiếp công dân, xử lý đơn, giám sát giải quyết khiếu nại, tố cáo |
| `ltcd` | Luật Tiếp công dân số 42/2013/QH13 |
| `l136` | Luật số 136/2025/QH15 sửa đổi Luật Tiếp công dân, Luật Khiếu nại, Luật Tố cáo |
| `l64` | Luật Ban hành văn bản quy phạm pháp luật số 64/2025/QH15 (bản gốc) |
| `l87` | Luật số 87/2025/QH15 sửa đổi, bổ sung Luật 64/2025/QH15 |
| `lbaucu` | Luật Bầu cử đại biểu Quốc hội và đại biểu HĐND, văn bản hợp nhất 83/VBHN-VPQH năm 2026 |
| `nq107` | Nghị quyết 107/2025/UBTVQH15 hướng dẫn cơ cấu người ứng cử đại biểu HĐND nhiệm kỳ 2026–2031 |
| `l89` | Luật Ngân sách nhà nước số 89/2025/QH15 |
| `th45` | Nghị quyết 45/2025/NQ-HĐND tỉnh Thanh Hóa về chế độ chi tiêu bảo đảm hoạt động của HĐND các cấp |
| `th36` | Nghị quyết 36/2026/NQ-HĐND tỉnh Thanh Hóa phân cấp HĐND cấp xã quyết định phân bổ vốn đầu tư công |
| `th55` | Nghị quyết 55/NQ-HĐND ngày 17/7/2026 của HĐND tỉnh Thanh Hóa về Kế hoạch phát triển KT-XH 2026–2030 (bản trích phần đầu) |
| `nq1686` | Nghị quyết 1686/NQ-UBTVQH15 về sắp xếp đơn vị hành chính cấp xã của tỉnh Thanh Hóa năm 2025 |
| `ct08` | Chỉ thị 08/CT-TTg năm 2026 về tổ chức kỳ họp thứ nhất HĐND các cấp nhiệm kỳ 2026–2031 |
| `ct14` | Chỉ thị 14/CT-TTg năm 2026 về bồi dưỡng, đánh giá kiến thức, kỹ năng số cho cán bộ, công chức, viên chức |
| `wiki_*` | 16 bài Wikipedia tiếng Việt (phần lịch sử, văn hóa, di sản), giấy phép CC BY-SA 4.0; tên bài ghi ở dòng đầu mỗi tệp |

9 câu hỏi (th-006 đến th-014) dựa trên các bài Báo Thanh Hóa điện tử năm 2026; bài báo có bản quyền nên không chép vào kho. Các bài đó:

- Kỳ họp thứ nhất HĐND tỉnh Thanh Hóa khóa XIX bầu các chức danh lãnh đạo HĐND, UBND tỉnh (27/3/2026): https://baothanhhoa.vn/ky-hop-thu-nhat-hdnd-tinh-thanh-hoa-khoa-xix-bau-cac-chuc-danh-lanh-dao-hdnd-ubnd-tinh-282611.htm
- Thống nhất chương trình Kỳ họp thứ nhất HĐND tỉnh Thanh Hóa khóa XIX (25/3/2026): https://baothanhhoa.vn/thong-nhat-chuong-trinh-ky-hop-thu-nhat-hdnd-tinh-thanh-hoa-khoa-xix-282378.htm
- Thanh Hóa hoàn thành sắp xếp thôn, tổ dân phố; thông qua Đề án phân loại đơn vị hành chính (25/6/2026): https://baothanhhoa.vn/thanh-hoa-hoan-thanh-sap-xep-thon-to-dan-pho-thong-qua-de-an-phan-loai-don-vi-hanh-chinh-292334.htm
- Trách nhiệm với Nhân dân (30/3/2026): https://baothanhhoa.vn/trach-nhiem-voi-nhan-dan-282843.htm
