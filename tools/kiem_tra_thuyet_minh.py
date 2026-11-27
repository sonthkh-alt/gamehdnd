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

Kết quả từng tệp được nhớ trong assets/audio/tm/kiem-tra.json; lần sau chỉ chép lại tệp mới hoặc tệp đã đổi lời.
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
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from tao_thuyet_minh import gop_chuyen, bam
    gop_chuyen(D)  # tính cả các đoạn của chuyện kể
    NHO = os.path.join(DIR, "kiem-tra.json")
    try:
        nho = json.load(open(NHO, encoding="utf8"))
    except Exception:
        nho = {}
    m, con = None, {}
    out = ["Bản máy chép lại các tệp thuyết minh (Whisper %s), ngày %s." % (a.mo_hinh, time.strftime("%d/%m/%Y")),
           "Điểm giống là tỷ lệ từ trùng với lời gốc (1.00 là trùng hết). Đoạn có năm tháng thường thấp vì máy chép số bằng chữ số.",
           "Tệp này sinh tự động bằng tools/kiem_tra_thuyet_minh.py; chỉ để rà soát, game không dùng.", ""]
    for g in D["giong"]:
        for x in D["muc"]:
            p = os.path.join(DIR, g, x["k"] + ".mp3")
            if not os.path.exists(p):
                out.append("[%s/%s] CHƯA CÓ TỆP" % (g, x["k"]))
                continue
            khoa, dau = g + "/" + x["k"], "%s-%d-%s" % (bam(x["doc"]), os.path.getsize(p), a.mo_hinh)
            c = nho.get(khoa)
            if not c or c.get("h") != dau:
                if m is None:
                    m = WhisperModel(a.mo_hinh, device="cpu", compute_type="int8")
                # Tự giải mã MP3 (soundfile) rồi đưa mảng 16 kHz cho Whisper, không phụ thuộc bộ giải mã của faster-whisper
                w, sr = sf.read(p, dtype="float32", always_2d=False)
                if w.ndim > 1:
                    w = w.mean(axis=1)
                segs, info = m.transcribe(soxr.resample(w, sr, 16000), language="vi", beam_size=5)
                t = " ".join(s.text.strip() for s in segs)
                c = {"h": dau, "dai": round(len(w) / sr, 1), "r": round(difflib.SequenceMatcher(None, chuan(x["doc"]), chuan(t)).ratio(), 2), "t": t}
                print("[%s] dài %.1f giây, điểm giống %.2f" % (khoa, c["dai"], c["r"]), flush=True)
            con[khoa] = c
            out.append("[%s] dài %.1f giây, %d KB, điểm giống %.2f" % (khoa, c["dai"], os.path.getsize(p) // 1024, c["r"]))
            out.append("  lời gốc : " + x["doc"])
            out.append("  máy chép: " + c["t"])
            # ghi dần để lượt chạy bị ngắt giữa chừng vẫn giữ được phần đã chép
            json.dump(con, open(NHO, "w", encoding="utf8", newline="\n"), ensure_ascii=False, indent=0, sort_keys=True)
    open(os.path.join(DIR, "kiem-tra.txt"), "w", encoding="utf8", newline="\n").write("\n".join(out) + "\n")


if __name__ == "__main__":
    main()
