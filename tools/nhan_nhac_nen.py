#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Nhận một bản thu CÓ QUYỀN SỬ DỤNG làm nhạc nền của game (ví dụ một bản hò sông Mã).

  python tools/nhan_nhac_nen.py <tệp âm thanh> --ten "Hò sông Mã: hò rời bến" --nguoi "Nghệ nhân ..." \
         --nguon "Trung tâm ... cung cấp ngày ..." --quyen "Được ... đồng ý cho dùng trong game theo văn bản số ..." \
         [--khoa ho-song-ma] [--sau] [--tu 0] [--den 180]

Game có danh sách nhạc nền (mục "nhac"."ds" của data/thuyet-minh.json), người chơi chọn ở tab Hồ sơ.
Bản mới nhận được xếp đầu danh sách, tức là thành nhạc mặc định (thêm --sau để xếp cuối).
Nhận lại cùng một --khoa thì thay bản cũ.

Đọc được wav, flac, ogg, mp3. Cần: pip install numpy soundfile soxr lameenc

Việc công cụ làm:
  - cắt lấy đoạn từ giây --tu đến giây --den (mặc định cả bài), trộn về một kênh, 44,1 kHz;
  - chỉnh âm lượng ngang với bản nhạc nền cũ, làm mờ dần ở đầu và cuối, chừa một quãng lặng để lặp lại không gắt;
  - ghi assets/audio/nhac-nen.mp3 (96 kbps);
  - ghi tên bài, người thể hiện, nguồn, căn cứ cho phép dùng vào mục "nhac" của data/thuyet-minh.json
    (game hiện các dòng này ở màn "Tác giả, căn cứ và nguồn") rồi sinh lại data/thuyet-minh.js.

Bắt buộc có --quyen. Giai điệu dân ca thuộc về cộng đồng, nhưng mỗi bản thu vẫn có quyền của người biểu diễn và đơn vị
ghi âm; không lấy bản thu trên mạng (YouTube, trang nhạc, báo, đài) khi chưa được đơn vị giữ quyền đồng ý cho phát hành lại.

Ca khúc có tác giả (ví dụ các bài hát về Thanh Hóa) cần ĐỦ HAI quyền, ghi cả hai vào --quyen:
  1. quyền tác giả của nhạc sĩ: thỏa thuận với Trung tâm Bảo vệ quyền tác giả âm nhạc Việt Nam (VCPMC) hoặc văn bản
     đồng ý của nhạc sĩ, người thừa kế (quyền tác giả còn 50 năm sau khi tác giả mất);
  2. quyền của người biểu diễn và nhà sản xuất bản ghi: văn bản đồng ý của đơn vị làm ra bản thu (đài, nhà hát...).
Thêm --co-loi cho bài có lời hát: game tắt hẳn nhạc khi đang thuyết minh, kể chuyện để hai giọng không đè nhau.
  python tools/nhan_nhac_nen.py bai.mp3 --khoa ca-khuc --nhan "Tên bài" --co-loi --ten "..." --nguoi "Ca sĩ ..." \
         --nguon "..." --quyen "Quyền tác giả: hợp đồng VCPMC số ...; bản ghi: Đài ... đồng ý theo văn bản số ..."

