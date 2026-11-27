#!/usr/bin/env python3
"""Kiểm tra ngân hàng câu hỏi data/cau-hoi.json.

Cách dùng (chạy ở thư mục gốc của kho):
    python tools/kiem_tra_cau_hoi.py            # kiểm tra toàn bộ
    python tools/kiem_tra_cau_hoi.py nt-012     # chỉ kiểm tra một số câu

Kiểm tra:
  - đủ trường, đúng kiểu, mức 1–3, đúng 4 phương án khác nhau, đáp án đúng đứng đầu (c = 0);
  - độ dài câu hỏi, phương án, giải thích;
  - đoạn "trich" có nằm nguyên văn trong tệp nguon/<tep_nguon>.txt không
    (so sánh sau khi chuẩn hóa Unicode NFC, khoảng trắng, dấu nháy và chữ hoa/thường).
Kết thúc bằng "OK" nếu không có lỗi. Không cần cài thêm thư viện.
"""
import json
import os
import re
import sys
import unicodedata
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def norm(s):
    s = unicodedata.normalize("NFC", s)
    for a, b in ((" ", " "), ("–", "-"), ("—", "-"), ("“", '"'), ("”", '"'), ("’", "'")):
        s = s.replace(a, b)
    s = re.sub(r"\s+", " ", s).strip().lower()
    # bỏ số chú thích dính liền chữ trong văn bản hợp nhất, ví dụ "nhân dân88 cấp xã"
    return re.sub(r"(?<=[a-zà-ỹđ])\d{1,3}(?= )", "", s)


def main(only):
    d = json.load(open(os.path.join(ROOT, "data", "cau-hoi.json"), encoding="utf8"))
    topics = {t["ma"] for t in d["chu_de"]}
    cache = {}
    err = warn = 0
    seen_id, seen_q = set(), set()
    by = Counter()

    def E(i, m):
        nonlocal err
        err += 1
        print(f"[LỖI] {i}: {m}")

    def W(i, m):
        nonlocal warn
        warn += 1
        print(f"[LƯU Ý] {i}: {m}")

    for x in d["cau_hoi"]:
        i = x.get("id", "?")
        if only and i not in only:
            continue
        for k in ("id", "cd", "m", "loai", "q", "a", "c", "why", "cc", "nguon", "tep_nguon", "trich"):
            if k not in x:
                E(i, f"thiếu trường {k}")
        if i in seen_id:
            E(i, "trùng id")
        seen_id.add(i)
        if x.get("cd") not in topics:
            E(i, f"mã chủ đề lạ: {x.get('cd')}")
        if x.get("m") not in (1, 2, 3):
            E(i, "m phải là 1, 2 hoặc 3")
        if x.get("loai") not in ("kt", "th"):
            E(i, "loai phải là kt hoặc th")
        if x.get("c", 0) != 0:
            E(i, "đáp án đúng phải đứng đầu mảng a (c = 0)")
        q = x.get("q", "")
        if norm(q) in seen_q:
            E(i, "trùng câu hỏi với một câu khác")
        seen_q.add(norm(q))
        lim = 420 if x.get("loai") == "th" else 260
        if len(q) > lim:
            W(i, f"câu hỏi dài {len(q)} ký tự (nên ≤ {lim})")
        a = x.get("a", [])
        if len(a) != 4 or len({norm(o) for o in a}) != 4:
            E(i, "cần đúng 4 phương án khác nhau")
        for o in a:
            if len(o) > 130:
                W(i, f"phương án dài {len(o)} ký tự: {o[:40]}…")
            if re.search(r"tất cả|cả a|cả b|các đáp án|đáp án trên", norm(o)):
                E(i, f"phương án kiểu 'tất cả các đáp án': {o[:40]}")
        if len(x.get("why", "")) > 300:
            W(i, f"giải thích dài {len(x['why'])} ký tự (nên ≤ 300)")
        src = x.get("tep_nguon", "")
        if src not in cache:
            p = os.path.join(ROOT, "nguon", src + ".txt")
            cache[src] = norm(open(p, encoding="utf8").read()) if os.path.exists(p) else None
        if cache[src] is None:
            W(i, f"không có tệp nguon/{src}.txt để đối chiếu đoạn trích")
        elif norm(x.get("trich", "")) not in cache[src]:
            E(i, f"đoạn trich không khớp nguyên văn tệp nguon/{src}.txt")
        by[(x.get("cd"), x.get("m"))] += 1

    if not only:
        print("\nSố câu theo chủ đề (Dễ / Vừa / Khó):")
        for t in d["chu_de"]:
            print(f"  {t['ma']:3} {t['chang']:14} {by[(t['ma'],1)]:3} / {by[(t['ma'],2)]:3} / {by[(t['ma'],3)]:3}")
    print(f"\nĐã kiểm tra {len(seen_id)} câu: {err} lỗi, {warn} lưu ý.")
    print("OK" if err == 0 else "CHƯA ĐẠT")
    return 0 if err == 0 else 1


if __name__ == "__main__":
    sys.exit(main(set(sys.argv[1:])))
