#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Tổng hợp nhạc nền của game: assets/audio/nhac-nen.mp3 (một vòng lặp dài khoảng 107 giây).

Nhạc TỰ SOẠN, tổng hợp hoàn toàn bằng máy, không dùng bản thu nào:
  - thang ngũ cung Rê (rê, mi, son, la, si), cùng chất liệu với nhạc phim giới thiệu (tools/phim/audio.py);
  - đàn dây gảy (thuật toán Karplus-Strong, có luyến nhẹ kiểu đàn tranh), tiếng sáo, trống hội, tiếng chiêng,
    nền tiếng nước chảy gợi dòng sông Mã.
Đây không phải là một làn điệu dân ca có thật (không phải hò sông Mã hay dân ca Đông Anh).
Muốn dùng bản thu thật có bản quyền hợp lệ: chép đè lên assets/audio/nhac-nen.mp3 (nên là tệp MP3 đơn kênh,
mở đầu và kết thúc lặng để lặp lại không bị gắt).

Cách dùng:  pip install numpy lameenc   rồi   python tools/tao_nhac_nen.py
"""
import io, os, sys
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "audio", "nhac-nen.mp3")
SR = 44100
BPM = 72
B = 60 / BPM
BARS = 32
DUR = BARS * 4 * B
out = np.zeros(int(SR * (DUR + 6)))
rng = np.random.default_rng(11)


def add(sig, t, g=1.0):
    i = int(t * SR)
    n = min(len(sig), len(out) - i)
    if n > 0:
        out[i:i + n] += sig[:n] * g


def drum(f0=92, d=.5, punch=1.0):
    t = np.arange(int(SR * d)) / SR
    f = f0 * (1 + 1.6 * np.exp(-t * 28))
    ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) * np.exp(-t * 7) + rng.standard_normal(len(t)) * np.exp(-t * 60) * .2) * punch


def rim(d=.09):
    t = np.arange(int(SR * d)) / SR
    return (np.sin(2 * np.pi * 1700 * t) + .6 * np.sin(2 * np.pi * 2450 * t)) * np.exp(-t * 70) * .5 + rng.standard_normal(len(t)) * np.exp(-t * 120) * .3


_pl = {}


def pluck(f, d=2.4, bright=.5, bend=.5):
    """Dây gảy Karplus-Strong; bend là độ luyến nhẹ kiểu đàn tranh."""
    k = (round(f, 2), d, bright, bend)
    if k in _pl:
        return _pl[k]
    n = int(SR * d)
    p = int(SR / f)
    buf = np.random.default_rng(int(f * 7)).uniform(-1, 1, p)
    for _ in range(int(3 * (1 - bright)) + 1):
        buf = (buf + np.roll(buf, 1)) / 2
    y = np.zeros(n)
    buf = list(buf)
    for i in range(n):
        j = i % p
        y[i] = buf[j]
        buf[j] = 0.996 * 0.5 * (buf[j] + buf[(j + 1) % p])
    t = np.arange(n) / SR
    if bend:
        vib = np.sin(2 * np.pi * 5.5 * t) * bend * np.minimum(1, t * 3)
        y = np.interp(np.clip(np.arange(n) + vib * SR / f * 0.08, 0, n - 1), np.arange(n), y)
    y = y * np.exp(-t * 0.9)
    _pl[k] = y
    return y


def sao(f, d, truoc=None):
    """Tiếng sáo: sóng sin có bồi âm, rung nhẹ, có hơi thổi; truoc là nốt liền trước để luyến lên, xuống."""
    n = int(SR * (d + .25))
    t = np.arange(n) / SR
    fr = np.full(n, float(f))
    if truoc:
        fr = truoc + (f - truoc) * np.minimum(1, t / .09)
    fr = fr * (1 + 0.006 * np.sin(2 * np.pi * 5.2 * t) * np.clip((t - .25) / .4, 0, 1))
    ph = 2 * np.pi * np.cumsum(fr) / SR
    y = np.sin(ph) + .28 * np.sin(2 * ph + .4) + .09 * np.sin(3 * ph)
    hoi = np.convolve(rng.standard_normal(n), np.ones(8) / 8, "same")
    env = np.minimum(1, t / .07) * np.clip((d + .2 - t) / .2, 0, 1)
    return (y + hoi * .05) * env


def chieng(f, d=7.0):
    """Tiếng chiêng: nhiều bồi âm lệch nhau, ngân dài."""
    t = np.arange(int(SR * d)) / SR
    y = np.zeros(len(t))
    for r, a, dc in ((1, 1, .6), (1.5, .3, 1.0), (2.0, .5, .9), (2.76, .2, 1.7), (3.4, .1, 2.5), (4.1, .07, 3.2)):
        y += a * np.sin(2 * np.pi * f * r * t * (1 + .003 * np.exp(-t * 3)) + r) * np.exp(-t * dc)
    return y * np.minimum(1, t / .004)


def pad(f, d, g=.05):
    t = np.arange(int(SR * d)) / SR
    env = np.minimum(1, t / 3) * np.minimum(1, (d - t) / 3)
    return (np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * f * 1.5 * t + .3) + .3 * np.sin(2 * np.pi * f * 2 * t)) * env * g


def nuoc(d):
    """Tiếng nước chảy: nhiễu trắng lọc dải, lên xuống chậm."""
    n = int(SR * d)
    X = np.fft.rfft(rng.standard_normal(n))
    f = np.fft.rfftfreq(n, 1 / SR)
    X *= np.exp(-((np.log(np.maximum(f, 1) / 700)) ** 2) / 0.9) / np.sqrt(np.maximum(f, 60) / 60)
    y = np.fft.irfft(X, n)
    y /= np.max(np.abs(y))
    t = np.arange(n) / SR
    return y * (.6 + .25 * np.sin(2 * np.pi * .13 * t) + .15 * np.sin(2 * np.pi * .31 * t + 1))


# thang ngũ cung Rê: D E G A B
D3, G3, A3, D4, E4, G4, A4, B4, D5, E5, G5 = 146.83, 196.0, 220.0, 293.66, 329.63, 392.0, 440.0, 493.88, 587.33, 659.25, 783.99
# Bốn câu đàn (mỗi câu 2 ô nhịp), lấy lại từ nhạc phim giới thiệu: (cao độ, phách bắt đầu)
P = [[(D4, 0), (A4, 1), (B4, 1.5), (A4, 2), (G4, 3), (E4, 3.5), (D4, 4), (E4, 5), (G4, 5.5), (A4, 6)],
     [(A4, 0), (B4, .5), (D5, 1), (B4, 2), (A4, 2.5), (G4, 3), (A4, 4), (E4, 5), (G4, 6), (D4, 7)],
     [(D5, 0), (E5, .5), (D5, 1), (B4, 1.5), (A4, 2), (B4, 3), (D5, 3.5), (E5, 4), (G5, 5), (E5, 5.5), (D5, 6)],
     [(B4, 0), (A4, .5), (G4, 1), (A4, 2), (D5, 3), (B4, 4), (A4, 4.5), (G4, 5), (E4, 6), (D4, 7)]]
# Bốn câu sáo (mỗi câu 2 ô nhịp): (cao độ, phách bắt đầu, số phách ngân)
F = [[(A4, 0, 2), (B4, 2, 1), (A4, 3, 1), (G4, 4, 1), (E4, 5, 1), (D4, 6, 2)],
     [(E4, 0, 1), (G4, 1, 1), (A4, 2, 2), (B4, 4, 1), (A4, 5, 1), (G4, 6, 2)],
     [(D5, 0, 2), (B4, 2, 1), (A4, 3, 1), (B4, 4, 1.5), (A4, 5.5, .5), (G4, 6, 2)],
     [(A4, 0, 1), (G4, 1, 1), (E4, 2, 2), (G4, 4, 1), (E4, 5, 1), (D4, 6, 2)]]
GOC = [D3, D3, G3, A3]  # nốt trầm của bốn ô nhịp liên tiếp


def cau_dan(i, u, g=.30):
    for f, s in P[i]:
        add(pluck(f, 2.4, .55, .6), u * 8 * B + s * B, g)
        if s in (0, 4):
            add(pluck(f / 2, 2.8, .3, .3), u * 8 * B + s * B, g * .6)


def cau_sao(i, u, g=.15):
    truoc = None
    for f, s, d in F[i]:
        add(sao(f, d * B * .96, truoc), u * 8 * B + s * B, g)
        truoc = f


def dem(o, g=.12):
    """Đệm: nốt trầm, quãng năm, quãng tám."""
    r = GOC[o % 4]
    add(pluck(r, 3.0, .3, .2), o * 4 * B, g)
    add(pluck(r * 1.5, 2.4, .35, .2), o * 4 * B + 2 * B, g * .7)
    add(pluck(r * 2, 2.0, .4, .2), o * 4 * B + 3 * B, g * .55)


def trong(o, g=1.0):
    t = o * 4 * B
    add(drum(92, .5, 1.0), t, .30 * g)
    add(drum(92, .4, .8), t + 2 * B, .20 * g)
    for s in (1, 3):
        add(rim(), t + s * B, .08 * g)
    if o % 4 == 3:
        add(drum(110, .3, .7), t + 3.5 * B, .15 * g)


def main():
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf8", line_buffering=True)
    import lameenc
    add(nuoc(DUR), 0, .035)
    add(pad(D3, DUR - 4, .04), 1.0)
    add(pad(A3, DUR - 14, .025), 6.0)
    add(chieng(D3 / 2 * 1.5), 0.2, .16)
    add(chieng(D3), 16 * 4 * B, .13)
    # 16 đoạn, mỗi đoạn 2 ô nhịp: mở đầu thưa, giữa đầy dần, cuối lắng lại
    for u in range(16):
        if u in (0, 1, 4, 5, 12, 13):
            cau_dan(u % 2, u, .22 if u < 2 else .30)
        if u in (8, 9):
            cau_dan(2 + u % 2, u)
        if u == 14:
            cau_dan(3, u, .24)
        if u in (2, 3, 6, 7, 10, 11):
            cau_sao({2: 0, 3: 1, 6: 2, 7: 3, 10: 0, 11: 1}[u], u)
        if u == 13:
            cau_sao(3, u, .11)
        if u == 12:
            add(sao(A4, 4 * B * .96), u * 8 * B, .09)
            add(sao(D5, 4 * B * .96, A4), u * 8 * B + 4 * B, .09)
        for o in (2 * u, 2 * u + 1):
            if 2 <= u <= 14:
                dem(o, .12 if u not in (2, 3, 14) else .09)
            if 2 <= u <= 13:
                trong(o, .7 if u in (2, 3, 12, 13) else 1.0)
    te = 30 * 4 * B  # hai ô nhịp kết: rải hợp âm rồi một tiếng chiêng nhỏ
    for k, f in enumerate((D4, A4, D5)):
        add(pluck(f, 4.0, .5, .5), te + k * .9 * B, .26)
    add(pluck(D3, 5.0, .3, .2), te + 3.4 * B, .2)
    add(chieng(D3, 6.0), te + 3.4 * B, .09)
    n = int(SR * DUR)
    y = out[:n + int(SR * 2)].copy()
    for dl, g in ((.19, .22), (.37, .13), (.61, .07)):  # tiếng vang nhẹ
        d = int(dl * SR)
        y[d:] += y[:-d] * g
    y = y[:n]
    y = np.tanh(y * 1.15)
    y = y / np.max(np.abs(y)) * 0.80
    fi, fo = int(SR * 1.6), int(SR * 3.5)
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
    rms = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)
    print("assets/audio/nhac-nen.mp3: %.1f giây, %d KB, đỉnh %.2f, mức trung bình %.1f dB" % (DUR, len(b) // 1024, np.max(np.abs(y)), rms(y)))
    print("Mức từng đoạn 8 ô nhịp (dB): " + ", ".join("%.1f" % rms(y[int(i * 8 * 4 * B * SR):int((i + 1) * 8 * 4 * B * SR)]) for i in range(4)))
    print("Nửa giây đầu %.1f dB, nửa giây cuối %.1f dB" % (rms(y[:SR // 2]), rms(y[-SR // 2:])))


if __name__ == "__main__":
    main()
