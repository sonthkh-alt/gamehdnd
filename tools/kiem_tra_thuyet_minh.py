#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Cho máy "nghe lại" các tệp thuyết minh và ghi bản chép lời vào assets/audio/tm/kiem-tra.txt.

Dùng mô hình nhận dạng tiếng nói Whisper (thư viện faster-whisper) chép lại từng tệp
assets/audio/tm/<giọng>/<khóa>.mp3 rồi so với lời trong data/thuyet-minh.json. Mục đích: phát hiện
đoạn bị đọc thiếu, đọc sai hẳn hoặc tệp hỏng trước khi có người nghe. Đây KHÔNG thay cho việc nghe
bằng tai: máy chép lời cũng có thể chép sai, và nó viết số bằng chữ số nên điểm giống nhau của các
đoạn có năm tháng luôn thấp hơn thực tế.

  pip install faster-whisper soundfile soxr
  python tools/kiem_tra_thuyet_minh.py [--mo-hinh medium]
"""
import argparse, difflib, io, json, os, re, sys, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIR = os.path.join(ROOT, "assets", "audio", "tm")


def chuan(t):
    return re.sub(r"[^\w\s]", " ", t.lower(), flags=re.U).split()


def main():
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf8", line_buffering=True)
    ap = argparse.ArgumentParser()
    ap.add_argument("--mo-hinh", default="medium")
    a = ap.parse_args()
    import soundfile as sf, soxr
    from faster_whisper import WhisperModel
    D = json.load(open(os.path.join(ROOT, "data", "thuyet-minh.json"), encoding="utf8"))
    m = WhisperModel(a.mo_hinh, device="cpu", compute_type="int8")
    out = ["Bản máy chép lại các tệp thuyết minh (Whisper %s), ngày %s." % (a.mo_hinh, time.strftime("%d/%m/%Y")),
           "Điểm giống là tỷ lệ từ trùng với lời gốc (1.00 là trùng hết). Đoạn có năm tháng thường thấp vì máy chép số bằng chữ số.",
           "Tệp này sinh tự động bằng tools/kiem_tra_thuyet_minh.py; chỉ để rà soát, game không dùng.", ""]
    for g in D["giong"]:
        for x in D["muc"]:
            p = os.path.join(DIR, g, x["k"] + ".mp3")
            if not os.path.exists(p):
                out.append("[%s/%s] CHƯA CÓ TỆP" % (g, x["k"]))
                continue
            # Tự giải mã MP3 (soundfile) rồi đưa mảng 16 kHz cho Whisper, không phụ thuộc bộ giải mã của faster-whisper
            w, sr = sf.read(p, dtype="float32", always_2d=False)
            if w.ndim > 1:
                w = w.mean(axis=1)
            dai = len(w) / sr
            segs, info = m.transcribe(soxr.resample(w, sr, 16000), language="vi", beam_size=5)
            t = " ".join(s.text.strip() for s in segs)
            r = difflib.SequenceMatcher(None, chuan(x["doc"]), chuan(t)).ratio()
            out.append("[%s/%s] dài %.1f giây, %d KB, điểm giống %.2f" % (g, x["k"], dai, os.path.getsize(p) // 1024, r))
            out.append("  lời gốc : " + x["doc"])
            out.append("  máy chép: " + t)
            print(out[-3], flush=True)
    open(os.path.join(DIR, "kiem-tra.txt"), "w", encoding="utf8", newline="\n").write("\n".join(out) + "\n")


if __name__ == "__main__":
    main()
