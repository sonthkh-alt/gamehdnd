#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Sinh dữ liệu và tệp âm thanh thuyết minh của game từ data/thuyet-minh.json.

  python tools/tao_thuyet_minh.py
      Chỉ sinh lại data/thuyet-minh.js (lời đọc + danh sách tệp âm thanh còn khớp lời).
      Không cần thư viện ngoài. Chạy sau mỗi lần sửa data/thuyet-minh.json.

  python tools/tao_thuyet_minh.py --tong-hop [--giong nu,nam] [--lam-lai]
      Tổng hợp các tệp âm thanh còn thiếu hoặc đã đổi lời bằng VieNeu-TTS v3 Turbo
      (mã nguồn mở, giấy phép Apache 2.0, chạy trên CPU), ghi vào assets/audio/tm/<giọng>/<khóa>.mp3.
      Cần: pip install vieneu lameenc  (lần đầu tự tải mô hình từ Hugging Face).
      --lam-lai: tổng hợp lại tất cả, kể cả đoạn đã có.

Cách game dùng: đoạn nào có tệp âm thanh khớp lời (cùng mã băm) thì phát tệp; đoạn nào chưa có
thì game đọc bằng giọng tiếng Việt có sẵn của thiết bị. Vì vậy sửa lời mà chưa tổng hợp lại
thì game không bao giờ phát nhầm tệp cũ.

Có thể thay bằng giọng người thật: thu từng đoạn, lưu đúng tên tệp
assets/audio/tm/<giọng>/<khóa>.mp3 rồi chạy: python tools/tao_thuyet_minh.py --nhan-tep
(ghi nhận các tệp đang có là khớp với lời hiện tại).

