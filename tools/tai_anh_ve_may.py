#!/usr/bin/env python3
"""Tải các ảnh tư liệu đang nạp từ Wikimedia Commons về lưu hẳn trong kho.

Chạy trên máy tính của bạn, ở thư mục gốc của kho:
    python tools/tai_anh_ve_may.py

Việc công cụ làm:
  1. Đọc assets/img/gallery.js và assets/img/credits.js.
  2. Với mỗi ảnh có đường dẫn https://upload.wikimedia.org/..., tải ảnh lớn (960px) về
     assets/img/g/<khóa>.jpg và ảnh nhỏ (330px) về assets/img/g/<khóa>-t.jpg.
  3. Sửa gallery.js, credits.js để game dùng ảnh trong kho.
Ảnh nào đã có thì bỏ qua, nên chạy lại bao nhiêu lần cũng được. Không cần cài thêm thư viện.

Công cụ tải chậm, mỗi lần một ảnh, và tôn trọng thời gian chờ (Retry-After) theo chính sách
của Wikimedia (https://wikitech.wikimedia.org/wiki/Robot_policy).
"""
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, "assets", "img")
UA = "NghiTruongSo/1.0 (https://github.com/sonthkh-alt/gamehdnd; educational quiz game) python-urllib"


def load_js(path):
    t = open(path, encoding="utf8").read()
    m = re.search(r"window\.NTS_[A-Z]+=", t)
    head = t[: m.end()]
    body = t[m.end() : t.rindex(";")]
    return head, json.loads(body)


def save_js(path, head, data):
    with open(path, "w", encoding="utf8") as f:
        f.write(head + json.dumps(data, ensure_ascii=False, indent=1) + ";\n")


def fetch(url, out):
    for attempt in range(5):
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                data = r.read()
            if len(data) < 2000:
                raise ValueError("tệp quá nhỏ")
            with open(out, "wb") as f:
                f.write(data)
            return True
        except urllib.error.HTTPError as e:
            wait = int(e.headers.get("Retry-After", "30") or 30) if e.code == 429 else 20
            print(f"    máy chủ trả {e.code}, chờ {wait} giây rồi thử lại…")
            time.sleep(wait)
        except Exception as e:  # mạng chập chờn
            print(f"    lỗi {e}, chờ 20 giây rồi thử lại…")
            time.sleep(20)
    return False


def main():
    os.makedirs(os.path.join(IMG, "g"), exist_ok=True)
    gpath, cpath = os.path.join(IMG, "gallery.js"), os.path.join(IMG, "credits.js")
    ghead, gal = load_js(gpath)
    chead, cred = load_js(cpath)
    remote = [g for g in gal if g["src"].startswith("http") or g["th"].startswith("http")]
    print(f"Có {len(remote)} ảnh đang nạp từ Commons cần tải về.")
    ok = fail = 0
    for n, g in enumerate(remote, 1):
        k = g["k"]
        print(f"[{n}/{len(remote)}] {k}: {g['cap']}")
        done = True
        for field, suffix in (("src", ""), ("th", "-t")):
            url = g[field]
            if not url.startswith("http"):
                continue
            rel = f"assets/img/g/{k}{suffix}.jpg"
            out = os.path.join(ROOT, rel)
            if os.path.exists(out) or fetch(url, out):
                g[field] = rel
            else:
                done = False
            time.sleep(2)
        if done:
            ok += 1
        else:
            fail += 1
            print("    chưa tải được, lần chạy sau sẽ thử lại")
        save_js(gpath, ghead, gal)  # lưu dần để dừng giữa chừng vẫn không mất
    # ảnh chính của chặng: dùng bản ảnh lớn vừa tải
    for st, c in cred.items():
        url = c.get("url")
        if not url:
            continue
        g = next((x for x in gal if x["st"] == st and x.get("cap") == c.get("cap")), None)
        if g and not g["src"].startswith("http"):
            c.pop("url")
            c["file"] = g["src"]
    save_js(cpath, chead, cred)
    print(f"\nXong: {ok} ảnh đã có trong kho, {fail} ảnh chưa tải được.")
    print("Nhớ commit và push các thay đổi trong assets/img/ để trang web dùng ảnh trong kho.")
    return 0 if fail == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