Muốn quay về nhạc nền tự soạn: python tools/tao_nhac_nen.py rồi sửa lại mục "nhac" trong data/thuyet-minh.json.
Thử mà không đụng vào game: thêm --thu <tệp ra.mp3> (chỉ ghi tệp đó).
"""
import argparse, io, json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "data", "thuyet-minh.json")
RA = os.path.join(ROOT, "assets", "audio", "nhac-nen.mp3")
SR = 44100
KBPS = 96
RMS_DB = -19.0   # mức trung bình của bản nhạc nền cũ, để không phải chỉnh lại mức trộn trong game
DINH = 0.89


def loi(m):
    print(m)
    sys.exit(1)


def main():
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf8", line_buffering=True)
    ap = argparse.ArgumentParser(description="Nhận bản thu có quyền sử dụng làm nhạc nền")
    ap.add_argument("tep")
    ap.add_argument("--ten", default="")
    ap.add_argument("--nguoi", default="")
    ap.add_argument("--nguon", default="")
    ap.add_argument("--quyen", default="")
    ap.add_argument("--tu", type=float, default=0.0)
    ap.add_argument("--den", type=float, default=0.0)
    ap.add_argument("--thu", default="")
    ap.add_argument("--khoa", default="that", help="khóa ngắn của bản nhạc; tệp ghi ra assets/audio/nhac-<khóa>.mp3")
    ap.add_argument("--sau", action="store_true", help="xếp cuối danh sách thay vì làm nhạc mặc định")
    ap.add_argument("--nhan", default="", help="nhãn ngắn trên nút chọn nhạc ở tab Hồ sơ, ví dụ 'Hò sông Mã'")
    ap.add_argument("--co-loi", action="store_true",
                    help="bản nhạc có lời hát (ví dụ một ca khúc về Thanh Hóa): game tắt hẳn nhạc khi đang thuyết minh, kể chuyện")
    a = ap.parse_args()
    if not re.match(r"^[a-z0-9-]+$", a.khoa):
        loi("--khoa chỉ gồm chữ thường không dấu, số, gạch nối.")
    if not a.thu and not (a.ten.strip() and a.quyen.strip()):
        loi("Cần --ten (tên bài) và --quyen (căn cứ cho phép dùng và phát hành lại bản thu này).")

    import numpy as np, soundfile as sf, soxr, lameenc
    x, sr = sf.read(a.tep, dtype="float32", always_2d=True)
    x = x.mean(axis=1)
    i, j = int(a.tu * sr), int(a.den * sr) if a.den > 0 else len(x)
    x = x[max(0, i):min(len(x), j)]
    if len(x) < sr * 20:
        loi("Đoạn nhạc ngắn hơn 20 giây, lặp lại sẽ rất nhàm. Hãy chọn đoạn dài hơn.")
    if sr != SR:
        x = soxr.resample(x, sr, SR)
    # mờ dần đầu 1 giây, cuối 3 giây, thêm 1,2 giây lặng trước khi lặp
    n1, n2 = int(1.0 * SR), int(3.0 * SR)
    x[:n1] *= np.linspace(0, 1, n1, dtype="float32") ** 2
    x[-n2:] *= np.linspace(1, 0, n2, dtype="float32") ** 2
    x = np.concatenate([x, np.zeros(int(1.2 * SR), dtype="float32")])
    # âm lượng: đưa mức trung bình về RMS_DB, rồi ép đỉnh mềm nếu vượt
    rms = float(np.sqrt(np.mean(x[np.abs(x) > 1e-4] ** 2))) or 1.0
    x = x * (10 ** (RMS_DB / 20) / rms)
    dinh = float(np.max(np.abs(x)))
    if dinh > DINH:
        x = np.tanh(x / DINH * 1.2) / np.tanh(1.2) * DINH
    pcm = (np.clip(x, -1, 1) * 32767).astype("<i2").tobytes()
    e = lameenc.Encoder()
    e.set_bit_rate(KBPS)
    e.set_in_sample_rate(SR)
    e.set_channels(1)
    e.set_quality(2)
    b = bytes(e.encode(pcm) + e.flush())
    ra = a.thu or os.path.join(ROOT, "assets", "audio", "nhac-%s.mp3" % a.khoa)
    os.makedirs(os.path.dirname(os.path.abspath(ra)), exist_ok=True)
    open(ra, "wb").write(b)
    print("%s: %.1f giây, %d KB, đỉnh %.2f, trung bình %.1f dB" % (
        os.path.relpath(ra, ROOT) if not a.thu else ra, len(x) / SR, len(b) // 1024, float(np.max(np.abs(x))),
        20 * np.log10(float(np.sqrt(np.mean(x ** 2))) + 1e-9)))
    if a.thu:
        return
    D = json.load(open(SRC, encoding="utf8"))
    mo_ta = a.ten.strip().rstrip(".") + "."
    if a.nguoi.strip():
        mo_ta += " Thể hiện: " + a.nguoi.strip().rstrip(".") + "."
    if a.nguon.strip():
        mo_ta += " Nguồn: " + a.nguon.strip().rstrip(".") + "."
    mo_ta += " " + a.quyen.strip().rstrip(".") + "."
    N = D.get("nhac") or {}
    ds = N.get("ds") or ([dict({k: v for k, v in N.items() if k != "ghi_chu"}, k="tu-soan")] if N.get("tep") else [])
    moi = {"k": a.khoa, "tep": os.path.relpath(ra, ROOT).replace(os.sep, "/"), "ten": a.ten.strip(), "nhan": a.nhan.strip() or a.ten.strip()[:30], "nguoi": a.nguoi.strip(),
           "nguon": a.nguon.strip(), "quyen": a.quyen.strip(), "mo_ta": mo_ta}
    if a.co_loi:
        moi["co_loi"] = True
    ds = [x for x in ds if x.get("k") != a.khoa]
    ds = ds + [moi] if a.sau else [moi] + ds
    D["nhac"] = {"ds": ds, "ghi_chu": N.get("ghi_chu", "")}
    json.dump(D, open(SRC, "w", encoding="utf8", newline="\n"), ensure_ascii=False, indent=1)
    open(SRC, "a", encoding="utf8", newline="\n").write("\n")
    subprocess.check_call([sys.executable, os.path.join(ROOT, "tools", "tao_thuyet_minh.py")])
    print("Đã ghi nguồn nhạc vào data/thuyet-minh.json. Mở game nghe thử rồi commit, push.")


if __name__ == "__main__":
    main()
