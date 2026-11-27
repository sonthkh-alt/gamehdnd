#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Lấy thông tin tổ chức, nhân sự từ Cổng thông tin điện tử Đoàn ĐBQH và HĐND tỉnh Thanh Hóa
(https://dbndthanhhoa.gov.vn) để dựng mục "Bộ máy" trong game.

Sinh ra:
  data/bo-may.json        bản đầy đủ, dễ đọc (không sửa tay, chạy lại công cụ này)
  data/bo-may.js          bản gọn cho game (window.NTS_BOMAY)
  assets/img/db/*.jpg     ảnh chân dung đại biểu khóa đương nhiệm, đã cắt và thu nhỏ
  nguon/dbnd_*.txt        bản chụp nội dung các trang đã dùng, kèm địa chỉ và ngày truy cập

Cách dùng:
  python tools/lay_bo_may.py                 tải lại toàn bộ từ Cổng (khoảng 130 trang, mất 10 đến 15 phút)
  python tools/lay_bo_may.py --cache <thư mục>   giữ các trang đã tải để lần sau chạy nhanh
  python tools/lay_bo_may.py --khong-anh     không tải lại ảnh chân dung

Nguyên tắc:
  - Chỉ lấy họ tên, chức vụ, đơn vị bầu cử, giới tính và ảnh chân dung. KHÔNG đưa số điện thoại,
    ngày sinh, quê quán, nơi ở, thư điện tử cá nhân vào kho.
  - Giữ nguyên chữ nghĩa như Cổng đăng; không bổ sung theo trí nhớ. Riêng năm của các khóa Quốc hội
    (bảng NK_QH) và các khóa HĐND tỉnh (NK_HD) Cổng không ghi trong danh sách nên được ghi sẵn ở đây.
  - Cuối trang Cổng ghi: "Khi phát hành thông tin đề nghị ghi rõ nguồn: dbndthanhhoa.gov.vn".
"""
import argparse, hashlib, html, io, json, os, re, sys, time, unicodedata, urllib.parse, urllib.request
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = "https://dbndthanhhoa.gov.vn"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
NGHI = 1.0  # giây nghỉ giữa hai lần tải, để không làm nặng máy chủ của Cổng

QH = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI"]
NK_QH = {"I": "1946 - 1960", "II": "1960 - 1964", "III": "1964 - 1971", "IV": "1971 - 1975", "V": "1975 - 1976",
         "VI": "1976 - 1981", "VII": "1981 - 1987", "VIII": "1987 - 1992", "IX": "1992 - 1997", "X": "1997 - 2002",
         "XI": "2002 - 2007", "XII": "2007 - 2011", "XIII": "2011 - 2016", "XIV": "2016 - 2021", "XV": "2021 - 2026",
         "XVI": "2026 - 2031"}
NK_HD = {"XVI": "2011 - 2016", "XVII": "2016 - 2021", "XVIII": "2021 - 2026", "XIX": "2026 - 2031"}
ROMAN = {"I": 1, "V": 5, "X": 10, "L": 50}
P_QH = "/portal/Home/danh-sach-dai-bieu-qh/"
P_HD = "/portal/Home/danh-sach-dai-bieu/"
P_DB = "/portal/Home/danh-sach-danh-ba/default.aspx"
MAC_DINH = {  # dùng khi không dò được đường dẫn trên trang chủ
    "cc_hd": "/portal/KenhTin/Co-cau-to-chuc-Thuong-truc-481626-493089-493090-493090.aspx",
    "cc_qh": "/portal/KenhTin/Co-cau-to-chuc-493721.aspx",
    "cc_vp": "/portal/KenhTin/Co-cau-to-chuc-VP.aspx",
    "cn_qh": "/portal/KenhTin/Chuc-nang-nhiem-vu.aspx",
    "cn_vp": "/portal/KenhTin/Chuc-nang-nhiem-vu-VP.aspx",
    "qc_vp": "/portal/KenhTin/Quy-che-hoat-dong-Van-Phong.aspx",
}
CACHE = None


def roman(s):
    t = 0
    for a, b in zip(s, s[1:] + " "):
        v = ROMAN[a]
        t += -v if b in ROMAN and ROMAN[b] > v else v
    return t


def full(path):
    if path.startswith("http"):
        return path
    return BASE + urllib.parse.quote(path, safe="/?=&%:.-_~")


def tai(path, binary=False):
    """Tải một trang (có lưu đệm nếu dùng --cache). Trả về chuỗi; trang lỗi trả về ''."""
    u = full(path)
    f = os.path.join(CACHE, hashlib.sha1(u.encode()).hexdigest()[:16] + (".bin" if binary else ".html")) if CACHE else None
    if f and os.path.exists(f):
        b = open(f, "rb").read()
    else:
        b = b""
        for lan in range(3):
            try:
                with urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": UA}), timeout=90) as r:
                    b = r.read()
                break
            except urllib.error.HTTPError as e:
                if e.code == 404:
                    b = b"404"
                    break
                time.sleep(3 + 4 * lan)
            except Exception:
                time.sleep(3 + 4 * lan)
        time.sleep(NGHI)
        if f and b:
            open(f, "wb").write(b)
    if binary:
        return b if len(b) > 500 else b""
    s = b.decode("utf-8", "replace")
    return "" if len(s) < 500 else s


def sach(s):
    return " ".join(html.unescape(re.sub(r"<[^>]+>", "", s)).replace("\u200b", "").split())


def van_ban(s):
    s = re.sub(r"(?is)<(script|style|noscript)\b.*?</\1>", "", s)
    s = re.sub(r"(?i)<br\s*/?>|</p>|</div>|</tr>|</li>|</h\d>", "\n", s)
    s = re.sub(r"(?i)</td>|</th>", " | ", s)
    s = html.unescape(re.sub(r"<[^>]+>", "", s)).replace("\u200b", "")
    return "\n".join(l for l in (" ".join(x.split()) for x in s.split("\n")) if l and l != "|")


def than_bai(s):
    """Phần nội dung chính của một trang (bỏ trình đơn và chân trang)."""
    t = van_ban(s)
    k = "Văn bản - tài liệu\n-->"
    a = t.find(k)
    a = a + len(k) if a >= 0 else 0
    b = t.find("Video hoạt động", a)
    return t[a:b if b >= 0 else len(t)].strip()


def lien_ket(s):
    return [(html.unescape(m.group(1)), sach(m.group(2))) for m in re.finditer(r'(?is)<a\b[^>]*href="([^"#]+)"[^>]*>(.*?)</a>', s)]


def ten_dep(t):
    t = unicodedata.normalize("NFC", t).strip(" .,;")
    if t.upper() == t:
        t = " ".join(w[:1].upper() + w[1:].lower() for w in t.split())
    return t


def bang_dai_bieu(s):
    i = s.find('id="tableDaiBieu"')
    j = s.find("</table>", i)
    o = []
    for tr in re.findall(r"(?is)<tr>(.*?)</tr>", s[i:j]):
        td = [sach(x) for x in re.findall(r"(?is)<td[^>]*>(.*?)</td>", tr)]
        m = re.search(r"detail\.aspx\?v=(\d+)", tr)
        if len(td) >= 5 and td[1]:
            o.append({"ten": ten_dep(td[1]), "cv": td[2].strip(" ."), "ns": td[3], "nu": td[4].strip().lower() == "nữ", "id": int(m.group(1)) if m else 0})
    seen, r = set(), []
    for x in o:  # Cổng có vài dòng nhập trùng
        k = (x["ten"], x["ns"])
        if k not in seen:
            seen.add(k)
            r.append(x)
    return r


def tieu_su(s):
    a = s.find("TIỂU SỬ")
    b = s.find("Video hoạt động", a)
    d = {}
    for tr in re.findall(r"(?is)<tr[^>]*>(.*?)</tr>", s[a:b] if a >= 0 else ""):
        td = [sach(x) for x in re.findall(r"(?is)<t[dh][^>]*>(.*?)</t[dh]>", tr)]
        if len(td) >= 2 and td[0]:
            d[td[0]] = td[1]
    m = re.search(r'(?i)<img\b[^>]*src="([^"]*AnhDaiDien[^"]+)"', s)
    d["_anh"] = html.unescape(m.group(1)) if m else ""
    return d


def don_vi(t):
    m = re.match(r"\s*Đơn vị bầu cử số\s*:?\s*(\d+)\s*[:,]?\s*(.*)$", t or "", re.S)
    if not m:
        return 0, ""
    mo = m.group(2).strip(" .")
    return int(m.group(1)), (mo[:1].upper() + mo[1:]) if mo else ""


def luu_anh(url, out):
    from PIL import Image, ImageOps
    b = tai(url if url.startswith("http") else BASE + urllib.parse.quote(urllib.parse.unquote(url), safe="/"), binary=True)
    if not b:
        return False
    try:
        im = ImageOps.exif_transpose(Image.open(io.BytesIO(b))).convert("RGB")
    except Exception:
        return False
    w, h = im.size
    if w * 5 > h * 4:  # quá ngang: cắt hai bên
        nw = h * 4 // 5
        im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    else:  # quá dọc: giữ phần trên (khuôn mặt)
        nh = w * 5 // 4
        top = min(h - nh, max(0, (h - nh) // 6))
        im = im.crop((0, top, w, top + nh))
    im = im.resize((240, 300), Image.LANCZOS)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    im.save(out, "JPEG", quality=80, optimize=True, progressive=True)
    return True


def vai_tro_tt(cv):
    if re.search(r"Phó Chủ tịch Thường trực", cv):
        return "Phó Chủ tịch Thường trực HĐND tỉnh"
    if re.search(r"Phó Chủ tịch Hội đồng nhân dân|Phó Chủ tịch HĐND", cv):
        return "Phó Chủ tịch HĐND tỉnh"
    if re.search(r"Chủ tịch Hội đồng nhân dân|Chủ tịch HĐND", cv):
        return "Chủ tịch HĐND tỉnh"
    m = re.search(r"Trưởng Ban ([^,.;]+?)(?: HĐND| Hội đồng|$)", cv)
    return ("Trưởng Ban " + m.group(1).strip() + " HĐND tỉnh") if m else cv


def ten_ban(t):
    t = t.replace("KTNS", "Kinh tế - Ngân sách")
    for k, n in (("Pháp chế", "Ban Pháp chế"), ("Kinh tế", "Ban Kinh tế - Ngân sách"), ("Văn hóa", "Ban Văn hóa - Xã hội"), ("Dân tộc", "Ban Dân tộc")):
        if re.search(r"Ban\s+" + k, t):
            return n
    return ""


def ten_phong(t):
    for k, n in (("Công tác Quốc hội", "Phòng Công tác Quốc hội"), ("Công tác H", "Phòng Công tác Hội đồng nhân dân"),
                 ("Tổng hợp", "Phòng Tổng hợp, Thông tin, Dân nguyện"), ("Hành chính", "Phòng Hành chính, Tổ chức, Quản trị")):
        if k.lower() in t.lower():
            return n
    return ""


def main():
    global CACHE
    ap = argparse.ArgumentParser()
    ap.add_argument("--cache")
    ap.add_argument("--khong-anh", action="store_true")
    a = ap.parse_args()
    if a.cache:
        CACHE = os.path.abspath(a.cache)
        os.makedirs(CACHE, exist_ok=True)
    say = lambda *x: print(*x, flush=True)
    homnay = date.today().strftime("%d/%m/%Y")
    nguon = {}  # tên tệp nguon -> [(tiêu đề, địa chỉ, nội dung)]

    def ghi(tep, tieu_de, path, noi_dung):
        nguon.setdefault(tep, []).append((tieu_de, full(path), noi_dung))

    home = tai("/portal/Home/default.aspx")
    if not home:
        sys.exit("Không tải được trang chủ của Cổng.")
    U = dict(MAC_DINH)
    for k, rx in (("cc_hd", r"/portal/KenhTin/Co-cau-to-chuc-Thuong-truc[^\"' ]*\.aspx"), ("cc_qh", r"/portal/KenhTin/Co-cau-to-chuc-\d+\.aspx"),
                  ("cc_vp", r"/portal/KenhTin/Co-cau-to-chuc-VP\.aspx"), ("cn_qh", r"/portal/KenhTin/Chuc-nang-nhiem-vu\.aspx"),
                  ("cn_vp", r"/portal/KenhTin/Chuc-nang-nhiem-vu-VP\.aspx"), ("qc_vp", r"/portal/KenhTin/Quy-che-hoat-dong-Van-Phong\.aspx")):
        m = re.search(rx, home)
        if m:
            U[k] = m.group(0)
    ft = van_ban(home)
    co_quan = {"ten": "Đoàn đại biểu Quốc hội và Hội đồng nhân dân tỉnh Thanh Hóa"}
    for k, rx in (("diachi", r"Địa chỉ:\s*([^\n]+)"), ("dt", r"Điện thoại:\s*([^;\n]+)"), ("email", r"Email:\s*([\w.\-]+@thanhhoa\.gov\.vn)")):
        m = re.search(rx, ft)
        if m:
            co_quan[k] = m.group(1).strip()

    # ----- Danh sách đại biểu các khóa -----
    say("Tải danh sách đại biểu các khóa...")
    ds = {"qh": {}, "hd": {}}
    s0 = tai(P_QH + "default.aspx")
    nhom_qh = {re.split(r"Khóa\s+", v)[-1].strip(): v for v in re.findall(r'<option value="([^"]*Khóa[^"]*)"', s0)}
    for k in QH:
        g = nhom_qh.get(k)
        ds["qh"][k] = bang_dai_bieu(tai(P_QH + "default.aspx?nhom=" + urllib.parse.quote(g) + "&v=")) if g else []
    s0 = tai(P_HD + "default.aspx")
    nhom_hd = {re.split(r"Khóa\s+", v)[-1].strip(): v for v in re.findall(r'<option value="([^"]*Khóa[^"]*)"', s0)}
    for k in sorted(nhom_hd, key=roman):
        ds["hd"][k] = bang_dai_bieu(tai(P_HD + "default.aspx?nhom=" + urllib.parse.quote(nhom_hd[k]) + "&v="))
    for kind in ds:
        say(" ", kind, ", ".join("%s: %d" % (k, len(v)) for k, v in ds[kind].items()))
    k_qh = max((k for k, v in ds["qh"].items() if v), key=roman)
    k_hd = max((k for k, v in ds["hd"].items() if v), key=roman)

    # ----- Tiểu sử, ảnh của khóa đương nhiệm -----
    def duong_nhiem(kind, k, base):
        say("Tải tiểu sử %d đại biểu %s khóa %s..." % (len(ds[kind][k]), "Quốc hội" if kind == "qh" else "HĐND tỉnh", k))
        out, dv, dtts = [], {}, 0
        for r in ds[kind][k]:
            d = tieu_su(tai(base + "detail.aspx?v=%d" % r["id"])) if r["id"] else {}
            so, mo = don_vi(d.get("Nơi ứng cử", ""))
            if so and len(mo) > len(dv.get(so, "")):
                dv[so] = mo
            dv.setdefault(so, "") if so else None
            if d.get("Dân tộc", "Kinh").strip() not in ("", "Kinh"):
                dtts += 1
            p = {"id": r["id"], "ten": r["ten"], "cv": (d.get("Nghề nghiệp chức vụ (hiện nay)") or r["cv"]).strip(" ."), "dv": so, "nu": r["nu"], "anh": ""}
            anh = "assets/img/db/%s-%d.jpg" % (kind, r["id"])
            if d.get("_anh"):
                if a.khong_anh:
                    p["anh"] = anh if os.path.exists(os.path.join(ROOT, anh)) else ""
                elif luu_anh(d["_anh"], os.path.join(ROOT, anh)):
                    p["anh"] = anh
            out.append(p)
        return out, {str(k): dv[k] for k in sorted(dv)}, dtts

    db_hd, dv_hd, dt_hd = duong_nhiem("hd", k_hd, P_HD)
    db_qh, dv_qh, dt_qh = duong_nhiem("qh", k_qh, P_QH)
    for p in db_qh:
        p["vt"] = "Phó Trưởng Đoàn ĐBQH tỉnh" if re.search(r"Phó Trưởng Đoàn", p["cv"]) else "Trưởng Đoàn ĐBQH tỉnh" if re.search(r"Trưởng Đoàn", p["cv"]) else ""
    db_qh.sort(key=lambda p: {"Trưởng Đoàn ĐBQH tỉnh": 0, "Phó Trưởng Đoàn ĐBQH tỉnh": 1}.get(p["vt"], 2))
    theo_ten = {}
    for p in db_hd:
        theo_ten.setdefault(p["ten"], p)

    # ----- Thường trực HĐND tỉnh, các Ban -----
    say("Tải cơ cấu tổ chức HĐND tỉnh, Văn phòng...")
    cc = tai(U["cc_hd"])
    lk = {t: h for h, t in lien_ket(cc)}
    tt, nk_hd = [], NK_HD.get(k_hd, "")
    h = next((v for t, v in lk.items() if t.startswith("Thường trực Hội đồng nhân dân")), "")
    if h:
        h = h if h.startswith("/") else "/portal/KenhTin/" + h
        tb = than_bai(tai(h))
        ghi("dbnd_to_chuc", "Thường trực HĐND tỉnh", h, tb)
        for m in re.finditer(r"(?m)^\d+\.\s*(?:Ông|Bà)\s+([^,]+),\s*(.+?)\.?$", tb):
            cv = m.group(2).strip()
            ten = ten_dep(m.group(1))
            mk = re.search(r"nhiệm kỳ (\d{4})\s*-\s*(\d{4})", cv)
            if mk:
                nk_hd = mk.group(1) + " - " + mk.group(2)
            q = theo_ten.get(ten, {})
            tt.append({"ten": ten, "vt": vai_tro_tt(cv), "cv": cv, "id": q.get("id", 0), "anh": q.get("anh", "")})
    ban = {n: [] for n in ("Ban Pháp chế", "Ban Kinh tế - Ngân sách", "Ban Văn hóa - Xã hội", "Ban Dân tộc")}

    def them_ban(n, ten, cv):
        if n in ban and ten and all(x["ten"] != ten for x in ban[n]):
            ban[n].append({"ten": ten, "cv": cv})

    for p in tt:
        n = ten_ban(p["vt"])
        if n:
            them_ban(n, p["ten"], "Trưởng Ban")
    for t, h in lk.items():
        n = ten_ban(t)
        if not n or not t.startswith("Ban"):
            continue
        h = h if h.startswith("/") else "/portal/KenhTin/" + h
        s = tai(h)
        if not s:
            continue  # Cổng chưa có trang riêng cho Ban này
        tb = than_bai(s)
        ghi("dbnd_to_chuc", n, h, tb)
        for m in re.finditer(r"(?m)^(Trưởng Ban|Phó Trưởng Ban|Ủy viên[^:\n]*chuyên trách)\s*:\s*(?:Ông|Bà)\s+([^,;\n]+)", tb):
            them_ban(n, ten_dep(m.group(2)), "Ủy viên hoạt động chuyên trách" if m.group(1).startswith("Ủy viên") else m.group(1))
        for m in re.finditer(r"(?m)^\d+\.\s*(?:Ông|Bà)\s+([^,]+),\s*(.+?)[;.]?$", tb):
            cv = re.sub(r",?\s*đại biểu Hội đồng nhân dân hoạt động kiêm nhiệm", "", m.group(2)).strip()
            them_ban(n, ten_dep(m.group(1)), "Ủy viên; " + cv)

    # ----- Danh bạ: lãnh đạo, công chức các Ban và Văn phòng (bỏ số điện thoại) -----
    nhom = "Các Ban và Văn phòng Đoàn ĐBQH và HĐND tỉnh Thanh Hóa"
    s = tai(P_DB + "?nhom=" + urllib.parse.quote(nhom))
    danh_ba = []
    for tr in re.findall(r"(?is)<tr[^>]*>(.*?)</tr>", s):
        td = [sach(x) for x in re.findall(r"(?is)<td[^>]*>(.*?)</td>", tr)]
        if len(td) >= 3 and td[0].isdigit() and td[1]:
            danh_ba.append((ten_dep(td[1]), td[2].strip(" .")))
    ghi("dbnd_to_chuc", "Danh bạ: " + nhom + " (đã bỏ cột số điện thoại)", P_DB + "?nhom=" + nhom, "\n".join("%d. %s | %s" % (i + 1, t, c) for i, (t, c) in enumerate(danh_ba)))
    ld, phong = [], {n: [] for n in ("Phòng Công tác Quốc hội", "Phòng Công tác Hội đồng nhân dân", "Phòng Tổng hợp, Thông tin, Dân nguyện", "Phòng Hành chính, Tổ chức, Quản trị")}
    for ten, cv in danh_ba:
        if re.search(r"Chánh Văn phòng", cv):
            ld.append({"ten": ten, "cv": cv})
        elif re.search(r"[Pp]hòng", cv):
            n = ten_phong(cv)
            if n:
                m = re.match(r"(?i)(phó trưởng phòng|trưởng phòng|chuyên viên)", cv)
                phong[n].append({"ten": ten, "cv": {"phó trưởng phòng": "Phó Trưởng phòng", "trưởng phòng": "Trưởng phòng", "chuyên viên": "Chuyên viên"}[m.group(1).lower()] if m else cv})
        else:
            n = ten_ban(cv)
            if n:
                c = "Trưởng Ban" if cv.startswith("Trưởng Ban") else "Phó Trưởng Ban" if cv.startswith("Phó Trưởng Ban") else "Ủy viên hoạt động chuyên trách" if "chuyên trách" in cv else cv
                them_ban(n, ten, c)
    ld.sort(key=lambda x: x["cv"].startswith("Phó"))
    thu_tu = lambda x: 0 if x["cv"].startswith("Trưởng") else 1 if x["cv"].startswith("Phó") else 2 if "chuyên trách" in x["cv"] else 3
    for n in ban:
        ban[n].sort(key=thu_tu)
    for n in phong:
        phong[n].sort(key=thu_tu)
    s = tai("/portal/KenhTin/Lanh-dao-Van-phong-HDND-tinh.aspx")
    if s:
        tb = re.sub(r"(?m)^(Điện thoại|Fax|Email|Lĩnh vực phụ trách)[^\n]*\n?", "", than_bai(s))
        ghi("dbnd_to_chuc", "Lãnh đạo Văn phòng (đã bỏ số điện thoại, thư điện tử)", "/portal/KenhTin/Lanh-dao-Van-phong-HDND-tinh.aspx", tb)
    tb = than_bai(tai(U["cn_vp"]))
    m = re.search(r"Điều 1\. Vị trí, chức năng\s*\n(.+)", tb)
    vi_tri = m.group(1).strip() if m else ""
    m = re.search(r"\(Trích theo ([^)]+)\)", tb)
    can_cu_vp = m.group(1).strip() if m else ""
    ghi("dbnd_van_phong", "Chức năng, nhiệm vụ của Văn phòng", U["cn_vp"], tb)
    qc = than_bai(tai(U["qc_vp"]))
    if qc:
        ghi("dbnd_van_phong", "Quy chế làm việc của Văn phòng", U["qc_vp"], qc)

    # ----- Đoàn ĐBQH: chức năng, nhiệm vụ -----
    tb = than_bai(tai(U["cn_qh"]))
    ghi("dbnd_to_chuc", "Chức năng, nhiệm vụ của Đoàn ĐBQH tỉnh", U["cn_qh"], tb)
    nv_qh = [m.group(1).strip(" ;.") for m in re.finditer(r"(?m)^\d+\.\s*(.+)$", tb)]
    tb2 = than_bai(tai(U["cc_qh"]))
    if tb2:
        ghi("dbnd_to_chuc", "Cơ cấu tổ chức của Đoàn ĐBQH tỉnh (trang giới thiệu trên Cổng)", U["cc_qh"], tb2)
    ghi("dbnd_to_chuc", "Cơ cấu tổ chức của HĐND tỉnh", U["cc_hd"], than_bai(cc))

    # ----- Gom dữ liệu -----
    def khoa(kind, k, nk):
        r = ds[kind][k]
        return {"k": k, "nk": nk, "n": len(r), "nu": sum(1 for x in r if x["nu"]), "db": [[x["ten"], x["cv"]] for x in r]}

    D = {
        "nguon": BASE, "ngay": homnay, "coquan": co_quan,
        "hdnd": {"khoa": k_hd, "nk": nk_hd, "tt": tt, "ban": [{"n": n, "tv": v} for n, v in ban.items() if v], "dv": dv_hd, "db": db_hd,
                 "tk": {"tong": len(db_hd), "nu": sum(1 for p in db_hd if p["nu"]), "dtts": dt_hd, "dv": len([k for k in dv_hd if k != "0"])}},
        "dbqh": {"khoa": k_qh, "nk": NK_QH.get(k_qh, ""), "nv": nv_qh, "dv": dv_qh, "db": db_qh,
                 "tk": {"tong": len(db_qh), "nu": sum(1 for p in db_qh if p["nu"]), "dtts": dt_qh, "dv": len([k for k in dv_qh if k != "0"])}},
        "vp": {"ten": "Văn phòng Đoàn ĐBQH và HĐND tỉnh Thanh Hóa", "vitri": vi_tri, "cancu": can_cu_vp, "ld": ld, "phong": [{"n": n, "ns": v} for n, v in phong.items()]},
        "khoa": {"qh": [khoa("qh", k, NK_QH[k]) for k in QH], "hd": [khoa("hd", k, NK_HD.get(k, "")) for k in sorted(ds["hd"], key=roman)]},
    }

    # ----- Bản chụp danh sách vào nguon/ -----
    for p, t, lst, dvs in ((P_QH, "Đại biểu Quốc hội khóa %s (đương nhiệm)" % k_qh, db_qh, dv_qh), (P_HD, "Đại biểu HĐND tỉnh khóa %s (đương nhiệm)" % k_hd, db_hd, dv_hd)):
        body = "\n".join("%d. %s | %s | Đơn vị bầu cử số %s" % (i + 1, x["ten"], x["cv"], x["dv"] or "(chưa ghi)") for i, x in enumerate(lst))
        body += "\n\nĐơn vị bầu cử:\n" + "\n".join("Số %s: %s" % (k, v or "(Cổng chưa ghi địa bàn)") for k, v in dvs.items())
        ghi("dbnd_danh_sach", t, p + "default.aspx", body)
    for kind, p, nhan in (("qh", P_QH, "Đại biểu Quốc hội tỉnh Thanh Hóa khóa %s"), ("hd", P_HD, "Đại biểu HĐND tỉnh Thanh Hóa khóa %s")):
        for kk in D["khoa"][kind]:
            body = "\n".join("%d. %s | %s" % (i + 1, t, c or "(Cổng chưa ghi chức vụ)") for i, (t, c) in enumerate(kk["db"])) or "(Cổng chưa có danh sách khóa này)"
            ghi("dbnd_danh_sach", nhan % kk["k"], p + "default.aspx", body)

    os.makedirs(os.path.join(ROOT, "data"), exist_ok=True)
    json.dump(D, open(os.path.join(ROOT, "data", "bo-may.json"), "w", encoding="utf8", newline="\n"), ensure_ascii=False, indent=1)
    js = ("/* Sinh tự động bằng tools/lay_bo_may.py từ Cổng thông tin điện tử Đoàn ĐBQH và HĐND tỉnh Thanh Hóa (dbndthanhhoa.gov.vn), ngày %s. Không sửa tay. */\n" % homnay
          + "window.NTS_BOMAY=" + json.dumps(D, ensure_ascii=False, separators=(",", ":")) + ";\n")
    open(os.path.join(ROOT, "data", "bo-may.js"), "w", encoding="utf8", newline="\n").write(js)
    for tep, muc in nguon.items():
        with open(os.path.join(ROOT, "nguon", tep + ".txt"), "w", encoding="utf8", newline="\n") as f:
            f.write("Nguồn: Cổng thông tin điện tử Đoàn ĐBQH và HĐND tỉnh Thanh Hóa (dbndthanhhoa.gov.vn)\nNgày truy cập: %s\nTệp này sinh tự động bằng tools/lay_bo_may.py, không sửa tay.\n" % homnay)
            for t, u, nd in muc:
                f.write("\n\n===== %s =====\nĐịa chỉ: %s\n\n%s\n" % (t, u, nd))
    say("Xong. HĐND tỉnh khóa %s: %d đại biểu, %d có ảnh; Thường trực %d người; %d Ban." % (k_hd, len(db_hd), sum(1 for p in db_hd if p["anh"]), len(tt), len(D["hdnd"]["ban"])))
    say("     ĐBQH khóa %s: %d đại biểu, %d có ảnh. Văn phòng: %d lãnh đạo, %d công chức ở các phòng." % (k_qh, len(db_qh), sum(1 for p in db_qh if p["anh"]), len(ld), sum(len(v) for v in phong.values())))
    say("     data/bo-may.js: %d KB" % (len(js.encode("utf8")) // 1024))


if __name__ == "__main__":
    main()
