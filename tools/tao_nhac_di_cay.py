#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Dựng bản hòa tấu không lời điệu "Đi cấy" (dân ca Thanh Hóa, trích Tổ khúc Múa đèn): assets/audio/nhac-di-cay.mp3.

Giai điệu chép theo bản ký âm trong sách giáo khoa Âm nhạc và Mĩ thuật 6, NXB Giáo dục Việt Nam (bài 4, tiết 12, nhịp 2/4, tốc độ vừa phải).
Đây là giai điệu dân ca, không có tác giả riêng; theo Điều 23 Luật Sở hữu trí tuệ, người dùng phải dẫn chiếu
xuất xứ ("Dân ca Thanh Hóa") và giữ giá trị đích thực, nên bản này giữ nguyên giai điệu, chỉ thêm phần đệm.

Âm thanh tổng hợp hoàn toàn bằng máy, dùng lại các tiếng sáo, đàn dây gảy, trống, chiêng, tiếng nước của
tools/tao_nhac_nen.py; không dùng bản thu nào nên không vướng quyền của người biểu diễn, đơn vị ghi âm.

Bố cục (khoảng 2 phút, lặp lại được): đàn dạo câu kết -> sáo hát lần 1 -> đàn tranh lần 2 có trống
-> sáo và đàn cùng chơi lần 3 -> sáo nhắc lại câu kết chậm dần, tiếng chiêng.

