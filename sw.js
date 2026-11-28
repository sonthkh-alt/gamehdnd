/* Service worker của "Nghị trường số": cho phép cài game lên màn hình chính và chơi khi mất mạng.
   - Trang, mã, dữ liệu câu hỏi: ưu tiên lấy từ mạng để luôn có bản mới, mất mạng thì dùng bản đã lưu.
   - Ảnh: ưu tiên bản đã lưu (ảnh không đổi), chưa có thì tải rồi lưu.
   - Phim giới thiệu và tài nguyên của trang khác (phông chữ Google) không lưu.
   Đổi số phiên bản V khi muốn xóa sạch bộ nhớ đệm cũ. */
const V='nts-v3d-6';
const CORE=['./','index.html','data/cau-hoi.js','data/bo-may.js','data/thuyet-minh.js','assets/art.js','assets/img/credits.js','assets/img/gallery.js','assets/vendor/three.min.js','assets/3d/mo-hinh.js','assets/3d/the-gioi.js','assets/icon/icon.svg','assets/icon/icon-192.png','manifest.webmanifest'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
const keep=(req,res)=>{if(res&&res.ok&&res.type==='basic'){const cp=res.clone();caches.open(V).then(c=>c.put(req,cp))}return res};
self.addEventListener('fetch',e=>{
 const r=e.request;if(r.method!=='GET')return;
 const u=new URL(r.url);
 if(u.origin!==self.location.origin||r.headers.has('range')||/\.mp4$/i.test(u.pathname))return;
 if(/\.(jpe?g|png|webp|svg)$/i.test(u.pathname)){e.respondWith(caches.match(r).then(h=>h||fetch(r).then(res=>keep(r,res))));return}
 e.respondWith(fetch(r).then(res=>keep(r,res)).catch(()=>caches.match(r,{ignoreSearch:true}).then(h=>h||(r.mode==='navigate'?caches.match('index.html'):Response.error()))));
});