Chuyện kể liền mạch (mục "chuyen" trong data/thuyet-minh.json): mỗi đoạn có "loi" là lời hiện trên
màn hình, số viết bằng chữ số. Công cụ tự đổi số thành chữ để có lời đọc (đoạn nào có "doc" thì dùng
"doc"). Xem lời đọc sau khi đổi: python tools/tao_thuyet_minh.py --xem-chuyen
"""
import argparse, hashlib, io, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "data", "thuyet-minh.json")
OUT_JS = os.path.join(ROOT, "data", "thuyet-minh.js")
DIR = os.path.join(ROOT, "assets", "audio", "tm")
SO = os.path.join(DIR, "clips.json")  # sổ ghi: tệp nào được tổng hợp từ lời nào
REL = "assets/audio/tm/"
TAN_SO = 44100
KBPS = 64


CS = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"]


def _ba_so(n, dau):
    """Đọc số 0..999; dau=True: nhóm đứng đầu, không đọc 'không trăm'."""
    tr, r = divmod(n, 100)
    ch, dv = divmod(r, 10)
    o = []
    if tr or not dau:
        o += [CS[tr], "trăm"]
    if ch == 0:
        if dv:
            o += (["linh"] if o else []) + [CS[dv]]
    elif ch == 1:
        o += ["mười"] + (["lăm" if dv == 5 else CS[dv]] if dv else [])
    else:
        o += [CS[ch], "mươi"] + ([{1: "mốt", 4: "tư", 5: "lăm"}.get(dv, CS[dv])] if dv else [])
    return " ".join(o)


def so_thanh_chu(n):
    """Số nguyên 0..999999 thành chữ: 1397 -> một nghìn ba trăm chín mươi bảy; 2006 -> hai nghìn không trăm linh sáu."""
    if n < 1000:
        return _ba_so(n, True)
    ng, r = divmod(n, 1000)
    return _ba_so(ng, True) + " nghìn" + ((" " + _ba_so(r, False)) if r else "")


def doc_tu_loi(t):
    """Lời hiện trên màn hình -> lời để máy đọc: số thành chữ, 'tháng 4' thành 'tháng tư', bỏ gạch nối trong từ phiên âm."""
    t = re.sub(r"tháng 4(?!\d)", "tháng tư", t)
    t = re.sub(r"(?<=\w)-(?=\w)", " ", t)
    t = re.sub(r"\d+", lambda m: so_thanh_chu(int(m.group(0))), t)
    if re.search(r"\d", t):
        sys.exit("Còn chữ số chưa đổi được: " + t)
    return t


def gop_chuyen(D):
    """Kiểm tra mục 'chuyen' rồi nối các đoạn của nó vào danh sách lời đọc (để tổng hợp tiếng như mọi đoạn khác)."""
    C = D.get("chuyen") or {}
    for d in C.get("doan", []):
        if not d.get("loi", "").strip():
            sys.exit("Đoạn chuyện %s chưa có lời" % d.get("k"))
        if not isinstance(d.get("st"), int) or not -1 <= d["st"] <= 9:
            sys.exit("Đoạn chuyện %s: 'st' phải là số từ -1 đến 9" % d["k"])
        for n in d.get("nguon", []):
            if not os.path.exists(os.path.join(ROOT, "nguon", n + ".txt")):
                sys.exit("Đoạn chuyện %s: không thấy nguon/%s.txt" % (d["k"], n))
        D["muc"].append({"k": d["k"], "ten": "Chuyện kể", "doc": d.get("doc") or doc_tu_loi(d["loi"])})


def bam(t):
    return hashlib.sha1(t.encode("utf8")).hexdigest()[:8]


def doc_so():
    try:
        return json.load(open(SO, encoding="utf8"))
    except Exception:
        return {}


def ghi_so(so):
    os.makedirs(DIR, exist_ok=True)
    json.dump(so, open(SO, "w", encoding="utf8", newline="\n"), ensure_ascii=False, indent=1, sort_keys=True)


def sinh_js(D, so):
    muc, clip = {}, {}
    for m in D["muc"]:
        h = bam(m["doc"])
        muc[m["k"]] = {"doc": m["doc"], "h": h}
        for g in D["giong"]:
            if so.get(m["k"], {}).get(g) == h and os.path.exists(os.path.join(DIR, g, m["k"] + ".mp3")):
                clip.setdefault(m["k"], {})[g] = h
    # Nhạc nền: danh sách bản nhạc người chơi chọn được, bản đầu là mặc định; bản nào thiếu tệp thì bỏ
    N = D.get("nhac") or {}
    ds = [x for x in (N.get("ds") or ([N] if N.get("tep") else [])) if x.get("tep") and os.path.exists(os.path.join(ROOT, x["tep"]))]
    nhac_ds = [{"k": x.get("k") or str(j), "tep": x["tep"], "ten": x.get("ten", ""), "nhan": x.get("nhan") or x.get("ten", ""),
                "moTa": x.get("mo_ta", "")} for j, x in enumerate(ds)]
    d0 = nhac_ds[0] if nhac_ds else {"tep": "", "ten": "", "moTa": ""}
    C = D.get("chuyen") or {}
    doan = [dict({"k": d["k"], "st": d["st"], "loi": d["loi"]}, **({"ch": d["ch"]} if d.get("ch") else {})) for d in C.get("doan", [])]
    o = {"dir": REL, "may": D.get("may", ""), "giong": D["giong"], "nhac": d0["tep"], "nhacTen": d0["ten"], "nhacMoTa": d0["moTa"], "nhacDs": nhac_ds,
         "chuyen": {"ten": C.get("ten", ""), "doan": doan}, "muc": muc, "clip": clip}
    js = ("/* Sinh tự động bằng tools/tao_thuyet_minh.py từ data/thuyet-minh.json. Không sửa tay. */\n"
          "window.NTS_TM=" + json.dumps(o, ensure_ascii=False, separators=(",", ":")) + ";\n")
    open(OUT_JS, "w", encoding="utf8", newline="\n").write(js)
    may = [g for g in D["giong"] if not D["giong"][g].get("nguoi")]
    du = sum(1 for k in muc if all(g in clip.get(k, {}) for g in may))
    print("data/thuyet-minh.js: %d đoạn lời, %d đoạn đã đủ tệp âm thanh cho %d giọng máy." % (len(muc), du, len(may)))
    for g in D["giong"]:
        if D["giong"][g].get("nguoi"):
            co = sum(1 for k in muc if g in clip.get(k, {}))
            print("  Giọng người đọc '%s' (%s): đã có %d/%d đoạn." % (g, D["giong"][g].get("ten", ""), co, len(muc)))


def cat_lang(x, sr, nguong=0.006, dem=0.12):
    """Bỏ khoảng lặng thừa ở đầu và cuối, chừa lại một chút cho tự nhiên."""
    import numpy as np
    a = np.abs(x)
    idx = np.where(a > nguong)[0]
    if not len(idx):
        return x
    i, j = max(0, idx[0] - int(dem * sr)), min(len(x), idx[-1] + int((dem + 0.1) * sr))
    return x[i:j]


def ma_hoa_mp3(x, sr, path):
    import numpy as np, lameenc
    pcm = (np.clip(x, -1, 1) * 32767).astype("<i2").tobytes()
    e = lameenc.Encoder()
    e.set_bit_rate(KBPS)
    e.set_in_sample_rate(sr)
    e.set_channels(1)
    e.set_quality(2)
    b = e.encode(pcm) + e.flush()
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, "wb").write(bytes(b))
    return len(x) / sr


def tong_hop(D, so, chon, lam_lai):
    import tempfile, time
    import numpy as np, soundfile as sf, soxr
    from vieneu import Vieneu
    print("Nạp mô hình VieNeu-TTS (lần đầu sẽ tải về, có thể mất vài phút)...", flush=True)
    tts = Vieneu()
    co_san = [(str(n), str(v)) for n, v in tts.list_preset_voices()]

    def tim(ten):
        t = ten.strip().lower()
        for nhan, vid in co_san:
            if vid.lower() == t or nhan.lower().lstrip("⭐ ").startswith(t):
                return nhan, vid
        sys.exit("Không thấy giọng '%s'. Các giọng có sẵn:\n  %s" % (ten, "\n  ".join("%s (%s)" % c for c in co_san)))

    tmp = os.path.join(tempfile.mkdtemp(), "x.wav")
    tong = 0.0
    for g in chon:
        ten = D["giong"][g]["ten"]
        nhan, vid = tim(ten)
        print("Giọng %s: %s" % (g, nhan), flush=True)
        for m in D["muc"]:
            k, h = m["k"], bam(m["doc"])
            p = os.path.join(DIR, g, k + ".mp3")
            if not lam_lai and so.get(k, {}).get(g) == h and os.path.exists(p):
                continue
            t0, loi, am = time.time(), None, None
            for v in (ten, vid, nhan):  # tùy phiên bản SDK nhận tên hoặc mã giọng
                try:
                    am = tts.infer(m["doc"], voice=v)
                    break
                except Exception as e:  # noqa: BLE001
                    loi = e
            if am is None:
                sys.exit("Không tổng hợp được đoạn %s: %s" % (k, loi))
            tts.save(am, tmp)
            x, sr = sf.read(tmp, dtype="float32", always_2d=False)
            if x.ndim > 1:
                x = x.mean(axis=1)
            x = cat_lang(x, sr)
            if sr != TAN_SO:
                x = soxr.resample(x, sr, TAN_SO)
            dinh = float(np.max(np.abs(x))) or 1.0
            x = x * (0.89 / dinh)  # chuẩn hóa đỉnh về khoảng -1 dB
            dai = ma_hoa_mp3(x, TAN_SO, p)
            so.setdefault(k, {})[g] = h
            ghi_so(so)
            tong += dai
            print("  %-8s %5.1f giây âm thanh, tổng hợp mất %5.1f giây" % (k, dai, time.time() - t0), flush=True)
    print("Đã tổng hợp thêm %.0f giây âm thanh." % tong)


def main():
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf8", line_buffering=True)
    ap = argparse.ArgumentParser()
    ap.add_argument("--tong-hop", action="store_true")
    ap.add_argument("--giong", default="")
    ap.add_argument("--lam-lai", action="store_true")
    ap.add_argument("--nhan-tep", action="store_true")
    ap.add_argument("--xem-chuyen", action="store_true")
    a = ap.parse_args()
    D = json.load(open(SRC, encoding="utf8"))
    gop_chuyen(D)
    if a.xem_chuyen:
        for d in D["chuyen"]["doan"]:
            print("[%s | chặng %s] %s" % (d["k"], d["st"], d.get("doc") or doc_tu_loi(d["loi"])))
            print()
        return
    ks = [m["k"] for m in D["muc"]]
    if len(set(ks)) != len(ks):
        sys.exit("Trùng khóa trong data/thuyet-minh.json")
    for m in D["muc"]:
        if not m["doc"].strip():
            sys.exit("Đoạn %s chưa có lời đọc" % m["k"])
    so = doc_so()
    # Giọng người đọc thật ("nguoi": true) chỉ nhận tệp thu qua tools/nhan_giong_doc.py, không bao giờ tổng hợp bằng máy
    chon = [g for g in (a.giong.split(",") if a.giong else [g for g in D["giong"] if not D["giong"][g].get("nguoi")]) if g]
    for g in chon:
        if g not in D["giong"]:
            sys.exit("Không có giọng '%s' trong data/thuyet-minh.json" % g)
        if D["giong"][g].get("nguoi"):
            sys.exit("Giọng '%s' là giọng người đọc thật, không tổng hợp bằng máy." % g)
    if a.nhan_tep:
        for m in D["muc"]:
            for g in D["giong"]:
                if os.path.exists(os.path.join(DIR, g, m["k"] + ".mp3")):
                    so.setdefault(m["k"], {})[g] = bam(m["doc"])
        ghi_so(so)
    if a.tong_hop:
        tong_hop(D, so, chon, a.lam_lai)
    sinh_js(D, so)


if __name__ == "__main__":
    main()