Cách dùng:  pip install numpy lameenc   rồi   python tools/tao_nhac_di_cay.py
Sau đó mục "nhac"."ds" của data/thuyet-minh.json cần có bản k="di-cay" rồi chạy python tools/tao_thuyet_minh.py.
"""
import io, os, sys
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tao_nhac_nen import pluck, sao, chieng, drum, rim, nuoc, pad  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "audio", "nhac-di-cay.mp3")
SR = 44100
BPM = 72            # "Vừa phải", tính theo nốt đen
B = 60 / BPM        # một phách (nốt đen)
S16 = B / 4         # một nốt móc kép
M = 2 * B           # một ô nhịp 2/4

# ---- Giai điệu, chép theo sách Âm nhạc và Mĩ thuật 6 ----
# Mỗi nốt: "tên:số móc kép"; "~" đứng đầu là luyến từ nốt trước; "R" là dấu lặng;
# "^" cuối là nốt hoa mỹ đứng trước (luyến láy nhanh), "!" cuối là dấu ngân (fermata).
NHAC = """
G4:4
| D4:2 D4:1 ~E4:1 D4:2 D4:2 | G4:4 G4:4 | D4:2 D4:1 ~E4:1 D4:2 D4:2 | G4:2 G4:2 G4:2 D4:2
| D4:2 G4:1 ~A4:1 B4:2 B4:1 ~A4:1 | G4:4 G4:2 A4:2 | G4:2 A4:2 F#4:2 F#4:2 | G4:2 A4:2 F#4:1 ~G4:1 F#4:2
| G4:2 R:2 B4:3 ~A4:1 | G4:4 B4:2 ~A4:1 ~B4:1 | D5:4 B4:2 ~D5:2 | B4:4 A4:2 ~B4:1 ~A4:1
| G4:2 R:2 B4:2 ~D5:2 | B4:4 A4:2 ~B4:1 ~A4:1 | G4:3 B4:1 G4:2 G4:2 | A4:8
| R:2 G4:2 A4:2 A4:2 | D5:2 ~B4:5 ~D5:1 | G4^ A4:4 A4:1 ~G4:1 E4:1 ~G4:1 | E4:2 G4:6!
"""
# Lời (để đối chiếu): Lên chùa bẻ một cành sen, lên chùa bẻ một cành sen, ăn cơm bằng đèn đi cấy sáng trăng.
# Ba bốn cô có hẹn cùng chăng, có bạn cùng chăng. Thắp đèn ta sẽ chơi trăng ngoài thềm, chơi trăng ngoài thềm,
# ý rằng cầu cho. Cầu cho trong ấm, êm êm lại ngoài êm.

# Nốt trầm đệm từng ô nhịp (theo hợp âm thường dùng của bài, dịch về giọng Son): ô 1 đến 20
GOC = "G E G E D G E G G G G G G G G A A D D G".split()

TEN = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}


def tan_so(t):
    """'F#4' -> tần số (Hz)."""
    n = TEN[t[0]] + (1 if "#" in t else 0)
    o = int(t[-1])
    return 440.0 * 2 ** ((n + 12 * (o + 1) - 69) / 12)


def doc_nhac():
    """Trả về (đảo phách, [ô nhịp]); mỗi nốt là dict f, s (vị trí móc kép trong ô), d, luyen, lay, ngan."""
    phan = NHAC.strip().split("|")
    o_nhip = []
    for p in phan:
        vt, ds, lay = 0, [], None
        for tk in p.split():
            if tk.endswith("^"):
                lay = tan_so(tk[:-1])
                continue
            ngan = tk.endswith("!")
            tk = tk.rstrip("!")
            luyen = tk.startswith("~")
            ten, d = tk.lstrip("~").split(":")
            d = int(d)
            if ten != "R":
                ds.append({"f": tan_so(ten), "s": vt, "d": d, "luyen": luyen, "lay": lay, "ngan": ngan})
            lay = None
            vt += d
        o_nhip.append((vt, ds))
    dau = o_nhip[0]
    for i, (vt, _) in enumerate(o_nhip[1:], 1):
        assert vt == 8, "ô nhịp %d có %d móc kép, phải là 8" % (i, vt)
    return dau, [x[1] for x in o_nhip[1:]]


DAU, ON = doc_nhac()
CHIEU_DAI = 140.0
out = np.zeros(int(SR * CHIEU_DAI))


def add(sig, t, g=1.0):
    i = int(t * SR)
    if i < 0:
        sig, i = sig[-i:], 0
    n = min(len(sig), len(out) - i)
    if n > 0:
        out[i:i + n] += sig[:n] * g


def cac_not(tu, den, co_dau):
    """Các nốt từ ô nhịp tu đến den (đếm từ 1), kèm vị trí tính bằng móc kép kể từ đầu ô tu."""
    r = []
    if co_dau:
        for n in DAU[1]:
            r.append(dict(n, s=n["s"] - DAU[0]))
    for k in range(tu, den + 1):
        for n in ON[k - 1]:
            r.append(dict(n, s=n["s"] + (k - tu) * 8))
    return r


def choi_sao(t0, tu, den, g=.16, quang=2.0, co_dau=True, cham=1.0):
    """Sáo trúc (cao hơn bản ký âm một quãng tám như cách thổi thường gặp)."""
    truoc = None
    for n in cac_not(tu, den, co_dau):
        f = n["f"] * quang
        u = S16 * cham
        bd = t0 + n["s"] * u
        d = n["d"] * u * (1.8 if n["ngan"] else 1.0)
        if n["lay"]:
            add(sao(n["lay"] * quang, .07), bd - .07, g * .8)
            truoc = n["lay"] * quang
        add(sao(f, d * .97, truoc if (n["luyen"] or n["lay"]) else None), bd, g * (.85 if n["luyen"] else 1.0))
        truoc = f


def choi_dan(t0, tu, den, g=.30, co_dau=True, quang=1.0, cham=1.0):
    """Đàn tranh: gảy từng nốt, nốt luyến gảy nhẹ hơn, nốt dài rung (nhấn) nhiều hơn."""
    for n in cac_not(tu, den, co_dau):
        f = n["f"] * quang
        u = S16 * cham
        bd = t0 + n["s"] * u
        dai = n["d"] >= 4 or n["ngan"]
        if n["lay"]:
            add(pluck(n["lay"] * quang, 1.0, .6, .2), bd - .06, g * .45)
        add(pluck(f, 3.2 if dai else 2.2, .55, .9 if dai else .4), bd, g * (.55 if n["luyen"] else 1.0))


def dem(t0, tu, den, g=.11, cham=1.0):
    """Đệm đàn: nốt trầm phách 1, quãng năm ở nửa sau phách 2 (phách 1 mạnh, phách 2 nhẹ)."""
    for k in range(tu, den + 1):
        x = GOC[k - 1]
        r = tan_so(x + ("3" if x in "DE" else "2"))   # trầm từ Son 2 đến Mi 3
        t = t0 + (k - tu) * M * cham
        add(pluck(r, 2.6, .3, .2), t, g)
        add(pluck(r * 1.5, 2.0, .35, .2), t + 1.5 * B * cham, g * .6)


def trong(t0, tu, den, g=1.0):
    for k in range(tu, den + 1):
        t = t0 + (k - tu) * M
        add(drum(96, .45, 1.0), t, .26 * g)
        add(rim(), t + B, .07 * g)
        if k % 4 == 0:
            add(drum(118, .3, .7), t + 1.5 * B, .13 * g)


def main():
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf8", line_buffering=True)
    import lameenc
    G2, D3, G3 = tan_so("G2"), tan_so("D3"), tan_so("G3")
    t = 0.6
    # 1. Dạo đầu: chiêng, đàn tranh dạo câu kết (ô 17 đến 20)
    add(chieng(D3), t, .13)
    choi_dan(t + .8, 17, 20, .24, co_dau=False)
    t += .8 + 4 * M + B                       # chừa một phách cho nốt đảo phách
    # 2. Lần 1: sáo hát giai điệu, đàn đệm thưa
    choi_sao(t, 1, 20, .15)
    dem(t, 1, 20, .09)
    t += 20 * M
    # 3. Chuyển: đàn rải âm ngũ cung
    for k, f in enumerate(("G3", "A3", "B3", "D4", "E4", "G4")):
        add(pluck(tan_so(f), 2.4, .5, .4), t + k * B / 2, .2)
    t += 2 * M + B
    # 4. Lần 2: đàn tranh giai điệu, sáo ngân nốt dài phía sau, trống nhẹ
    choi_dan(t, 1, 20, .30)
    dem(t, 1, 20, .10)
    trong(t, 1, 20, .65)
    for k, f in ((2, "B4"), (6, "D5"), (10, "D5"), (16, "E5"), (20, "D5")):
        add(sao(tan_so(f), 2 * B), t + (k - 1) * M, .07)
    add(chieng(G3), t + 8 * M, .07)
    t += 20 * M + B
    # 5. Lần 3: sáo và đàn cùng chơi, trống đầy
    choi_sao(t, 1, 20, .14)
    choi_dan(t, 1, 20, .20)
    dem(t, 1, 20, .11)
    trong(t, 1, 20, 1.0)
    t += 20 * M
    # 6. Kết: sáo nhắc câu cuối chậm dần, tiếng chiêng
    cham = 1.22
    choi_sao(t + B, 17, 20, .13, co_dau=False, cham=cham)
    dem(t + B, 17, 20, .08, cham=cham)
    te = t + B + 4 * M * cham
    add(pluck(G2 * 2, 5.0, .3, .2), te - .2, .16)
    add(chieng(G2 * 2, 6.0), te - .2, .08)
    dai = te + 3.2
    n = int(SR * dai)
    add(nuoc(dai), 0, .028)
    add(pad(G2 * 2, dai - 4, .035), .5)
    add(pad(D3, dai - 12, .02), 5.0)
    y = out[:n + int(SR * 2)].copy()
    for dl, g in ((.19, .22), (.37, .13), (.61, .07)):  # tiếng vang nhẹ
        d = int(dl * SR)
        y[d:] += y[:-d] * g
    y = y[:n]
    y = np.tanh(y * 1.15)
    y = y / np.max(np.abs(y)) * 0.80
    rms = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)
    y *= 10 ** (min(0.0, -19.0 - rms(y)) / 20)   # ngang mức các bản nhạc nền khác (khoảng -19 dB)
    fi, fo = int(SR * 1.2), int(SR * 3.0)
    y[:fi] *= np.linspace(0, 1, fi) ** 2
    y[-fo:] *= np.linspace(1, 0, fo) ** 2
    e = lameenc.Encoder()
    e.set_bit_rate(96)
    e.set_in_sample_rate(SR)
    e.set_channels(1)
    e.set_quality(2)
    b = e.encode((y * 32767).astype("<i2").tobytes()) + e.flush()
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    open(OUT, "wb").write(bytes(b))
    print("assets/audio/nhac-di-cay.mp3: %.1f giây, %d KB, đỉnh %.2f, mức trung bình %.1f dB" % (dai, len(b) // 1024, np.max(np.abs(y)), rms(y)))


if __name__ == "__main__":
    main()
