# Soạn và rà soát câu hỏi

Quy trình đã dùng để soạn 570 câu hỏi hiện có. Dùng lại khi thêm câu mới, tự soạn hay nhờ Claude Code.

## 1. Chuẩn bị văn bản nguồn

- Mỗi câu hỏi phải dựa trên một tệp nguyên văn trong `nguon/`. Văn bản mới thì lấy toàn văn (luatvietnam.vn, vbpl.vn, Công báo, cổng thông tin chính thức), lưu thành `nguon/<tên-ngắn>.txt` dạng UTF-8, không dấu trong tên tệp, rồi thêm một dòng vào bảng trong `nguon/README.md`.
- Văn bản hợp nhất có chú thích sửa đổi: dùng nội dung đang có hiệu lực. Văn bản gốc đã bị sửa (ví dụ Luật 64/2025 sửa bởi Luật 87/2025): trước khi dùng một điều, phải xem văn bản sửa đổi có đổi điều đó không; nếu có, trích từ văn bản sửa đổi.
- Không dựa vào trí nhớ: nhiều quy định đã đổi năm 2025–2026 (chính quyền 2 cấp từ 01/7/2025, không còn cấp huyện).

## 2. Soạn câu

Mỗi câu là một mục trong mảng `cau_hoi` của `data/cau-hoi.json`:

```json
{
 "id": "gs-201",
 "cd": "gs",
 "m": 2,
 "loai": "th",
 "q": "Câu hỏi?",
 "a": ["Phương án đúng", "Phương án sai 1", "Phương án sai 2", "Phương án sai 3"],
 "c": 0,
 "why": "Giải thích 1–2 câu, hiện cho người chơi sau khi trả lời.",
 "cc": "Khoản 2 Điều 31 Luật Hoạt động giám sát của Quốc hội và HĐND số 121/2025/QH15",
 "nguon": "Luật Hoạt động giám sát của Quốc hội và HĐND số 121/2025/QH15",
 "tep_nguon": "l121",
 "trich": "đoạn chép nguyên văn từ nguon/l121.txt chứng minh đáp án"
}
```

- `cd`: nt (nền tảng, chặng Đông Sơn), bc (bầu cử, Hàm Rồng), tc (tổ chức, Thành nhà Hồ), nv (nhiệm vụ quyền hạn, Lam Kinh), kh (kỳ họp, Đền Bà Triệu), gs (giám sát, Sầm Sơn), ct (cử tri, dân nguyện, Pù Luông), vb (văn bản, Cẩm Lương), ns (ngân sách, Nghi Sơn), th (Thanh Hóa, Hạc Thành).
- `m`: 1 Dễ (kiến thức nền), 2 Vừa (con số, thời hạn, thẩm quyền, trình tự), 3 Khó (phân biệt chủ thể, ngoại lệ, kết hợp nhiều khoản, tình huống phức tạp). Tỷ lệ nên giữ khoảng 35% / 40% / 25%.
- `loai`: `kt` kiến thức, `th` tình huống (dùng "xã A", "phường B", "tỉnh", không dùng tên người, tên địa phương thật). Nên có ít nhất 20% câu tình huống.
- `trich`: chép nguyên văn, liền mạch, 40–350 ký tự, nằm trọn trong một dòng của tệp nguồn.
- Đúng 4 phương án, chỉ một phương án đúng, phương án đúng đứng đầu (game tự trộn). Ba phương án sai phải hợp lý, cùng loại và dài tương đương phương án đúng, lấy từ quy định gần giống (thẩm quyền của chủ thể khác, con số lân cận, quy định cũ đã bỏ) nhưng chắc chắn sai theo văn bản.
- Không dùng "Tất cả các đáp án trên", "Cả A và B"; không nhắc vị trí A, B, C, D. Hạn chế câu phủ định (viết hoa chữ KHÔNG).
- Quy định khác nhau giữa cấp tỉnh và cấp xã thì câu hỏi phải ghi rõ cấp.
- Độ dài: câu hỏi kiến thức ≤ 260 ký tự, tình huống ≤ 420; mỗi phương án ≤ 130 (nên ≤ 90); giải thích ≤ 300.

## 3. Kiểm tra tự động

```bash
python tools/kiem_tra_cau_hoi.py          # phải in OK
python tools/kiem_tra_cau_hoi.py gs-201   # chỉ kiểm tra một câu
python tools/build_bank.py                # sinh lại data/cau-hoi.js cho game
```

## 4. Rà soát độc lập (nên làm với mọi câu mới)

Người rà soát (hoặc một phiên Claude Code khác, không phải phiên đã soạn) làm với từng câu:

1. Tìm đoạn `trich` trong `nguon/<tep_nguon>.txt`, đọc cả điều, khoản chứa nó và các khoản lân cận.
2. Kiểm tra: đáp án đúng hoàn toàn theo nguyên văn (chủ thể, con số, thời hạn, điều kiện, ngoại lệ); từng phương án sai chắc chắn sai, kể cả khi đối chiếu với khoản khác, điều khác, văn bản khác trong `nguon/`; câu hỏi đủ điều kiện để chỉ có một đáp án; `cc` ghi đúng điểm, khoản, điều; giải thích không thêm thông tin ngoài nguồn; không dùng quy định đã bị sửa, bãi bỏ.
3. Kết luận: giữ nguyên, sửa nhỏ, hoặc loại (khi sai không cứu được, mơ hồ, văn bản mâu thuẫn).

Câu còn điểm đáng bàn thì ghi vào `RA-SOAT.md` để Phòng Công tác HĐND xem.

## 5. Đưa lên mạng

Commit và push lên nhánh `main`. Workflow "Dong bo trang web" tự cập nhật trang https://sonthkh-alt.github.io/gamehdnd/ sau khoảng 1–2 phút.
