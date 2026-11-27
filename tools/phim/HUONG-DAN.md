# Dựng lại phim giới thiệu

Phim `assets/video/gioi-thieu.mp4` (46 giây, 960×540, 30 hình/giây) được dựng từ trang `video.html` trong thư mục này: mỗi chặng một cảnh, nền là ảnh chính của chặng (theo `assets/img/credits.js`), chặng chưa có ảnh thì dùng tranh sơn mài. Nhạc nền do `audio.py` tổng hợp (trống hội và đàn dây ngũ cung).

## Cần cài

- Node.js 18 trở lên, rồi trong thư mục này chạy `npm install playwright` và `npx playwright install chromium`.
- Python 3 với `numpy` (`pip install numpy`) để tạo nhạc.
- ffmpeg (Windows: tải bản dựng sẵn, thêm vào PATH).

## Các bước (chạy trong thư mục `tools/phim`)

```bash
# 1. (nên làm trước) tải ảnh về kho để phim dùng ảnh thật thay vì tranh
python ../tai_anh_ve_may.py

# 2. tạo nhạc nền 46 giây -> music.wav
python audio.py 46
ffmpeg -y -i music.wav -c:a aac -b:a 128k music.m4a

# 3. kết xuất 1.380 khung hình vào thư mục frames/
node render.js frames

# 4. ghép thành phim
ffmpeg -y -framerate 30 -i frames/f%05d.jpg -i music.m4a -c:v libx264 -pix_fmt yuv420p -crf 24 -preset slow -movflags +faststart -c:a copy -shortest ../../assets/video/gioi-thieu.mp4

# 5. ảnh bìa của phim (khung hình ở giây 2,9)
node render.js bia 2.9
ffmpeg -y -i bia/t2.9.jpg ../../assets/video/gioi-thieu.jpg
```

Xem thử vài khung hình mà không dựng cả phim: `node render.js thu "2.8,5,13,43.5"` (ảnh nằm trong thư mục `thu/`).

Số câu hỏi hiện ở cảnh cuối lấy từ biến môi trường `NQ` (mặc định 570), ví dụ `NQ=620 node render.js frames`.

Các thư mục `frames/`, `bia/`, `thu/` và tệp nhạc tạm đã được bỏ qua trong `.gitignore`, không cần commit.
