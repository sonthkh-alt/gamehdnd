#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Nhận các bản thu GIỌNG NGƯỜI ĐỌC THẬT cho thuyết minh và chuyện kể dọc sông Mã.

Bước 1, thu âm: mở tools/thu-am.html (trên trang công khai: .../gamehdnd/tools/thu-am.html, hoặc chạy
python -m http.server 8765 rồi mở http://localhost:8765/tools/thu-am.html), đọc lần lượt từng đoạn,
bấm "Tải tất cả (.zip)". Tên tệp có dạng <khóa>-<mã băm lời>.wav, ví dụ s01-1a2b3c4d.wav.

Bước 2, đưa vào game:
  python tools/nhan_giong_doc.py giong-doc-nghi-truong-so.zip --nguoi "Họ và tên người đọc" \
         --quyen "Người đọc đồng ý cho Văn phòng dùng và phát hành lại bản thu trong game (ngày ...)" \
         [--giong nguoi] [--nhan "Người đọc"] [--thu thu-muc-ra]

Nhận .zip hoặc thư mục chứa tệp .wav/.flac/.ogg/.mp3 (tên <khóa>.wav hoặc <khóa>-<mã băm>.wav).
Cần: pip install numpy soundfile soxr lameenc (scipy nếu có thì lọc tiếng ù tần số thấp tốt hơn).

Việc công cụ làm với mỗi tệp:
  - bỏ qua tệp có mã băm không khớp lời hiện tại (lời đã sửa sau khi thu: phải thu lại);
  - trộn về một kênh, 44,1 kHz; lọc tiếng ù dưới 70 Hz; cắt khoảng lặng thừa ở đầu và cuối theo mức ồn nền;
  - chỉnh âm lượng mọi đoạn về cùng một mức để nghe liền mạch, ép đỉnh mềm, làm mờ 15 ms ở hai đầu;
  - ghi assets/audio/tm/<giọng>/<khóa>.mp3 (96 kbps), ghi sổ clips.json, sinh lại data/thuyet-minh.js.
Game luôn ưu tiên giọng người đọc thật; đoạn nào chưa có bản thu thì mới dùng giọng máy.

Bắt buộc có --nguoi và --quyen: game ghi tên người đọc ở màn "Tác giả, căn cứ và nguồn".
"""
import argparse, io, json, os, re, sys, tempfile, zipfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tao_thuyet_minh import ROOT, SRC, DIR, gop_chuyen, bam, doc_so, ghi_so, sinh_js  # noqa: E402

SR = 44100
KBPS = 96
RMS_DB = -18.0     # mức trung bình của phần có tiếng nói
DINH = 0.89        # đỉnh tối đa, khoảng -1 dB


def loi(m):
    print(m)
    sys.exit(1)


def xu_ly(x, sr):
    import numpy as np, soxr
    if x.ndim > 1:
        x = x.mean(axis=1)
    x = x.astype("float32")
    if sr != SR:
        x = soxr.resample(x, sr, SR)
    x = x - float(np.mean(x))
    try:
        from scipy.signal import butter, sosfiltfilt
        x = sosfiltfilt(butter(4, 70, "highpass", fs=SR, output="sos"), x).astype("float32")
    except Exception:  # noqa: BLE001  (không có scipy: bỏ bước lọc)
        pass
    # mức ồn nền: khung 20 ms yên nhất; ngưỡng tiếng nói cao hơn ồn nền khoảng 15 dB
    n = int(0.02 * SR)
    k = len(x) // n
    if k < 10:
        return None
    rms = np.sqrt(np.mean(x[: k * n].reshape(k, n) ** 2, axis=1)) + 1e-9
    nen = float(np.percentile(rms, 10))
    nguong = max(nen * 5.6, float(rms.max()) * 0.03)
    co = np.where(rms > nguong)[0]
    if not len(co):
        return None
    i, j = max(0, (co[0] - 8) * n), min(len(x), (co[-1] + 18) * n)   # chừa 0,16 giây đầu, 0,36 giây cuối
    x = x[i:j]
    noi = rms[co[0]:co[-1] + 1]
    muc = float(np.sqrt(np.mean(noi[noi > nguong] ** 2)))
    x = x * (10 ** (RMS_DB / 20) / muc)
    if float(np.max(np.abs(x))) > DINH:
        x = (np.tanh(x / DINH * 1.1) / np.tanh(1.1) * DINH).astype("float32")
    f = int(0.015 * SR)
    x[:f] *= np.linspace(0, 1, f, dtype="float32")
    x[-f:] *= np.linspace(1, 0, f, dtype="float32")
    return x, 20 * np.log10(nen / muc)


def ma_hoa(x, path):
    import numpy as np, lameenc
    e = lameenc.Encoder()
    e.set_bit_rate(KBPS)
    e.set_in_sample_rate(SR)
    e.set_channels(1)
    e.set_quality(2)
    b = e.encode((np.clip(x, -1, 1) * 32767).astype("<i2").tobytes()) + e.flush()
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, "wb").write(bytes(b))


def main():
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf8", line_buffering=True)
    ap = argparse.ArgumentParser(description="Nhận bản thu giọng người đọc thật")
    ap.add_argument("vao", help="tệp .zip hoặc thư mục chứa bản thu")
    ap.add_argument("--nguoi", default="", help="họ và tên người đọc")
    ap.add_argument("--quyen", default="", help="căn cứ được dùng và phát hành lại bản thu")
    ap.add_argument("--giong", default="nguoi", help="khóa giọng trong data/thuyet-minh.json (mặc định: nguoi)")
    ap.add_argument("--nhan", default="", help="nhãn nút chọn giọng trong game (mặc định: Người đọc: <tên>)")
    ap.add_argument("--thu", default="", help="chỉ xử lý thử, ghi mp3 vào thư mục này, không đụng vào game")
    a = ap.parse_args()
    if not a.thu and not (a.nguoi.strip() and a.quyen.strip()):
        loi("Cần --nguoi (họ tên người đọc) và --quyen (căn cứ được dùng, phát hành lại bản thu).")
    import soundfile as sf

    D = json.load(open(SRC, encoding="utf8"))
    goc = json.loads(json.dumps(D))
    gop_chuyen(D)
    H = {m["k"]: bam(m["doc"]) for m in D["muc"]}

    tam = None
    if os.path.isfile(a.vao) and a.vao.lower().endswith(".zip"):
        tam = tempfile.mkdtemp()
        with zipfile.ZipFile(a.vao) as z:
            for t in z.namelist():
                ten = os.path.basename(t)
                if re.match(r"^[\w-]+\.(wav|flac|ogg|mp3)$", ten, re.I):  # chỉ lấy tệp âm thanh, bỏ đường dẫn trong zip
                    open(os.path.join(tam, ten), "wb").write(z.read(t))
        thu_muc = tam
    elif os.path.isdir(a.vao):
        thu_muc = a.vao
    else:
        loi("Không thấy tệp .zip hay thư mục: " + a.vao)

    so = doc_so()
    nhan, bo = [], []
    for ten in sorted(os.listdir(thu_muc)):
        m = re.match(r"^([a-z]+\d*|s\d\d)(?:-([0-9a-f]{8}))?\.(wav|flac|ogg|mp3)$", ten, re.I)
        if not m:
            continue
        k, h = m.group(1), m.group(2)
        if k not in H:
            bo.append("%s: không có đoạn '%s'" % (ten, k))
            continue
        if h and h != H[k]:
            bo.append("%s: lời đoạn %s đã sửa sau khi thu, cần thu lại" % (ten, k))
            continue
        x, sr = sf.read(os.path.join(thu_muc, ten), dtype="float32", always_2d=False)
        r = xu_ly(x, sr)
        if r is None:
            bo.append("%s: không nghe thấy tiếng" % ten)
            continue
        y, on = r
        ra = os.path.join(a.thu, k + ".mp3") if a.thu else os.path.join(DIR, a.giong, k + ".mp3")
        ma_hoa(y, ra)
        nhan.append(k)
        canh = "  (ồn nền cao, nên thu lại ở chỗ yên hơn)" if on > -35 else ""
        print("  %-9s %5.1f giây, ồn nền %4.0f dB so với tiếng nói%s" % (k, len(y) / SR, on, canh))
        if not a.thu:
            so.setdefault(k, {})[a.giong] = H[k]
    for b in bo:
        print("  Bỏ qua " + b)
    if tam:
        import shutil
        shutil.rmtree(tam, ignore_errors=True)
    if not nhan:
        loi("Không nhận được bản thu nào.")
    if a.thu:
        print("Đã xử lý thử %d đoạn vào %s." % (len(nhan), a.thu))
        return

    ten = a.nguoi.strip()
    goc["giong"][a.giong] = {"ten": ten, "nhan": a.nhan.strip() or "Người đọc: " + ten, "nguoi": True, "quyen": a.quyen.strip()}
    json.dump(goc, open(SRC, "w", encoding="utf8", newline="\n"), ensure_ascii=False, indent=1)
    open(SRC, "a", encoding="utf8", newline="\n").write("\n")
    ghi_so(so)
    gop_chuyen(goc)  # sau khi đã ghi tệp json, để không ghi các đoạn chuyện kể vào mục "muc"
    sinh_js(goc, so)
    thieu = [k for k in H if not os.path.exists(os.path.join(DIR, a.giong, k + ".mp3")) or so.get(k, {}).get(a.giong) != H[k]]
    print("Đã nhận %d đoạn giọng %s." % (len(nhan), ten))
    if thieu:
        print("Còn thiếu %d đoạn (game đọc các đoạn này bằng giọng máy): %s" % (len(thieu), ", ".join(thieu)))
    print("Mở game nghe thử rồi commit, push.")


if __name__ == "__main__":
    main()
