// Kết xuất từng khung hình của phim giới thiệu bằng Playwright. Xem tools/phim/HUONG-DAN.md
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{
 const FPS=30,dir=require('path').join(__dirname,process.argv[2]||'frames'),only=process.argv[3];
 fs.mkdirSync(dir,{recursive:true});
 const b=await chromium.launch();const p=await b.newPage({viewport:{width:960,height:540},deviceScaleFactor:1});
 await p.goto(require('url').pathToFileURL(require('path').join(__dirname,'video.html')).href+'?nq='+(process.env.NQ||'570'));await p.evaluate(()=>document.fonts.ready);await p.waitForLoadState('networkidle');await p.waitForTimeout(800);
 const total=await p.evaluate(()=>window.TOTAL);const n=Math.round(total*FPS);
 if(only){for(const t of only.split(',').map(Number)){await p.evaluate(t=>window.setT(t),t);await p.screenshot({path:`${dir}/t${t}.jpg`,type:'jpeg',quality:88})}console.log('total',total);await b.close();return}
 for(let i=0;i<n;i++){await p.evaluate(t=>window.setT(t),i/FPS);await p.screenshot({path:`${dir}/f${String(i).padStart(5,'0')}.jpg`,type:'jpeg',quality:93})}
 console.log('frames',n,'total',total);await b.close();
})();
