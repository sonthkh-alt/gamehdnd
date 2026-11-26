#!/usr/bin/env python3
"""Sinh data/cau-hoi.js (bản gọn để game nạp) từ data/cau-hoi.json (bản đầy đủ để rà soát).

Cách dùng (chạy ở thư mục gốc của kho):  python3 tools/build_bank.py
Sau khi sửa câu hỏi trong data/cau-hoi.json, chạy lại lệnh này rồi mở index.html để thử.
"""
import json, sys, collections, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
src = ROOT / "data" / "cau-hoi.json"
dst = ROOT / "data" / "cau-hoi.js"

d = json.loads(src.read_text(encoding="utf8"))
topics = {t["ma"] for t in d["chu_de"]}
errs, ids, out = [], set(), []
for x in d["cau_hoi"]:
    i = x.get("id", "?")
    if i in ids:
        errs.append(f"{i}: trùng id")
    ids.add(i)
    if x.get("cd") not in topics:
        errs.append(f"{i}: mã chủ đề lạ {x.get('cd')}")
    if x.get("m") not in (1, 2, 3):
        errs.append(f"{i}: m phải là 1, 2 hoặc 3")
    a = x.get("a", [])
    if len(a) != 4 or len({s.strip().lower() for s in a}) != 4:
        errs.append(f"{i}: cần đúng 4 phương án khác nhau")
    if x.get("c", 0) != 0:
        errs.append(f"{i}: đáp án đúng phải đứng đầu mảng a (c = 0); game tự trộn thứ tự")
    for k in ("q", "why", "cc"):
        if not str(x.get(k, "")).strip():
            errs.append(f"{i}: thiếu {k}")
    out.append({"id": i, "cd": x["cd"], "m": x["m"], "l": x.get("loai", "kt"),
                "q": x["q"], "a": a, "why": x["why"], "cc": x["cc"]})
if errs:
    print("\n".join(errs))
    sys.exit(1)
js = "/* Tệp sinh tự động từ data/cau-hoi.json bằng tools/build_bank.py. Đừng sửa tay. */\n"
js += "window.NTS_BANK=" + json.dumps({"v": d["phien_ban"], "q": out}, ensure_ascii=False, separators=(",", ":")) + ";\n"
dst.write_text(js, encoding="utf8")
c = collections.Counter((x["cd"], x["m"]) for x in out)
for t in d["chu_de"]:
    print(f'{t["ma"]:3} {t["chang"]:14} Dễ {c[(t["ma"],1)]:3}  Vừa {c[(t["ma"],2)]:3}  Khó {c[(t["ma"],3)]:3}')
print(f"Đã ghi {dst.name}: {len(out)} câu, {dst.stat().st_size//1024} KB")
