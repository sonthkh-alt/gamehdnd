/* Bộ tranh "sơn mài xứ Thanh": 10 bức vẽ bằng SVG cho 10 chặng (khung 300 x 200, chủ thể nằm giữa để cắt vuông được).
   Bảng màu: đỏ son, vàng thếp, xanh đồng, ngà, chàm. Dùng: window.NTS_ART.svg('thanhho') hoặc NTS_ART.draw.thanhho(). */
(function(){
const G='#f5d98f',G2='#d9a441',G3='#8a6a2f',R='#b8281f',R2='#74140f',V='#18423a',V2='#56a59a',V3='#0c2421',I='#f9f1df',K='#071816',C='#22375c';
const f=n=>(+n).toFixed(1);
const BIRD='M-14,0 C-8,-4 2,-4 7,-1.5 L18,-2 L7,1.5 C2,3.5 -8,3.5 -14,0Z M-3,-2 L-9,-9 L0,-3Z M-3,2 L-9,9 L0,3Z M-14,0 L-21,-4 M-14,0 L-21,4 M4,-2.5 L1,-8 M6,-2 L5,-8';
const DEFS=`<linearGradient id="aSon" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d0b08"/><stop offset=".55" stop-color="#8e1c15"/><stop offset=".86" stop-color="#d0732c"/><stop offset="1" stop-color="#f1c463"/></linearGradient>
<linearGradient id="aDem" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#061412"/><stop offset=".6" stop-color="#14403a"/><stop offset="1" stop-color="#2b6a5c"/></linearGradient>
<linearGradient id="aBien" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f8a86"/><stop offset="1" stop-color="#16314f"/></linearGradient>
<radialGradient id="aNhat" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#fff0bf"/><stop offset=".55" stop-color="#f0c35d"/><stop offset="1" stop-color="#c8862d"/></radialGradient>
<linearGradient id="aDa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9c79d"/><stop offset="1" stop-color="#9c8358"/></linearGradient>
<linearGradient id="aVoi" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2ad58"/><stop offset="1" stop-color="#9a5f25"/></linearGradient>`;
/* mặt trời kiểu mặt trống: sao 14 cánh và các vành tròn */
function sun(cx,cy,r,o){
 let p='';for(let i=0;i<28;i++){const a=i*Math.PI/14-Math.PI/2,rr=i%2?r*.26:r*.62;p+=f(cx+Math.cos(a)*rr)+','+f(cy+Math.sin(a)*rr)+' '}
 let d='';for(let i=0;i<24;i++){const a=i*Math.PI/12;d+=`<circle cx="${f(cx+Math.cos(a)*r*.86)}" cy="${f(cy+Math.sin(a)*r*.86)}" r="${f(r*.035)}"/>`}
 return `<g opacity="${o||1}"><circle cx="${cx}" cy="${cy}" r="${f(r*1.5)}" fill="${G}" opacity=".08"/><circle cx="${cx}" cy="${cy}" r="${f(r*1.22)}" fill="${G}" opacity=".12"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#aNhat)"/><circle cx="${cx}" cy="${cy}" r="${f(r*.72)}" fill="none" stroke="${G3}" stroke-width="${f(r*.03)}"/><circle cx="${cx}" cy="${cy}" r="${f(r*.94)}" fill="none" stroke="${G3}" stroke-width="${f(r*.025)}"/><g fill="${G3}">${d}</g><polygon points="${p}" fill="#fff6d6"/><circle cx="${cx}" cy="${cy}" r="${f(r*.13)}" fill="${G2}"/></g>`;
}
/* mây cuộn */
function cloud(x,y,s,c){
 return `<g transform="translate(${x},${y}) scale(${s})" fill="none" stroke="${c||G}" stroke-width="1.6" stroke-linecap="round"><path d="M0,10 C-2,2 8,-2 12,4 C14,-6 30,-6 32,4 C40,0 48,6 44,12 C52,14 50,22 42,22 L6,22 C-4,22 -6,12 0,10Z" fill="${c||G}" fill-opacity=".14"/><path d="M12,14 c0,-5 7,-5 7,0 c0,3 -4,3 -4,0 M28,14 c0,-5 7,-5 7,0 c0,3 -4,3 -4,0"/></g>`;
}
/* sóng nước hình vảy */
function waves(y0,rows,fill,stroke,step,op){
 step=step||22;let s=`<rect x="0" y="${y0}" width="300" height="${200-y0}" fill="${fill}"/>`;
 for(let r=0;r<rows;r++){const y=y0+8+r*11,off=r%2?step/2:0;let d='';for(let x=-step+off;x<300+step;x+=step)d+=`M${f(x)},${y} a${step/2},7 0 0 1 ${step},0 `;
  s+=`<path d="${d}" fill="none" stroke="${stroke}" stroke-width="1.3" opacity="${f((op||.8)-r*.07)}"/>`}
 return s;
}
const birds=(arr,c)=>arr.map(([x,y,a,s])=>`<g transform="translate(${x},${y}) rotate(${a}) scale(${s})"><path d="${BIRD}" fill="${c||G}" stroke="${c||G}" stroke-width="1.2" stroke-linecap="round"/></g>`).join('');
const frame=`<rect x="1.5" y="1.5" width="297" height="197" fill="none" stroke="${G2}" stroke-width="1.2" opacity=".55"/>`;

const draw={
/* 1. Đông Sơn: mặt trống, chim Lạc, thuyền chiến */
dongson(){
 let rays='';for(let i=0;i<28;i++){const a=i*Math.PI/14-Math.PI/2,rr=i%2?13:38;rays+=f(150+Math.cos(a)*rr)+','+f(88+Math.sin(a)*rr)+' '}
 let ticks='';for(let i=0;i<72;i++){const a=i*5*Math.PI/180;ticks+=`M${f(150+Math.cos(a)*66)},${f(88+Math.sin(a)*66)}L${f(150+Math.cos(a)*72)},${f(88+Math.sin(a)*72)}`}
 let ring='';for(let i=0;i<8;i++){const a=i*45*Math.PI/180;ring+=`<g transform="translate(${f(150+Math.cos(a)*56)},${f(88+Math.sin(a)*56)}) rotate(${i*45-90}) scale(.62)"><path d="${BIRD}"/></g>`}
 const men=[92,116,140,164,188,212].map((x,i)=>`<path d="M${x},160 v-13 M${x},151 l8,6 M${x},147 c-3,-8 3,-12 0,-18 M${x},147 c4,-6 8,-6 10,-12" stroke="${G}" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="${x}" cy="145" r="2.6" fill="${G}"/>`).join('');
 return `<rect width="300" height="200" fill="url(#aDem)"/>${cloud(18,22,.9)}${cloud(232,30,.8)}
 <circle cx="150" cy="88" r="92" fill="${G}" opacity=".07"/><circle cx="150" cy="88" r="76" fill="url(#aNhat)"/>
 <g fill="none" stroke="${G3}"><circle cx="150" cy="88" r="74" stroke-width="1.6"/><circle cx="150" cy="88" r="64" stroke-width="1"/><circle cx="150" cy="88" r="46" stroke-width="1"/><circle cx="150" cy="88" r="41" stroke-width="2.4" stroke-dasharray="1.5 3"/><path d="${ticks}" stroke-width="1"/></g>
 <g fill="${G3}" stroke="${G3}" stroke-width="1.2" stroke-linecap="round">${ring}</g>
 <polygon points="${rays}" fill="#fff6d6" stroke="${G3}" stroke-width=".8"/><circle cx="150" cy="88" r="6" fill="${G2}"/>
 ${waves(170,3,V3,V2,24,.7)}
 <path d="M52,154 C90,176 210,176 248,154 L262,140 C270,136 276,142 270,148 L256,168 C200,186 100,186 44,168 L30,148 C24,142 30,136 38,140Z" fill="${R2}" stroke="${G}" stroke-width="1.8"/>
 <path d="M60,163 C110,176 190,176 240,163" stroke="${G2}" stroke-width="1.2" fill="none" stroke-dasharray="3 4"/>${men}
 ${birds([[34,96,-12,.8],[268,104,192,.8]])}${frame}`;
},
/* 2. Hàm Rồng: cầu giàn thép qua sông Mã giữa hai núi */
hamrong(){
 const span=x=>`<path d="M${x},128 L${x+16},98 L${x+84},98 L${x+100},128" fill="none" stroke="${G}" stroke-width="2.6" stroke-linejoin="round"/><path d="M${x+16},98 V128 M${x+33},98 V128 M${x+50},98 V128 M${x+67},98 V128 M${x+84},98 V128 M${x+16},98 L${x+33},128 L${x+50},98 L${x+67},128 L${x+84},98" fill="none" stroke="${G}" stroke-width="1.5"/>`;
 return `<rect width="300" height="200" fill="url(#aSon)"/>${sun(150,84,34)}${cloud(22,26,.9)}${cloud(226,18,1)}
 <path d="M0,120 C30,96 60,104 84,92 C104,82 120,100 140,112 L140,140 L0,140Z" fill="#5b130f" opacity=".7"/><path d="M300,118 C270,92 244,100 222,90 C204,82 184,100 164,112 L164,140 L300,140Z" fill="#5b130f" opacity=".7"/>
 <path d="M0,150 L0,112 C16,84 34,78 50,92 C58,98 64,112 70,150Z" fill="${V}" stroke="${G2}" stroke-width="1.2"/>
 <path d="M300,150 L300,104 C286,80 268,70 252,84 C262,84 262,94 250,96 C242,104 236,122 232,150Z" fill="${V}" stroke="${G2}" stroke-width="1.2"/><circle cx="262" cy="86" r="1.8" fill="${G}"/>
 ${waves(140,5,'url(#aBien)','#bfe9dc',26,.75)}
 <rect x="46" y="128" width="208" height="5" fill="${G2}"/>${span(50)}${span(150)}
 <path d="M44,133 h12 v20 h-12Z M144,133 h12 v26 h-12Z M244,133 h12 v20 h-12Z" fill="#cdb58a" stroke="${G3}" stroke-width="1"/>
 <path d="M150,96 v-14 l12,5 l-12,5" fill="${R}" stroke="${G}" stroke-width="1"/>
 ${birds([[92,58,-8,.7],[206,50,188,.7]])}${frame}`;
},
/* 3. Thành nhà Hồ: cổng đá ba vòm */
thanhho(){
 let j='';for(let r=0;r<6;r++){const y=76+r*13;j+=`M54,${y} H246 `;for(let x=62+(r%2)*14;x<246;x+=28)j+=`M${x},${y} v13 `}
 const co=(x,c1,c2)=>`<path d="M${x},70 v-34" stroke="${G}" stroke-width="1.6"/><rect x="${x}" y="36" width="20" height="20" fill="${c1}" stroke="${G}" stroke-width="1"/><rect x="${x+5}" y="41" width="10" height="10" fill="${c2}"/>`;
 return `<rect width="300" height="200" fill="url(#aDem)"/>${sun(150,62,38,.95)}${cloud(14,30,1)}${cloud(230,44,.9)}
 <path d="M0,140 C40,120 70,128 100,124 L100,160 L0,160Z M300,140 C262,118 232,128 200,124 L200,160 L300,160Z" fill="${V}" opacity=".9"/>
 ${co(72,R,G2)}${co(208,G2,R)}
 <path d="M54,154 V76 H70 V68 H96 V76 H120 V68 H180 V76 H204 V68 H230 V76 H246 V154Z" fill="url(#aDa)" stroke="${G3}" stroke-width="1.4"/>
 <path d="${j}" stroke="#7d6843" stroke-width=".8" fill="none" opacity=".8"/>
 <path d="M132,154 V112 a18,18 0 0 1 36,0 V154Z" fill="${K}" stroke="#7d6843" stroke-width="2.4"/><path d="M84,154 V122 a14,14 0 0 1 28,0 V154Z M188,154 V122 a14,14 0 0 1 28,0 V154Z" fill="${K}" stroke="#7d6843" stroke-width="2.2"/>
 <path d="M0,154 H300 V200 H0Z" fill="#2f6a3f"/><path d="M0,154 H300" stroke="${G2}" stroke-width="1.2"/>
 <path d="M134,154 L104,200 H196 L166,154Z" fill="#cdb58a" opacity=".9"/><path d="M20,172 q6,-10 12,0 M250,178 q6,-10 12,0 M60,186 q6,-10 12,0 M222,166 q6,-10 12,0" stroke="#8fcf72" stroke-width="1.6" fill="none"/>
 ${birds([[40,70,-10,.7],[262,82,190,.7]])}${frame}`;
},
/* 4. Lam Kinh: điện thờ hai tầng mái dưới tán cổ thụ */
lamkinh(){
 return `<rect width="300" height="200" fill="url(#aSon)"/>${sun(214,58,26)}${cloud(120,22,1)}${cloud(16,48,.8)}
 <path d="M0,150 C50,132 110,140 150,134 C200,128 250,138 300,128 V160 H0Z" fill="#5b130f" opacity=".75"/>
 <path d="M52,154 C50,128 54,112 60,96 M60,112 C46,104 40,96 38,86 M60,104 C72,98 78,88 80,80" stroke="#3a2412" stroke-width="7" fill="none" stroke-linecap="round"/>
 <g fill="${V}" stroke="${G2}" stroke-width="1.2"><circle cx="34" cy="74" r="26"/><circle cx="66" cy="58" r="30"/><circle cx="96" cy="78" r="24"/><circle cx="62" cy="86" r="22"/></g>
 <path d="M108,104 Q178,74 248,104 L262,100 L250,112 Q178,90 106,112 L94,100Z" fill="${R}" stroke="${G}" stroke-width="1.6"/>
 <path d="M178,72 v-10 M172,66 q6,-8 12,0" stroke="${G}" stroke-width="1.8" fill="none"/>
 <rect x="122" y="110" width="112" height="12" fill="${R2}" stroke="${G2}" stroke-width="1"/>
 <path d="M98,138 Q178,108 258,138 L274,134 L260,147 Q178,124 96,147 L82,134Z" fill="${R}" stroke="${G}" stroke-width="1.6"/>
 <rect x="110" y="145" width="136" height="24" fill="#3d0b08"/><path d="M116,145 V169 M140,145 V169 M164,145 V169 M192,145 V169 M216,145 V169 M240,145 V169" stroke="${G2}" stroke-width="4"/>
 <path d="M166,169 V153 a12,12 0 0 1 24,0 V169Z" fill="${K}" stroke="${G}" stroke-width="1"/>
 <path d="M0,169 H300 V200 H0Z" fill="#7a2a20"/><path d="M96,169 H260 L272,180 H84Z" fill="#cdb58a" stroke="${G3}" stroke-width="1"/><path d="M84,180 H272 L284,192 H72Z" fill="#b9a57e" stroke="${G3}" stroke-width="1"/>
 ${birds([[250,34,186,.7]])}${frame}`;
},
/* 5. Đền Bà Triệu: nữ tướng cưỡi voi */
batrieu(){
 return `<rect width="300" height="200" fill="url(#aDem)"/>${sun(150,78,52,.96)}${cloud(10,24,.9)}${cloud(238,22,.9)}
 <path d="M0,150 C30,110 56,120 80,104 C100,92 118,116 136,128 L136,170 H0Z M300,152 C276,114 250,122 228,108 C210,98 190,118 172,130 L172,170 H300Z" fill="${V}" stroke="${G2}" stroke-width="1"/>
 <path d="M0,170 H300 V200 H0Z" fill="${R2}"/><path d="M0,170 H300" stroke="${G2}" stroke-width="1.4"/>
 <g transform="translate(62,52) scale(1.42)">
  <path d="M40,16 V-22" stroke="${G}" stroke-width="1.4"/><path d="M40,-22 h22 l-6,7 6,7 h-22Z" fill="${R}" stroke="${G}" stroke-width="1"/>
  <path d="M15,50 C8,54 8,62 6,67" fill="none" stroke="#8a5222" stroke-width="2.5" stroke-linecap="round"/>
  <rect x="22" y="58" width="15" height="33" rx="6" fill="#7d4a1d"/><rect x="64" y="58" width="15" height="33" rx="6" fill="#7d4a1d"/>
  <path d="M14,56 C10,32 32,19 58,21 C82,22 94,34 94,52 C94,68 82,74 60,74 C36,74 18,70 14,56Z" fill="url(#aVoi)"/>
  <rect x="36" y="60" width="15" height="32" rx="6" fill="url(#aVoi)"/><rect x="78" y="60" width="15" height="32" rx="6" fill="url(#aVoi)"/>
  <path d="M32,24 C44,19 66,19 76,24 L74,47 C62,51 46,51 34,47Z" fill="${R}" stroke="${G}" stroke-width="1"/>
  <path d="M36,31 l5,-4 5,4 5,-4 5,4 5,-4 5,4 5,-4 5,4 4,-3 M35,41 C47,45 61,45 73,41" fill="none" stroke="${G}" stroke-width="1.3"/>
  <path d="M110,46 C124,40 128,26 122,15" fill="none" stroke="#c88d40" stroke-width="9" stroke-linecap="round"/>
  <circle cx="98" cy="40" r="19" fill="url(#aVoi)"/><path d="M86,26 C70,26 66,50 76,60 C83,66 92,59 92,50Z" fill="#8a5222"/>
  <path d="M107,55 C113,59 119,59 123,54" fill="none" stroke="${I}" stroke-width="3" stroke-linecap="round"/><circle cx="103" cy="35" r="2.3" fill="${K}"/>
  <path d="M46,22 C46,8 50,2 56,2 C62,2 66,8 66,22Z" fill="${G2}" stroke="${G3}" stroke-width=".8"/><path d="M50,22 L56,6 L62,22" fill="none" stroke="${R}" stroke-width="1.6"/>
  <circle cx="56" cy="-4" r="5.2" fill="#e9b98e"/><path d="M50,-5 C50,-13 62,-13 62,-5 C60,-9 52,-9 50,-5Z M50,-5 C46,2 46,10 44,16" fill="${K}" stroke="${K}" stroke-width="1.6"/>
  <path d="M62,8 L76,-4" stroke="#e9b98e" stroke-width="3" stroke-linecap="round"/><path d="M76,-4 L92,-24" stroke="${I}" stroke-width="2.2" stroke-linecap="round"/><path d="M73,-1 l6,5" stroke="${G}" stroke-width="2"/>
 </g>
 ${birds([[40,84,-14,.7],[262,90,194,.7]])}${frame}`;
},
/* 6. Sầm Sơn: bình minh, thuyền buồm và hòn Trống Mái */
samson(){
 const sail=(x,y,s)=>`<g transform="translate(${x},${y}) scale(${s})"><path d="M0,0 V-44" stroke="${G}" stroke-width="1.6"/><path d="M2,-42 C18,-34 22,-14 20,-4 H2Z" fill="#a8532a" stroke="${G}" stroke-width="1"/><path d="M-2,-36 C-12,-28 -14,-14 -12,-4 H-2Z" fill="#8a3d1e" stroke="${G}" stroke-width="1"/><path d="M-20,0 H24 L18,8 H-14Z" fill="${R2}" stroke="${G}" stroke-width="1.2"/></g>`;
 return `<rect width="300" height="200" fill="url(#aSon)"/>${sun(138,112,40)}${cloud(20,28,1)}${cloud(196,22,.9)}
 ${waves(112,7,'url(#aBien)','#bfe9dc',26,.8)}
 <path d="M96,116 h84" stroke="#fff6d6" stroke-width="2" opacity=".6"/><path d="M110,128 h56 M120,140 h36" stroke="#fff6d6" stroke-width="1.6" opacity=".4"/>
 ${sail(58,138,.9)}${sail(104,122,.5)}
 <path d="M196,200 C198,160 210,128 232,118 C256,108 284,116 300,112 V200Z" fill="${V3}" stroke="${G2}" stroke-width="1.2"/>
 <path d="M214,120 C212,98 232,88 252,92 C270,96 276,112 268,122 C250,128 228,128 214,120Z" fill="#3a4b46" stroke="${G}" stroke-width="1.2"/>
 <path d="M228,92 C224,74 240,66 254,70 C266,74 268,86 262,94 C250,98 236,98 228,92Z" fill="#4a5d57" stroke="${G}" stroke-width="1.2"/>
 <path d="M258,96 C262,84 276,84 280,92 C284,100 278,108 270,108Z" fill="#3a4b46" stroke="${G}" stroke-width="1"/>
 <path d="M22,70 q6,-6 12,0 q6,-6 12,0 M70,54 q5,-5 10,0 q5,-5 10,0 M176,62 q5,-5 10,0 q5,-5 10,0" stroke="${I}" stroke-width="1.6" fill="none" stroke-linecap="round"/>${frame}`;
},
/* 7. Pù Luông: ruộng bậc thang, nhà sàn, cọn nước */
puluong(){
 const band=(y,c,k)=>`<path d="M0,${y} C60,${y-16-k} 120,${y+8} 180,${y-8} C230,${y-20} 270,${y-4} 300,${y-12} V200 H0Z" fill="${c}" stroke="${G2}" stroke-width="1"/>`;
 let sp='';for(let i=0;i<8;i++){const a=i*Math.PI/4;sp+=`M48,150 L${f(48+Math.cos(a)*22)},${f(150+Math.sin(a)*22)} `}
 return `<rect width="300" height="200" fill="url(#aDem)"/>${sun(84,50,26)}${cloud(176,20,1)}${cloud(246,48,.7)}
 <path d="M0,104 C30,70 56,64 84,84 C104,58 140,48 168,76 C196,50 240,44 300,86 V130 H0Z" fill="${C}" opacity=".85"/>
 <path d="M0,120 C40,92 80,98 120,104 C170,84 230,84 300,108 V140 H0Z" fill="${V}" stroke="${V2}" stroke-width="1"/>
 ${band(124,'#3f8a4f',0)}${band(140,'#8fcf72',4)}${band(156,'#e2bd52',-2)}${band(172,'#62ad5c',6)}${band(188,'#c9a23e',0)}
 <g transform="translate(196,96)"><path d="M-6,22 V44 M10,22 V44 M30,22 V44 M46,22 V44" stroke="#3a2412" stroke-width="3"/><path d="M-12,22 H52 V10 H-12Z" fill="#7d4a1d" stroke="${G}" stroke-width="1"/><path d="M-20,12 L4,-12 H36 L60,12Z" fill="${R2}" stroke="${G}" stroke-width="1.4"/><path d="M4,-12 l-6,-8 M36,-12 l6,-8" stroke="${G}" stroke-width="1.6"/><rect x="14" y="12" width="10" height="10" fill="${K}"/><path d="M52,22 L64,44 M56,29 h-5 M60,37 h-5" stroke="#3a2412" stroke-width="1.6"/></g>
 <circle cx="48" cy="150" r="22" fill="none" stroke="#3a2412" stroke-width="3.4"/><circle cx="48" cy="150" r="22" fill="none" stroke="${G}" stroke-width="1"/><path d="${sp}" stroke="${G}" stroke-width="1.2"/><circle cx="48" cy="150" r="3" fill="${G}"/>
 ${birds([[150,40,-8,.7]])}${frame}`;
},
/* 8. Cẩm Lương: đàn cá thần bơi ngược suối */
camluong(){
 const fish=(x,y,a,s,c)=>`<g transform="translate(${x},${y}) rotate(${a}) scale(${s})"><path d="M-18,0 C-8,-10 10,-10 18,0 C10,10 -8,10 -18,0Z" fill="${c}" stroke="${G}" stroke-width="1.2"/><path d="M-18,0 L-30,-9 L-27,0 L-30,9Z" fill="${c}" stroke="${G}" stroke-width="1.2"/><path d="M-2,-8 l4,-6 4,7 M-4,-2 c3,2 3,4 0,6 M3,-3 c3,2 3,5 0,7" fill="none" stroke="${G}" stroke-width="1"/><circle cx="11" cy="-2" r="1.6" fill="${K}"/></g>`;
 return `<rect width="300" height="200" fill="url(#aDem)"/>${sun(232,40,22)}${cloud(20,18,.9)}
 <path d="M0,200 V60 C30,30 70,22 104,40 C130,54 136,84 124,112 C116,132 90,140 70,150 C44,162 20,180 0,200Z" fill="${V3}" stroke="${G2}" stroke-width="1.2"/>
 <path d="M44,118 C40,92 56,74 76,76 C94,78 102,96 96,112 C86,122 60,128 44,118Z" fill="${K}" stroke="${G}" stroke-width="1.2"/>
 <path d="M300,200 V96 C276,86 252,92 236,108 C222,124 226,150 214,170 C208,182 196,192 184,200Z" fill="${V}" stroke="${G2}" stroke-width="1.2"/>
 <path d="M60,124 C100,120 130,134 160,150 C190,166 220,170 250,200 H40 C70,176 40,150 60,124Z" fill="url(#aBien)"/>
 <path d="M72,136 q10,-6 20,0 M96,150 q10,-6 20,0 M132,160 q10,-6 20,0 M84,172 q10,-6 20,0 M168,180 q10,-6 20,0 M120,188 q10,-6 20,0" stroke="#bfe9dc" stroke-width="1.3" fill="none" opacity=".8"/>
 ${fish(150,152,-152,.9,R)}${fish(114,142,-158,.7,G2)}${fish(176,176,-146,1,G2)}${fish(128,174,-150,.75,R)}${fish(96,160,-160,.6,I)}
 <path d="M244,112 c-10,6 -14,16 -10,26 M258,104 c-6,10 -6,20 0,28 M272,110 c0,10 4,18 12,22" stroke="#8fcf72" stroke-width="2" fill="none" stroke-linecap="round"/>
 <ellipse cx="206" cy="194" rx="16" ry="7" fill="#4a5d57" stroke="${G3}"/><ellipse cx="60" cy="192" rx="12" ry="6" fill="#4a5d57" stroke="${G3}"/>${frame}`;
},
/* 9. Nghi Sơn: cảng biển, tàu hàng, khu lọc hóa dầu */
nghison(){
 const crane=x=>`<path d="M${x},146 L${x+8},92 L${x+16},146 M${x+3},128 h10 M${x+5},110 h6" stroke="${G}" stroke-width="2" fill="none"/><path d="M${x-22},92 H${x+34} M${x+8},92 v-12 L${x-22},92 M${x+8},80 L${x+34},92" stroke="${G}" stroke-width="2" fill="none"/><path d="M${x-12},92 v16" stroke="${G}" stroke-width="1"/><rect x="${x-17}" y="108" width="10" height="7" fill="${G2}"/>`;
 const box=(x,y,c)=>`<rect x="${x}" y="${y}" width="17" height="9" fill="${c}" stroke="${K}" stroke-width=".8"/>`;
 return `<rect width="300" height="200" fill="url(#aSon)"/>${sun(196,70,30)}${cloud(100,20,1)}${cloud(234,26,.7)}
 <path d="M0,146 V118 h10 V84 h8 v34 h8 V98 h10 v20 h6 V70 h7 v48 h10 v-14 a9,9 0 0 1 18,0 v14 h6 a8,8 0 0 1 16,0 v14 H0Z" fill="#3d0b08" stroke="${G2}" stroke-width="1"/>
 <path d="M44,70 c-4,-8 2,-12 0,-20 c8,6 8,14 4,20Z" fill="#f1c463" stroke="${R}" stroke-width="1"/>
 <path d="M12,96 h4 M12,106 h4 M28,104 h6 M45,86 h3 M45,98 h3" stroke="${G}" stroke-width="1.2"/>
 ${crane(236)}${crane(272)}<rect x="212" y="146" width="88" height="8" fill="#5b130f" stroke="${G2}" stroke-width="1"/>
 ${waves(150,5,'url(#aBien)','#bfe9dc',26,.75)}
 <path d="M70,158 H204 L192,180 H84Z" fill="${R}" stroke="${G}" stroke-width="1.4"/><path d="M78,168 H198" stroke="${I}" stroke-width="1.6"/>
 ${box(96,149,G2)}${box(114,149,V2)}${box(132,149,I)}${box(150,149,G2)}${box(105,140,V2)}${box(123,140,R2)}${box(141,140,G2)}${box(114,131,I)}${box(132,131,V2)}
 <path d="M172,158 V134 h18 v24Z" fill="${I}" stroke="${G3}" stroke-width="1"/><path d="M176,140 h10 M176,146 h10" stroke="${C}" stroke-width="1.6"/><path d="M181,134 v-10" stroke="${G}" stroke-width="1.4"/>
 ${birds([[70,50,-8,.65]])}${frame}`;
},
/* 10. Hạc Thành: hạc đứng trên lưng rùa, biểu tượng đô thị tỉnh lỵ */
hacthanh(){
 const lotus=(x,y,s)=>`<g transform="translate(${x},${y}) scale(${s})"><path d="M0,0 C-6,-8 -6,-16 0,-22 C6,-16 6,-8 0,0Z M0,0 C-12,-4 -16,-12 -14,-18 C-6,-16 -2,-8 0,0Z M0,0 C12,-4 16,-12 14,-18 C6,-16 2,-8 0,0Z" fill="#e58a86" stroke="${G}" stroke-width="1"/><path d="M0,0 V14" stroke="#8fcf72" stroke-width="1.6"/></g>`;
 return `<rect width="300" height="200" fill="url(#aDem)"/>${sun(150,76,56,.96)}${cloud(12,22,1)}${cloud(236,26,.9)}
 <path d="M0,160 h14 v-18 h10 v10 h8 v-26 h12 v34 h8 v-14 h10 v14 H0Z M300,160 h-12 v-22 h-10 v12 h-8 v-30 h-12 v18 h-10 v22Z" fill="${V3}" stroke="${G2}" stroke-width=".8"/>
 <path d="M0,160 H300 V200 H0Z" fill="${V}"/><path d="M0,160 H300" stroke="${G2}" stroke-width="1.2"/>
 <path d="M96,168 C100,146 126,136 150,136 C174,136 200,146 204,168Z" fill="#7d4a1d" stroke="${G}" stroke-width="1.6"/>
 <path d="M112,166 l12,-18 h20 l8,18 M152,166 l8,-18 h18 l12,18 M124,148 l10,-10 M160,148 l-4,-11 M178,148 l-8,-10" stroke="${G}" stroke-width="1.1" fill="none"/>
 <path d="M204,162 C214,158 224,160 226,166 C220,172 208,172 204,168Z" fill="#7d4a1d" stroke="${G}" stroke-width="1.4"/><circle cx="218" cy="164" r="1.4" fill="${K}"/>
 <path d="M106,168 l-8,8 h12Z M194,168 l8,8 h-12Z" fill="#7d4a1d" stroke="${G}" stroke-width="1.2"/>
 <path d="M140,138 V112 M158,138 V114" stroke="${G}" stroke-width="2.4"/><path d="M134,138 h12 M152,138 h12" stroke="${G}" stroke-width="2"/>
 <path d="M112,96 C114,74 140,66 160,74 C174,80 176,96 168,106 C156,118 132,120 118,112 C112,108 110,102 112,96Z" fill="${I}" stroke="${G3}" stroke-width="1.4"/>
 <path d="M114,98 C96,96 82,104 72,118 C90,112 106,112 120,112Z" fill="${K}" stroke="${G3}" stroke-width="1"/><path d="M124,90 c10,4 22,4 34,-2 M122,100 c12,5 26,4 38,-3" stroke="${G3}" stroke-width="1" fill="none"/>
 <path d="M164,80 C176,66 170,50 180,38 C186,30 196,30 198,38" fill="none" stroke="${I}" stroke-width="7" stroke-linecap="round"/><path d="M164,80 C176,66 170,50 180,38 C186,30 196,30 198,38" fill="none" stroke="${G3}" stroke-width="1" opacity=".5"/>
 <circle cx="197" cy="38" r="7" fill="${I}" stroke="${G3}" stroke-width="1"/><path d="M193,32 c2,-5 8,-5 10,0Z" fill="${R}"/><circle cx="199" cy="37" r="1.3" fill="${K}"/>
 <path d="M203,38 L232,44 L203,43Z" fill="${G2}" stroke="${G3}" stroke-width=".8"/>
 ${lotus(40,168,.9)}${lotus(262,170,.8)}${lotus(66,180,.6)}${frame}`;
}};
const svg=(k,cls,slice)=>`<svg ${cls?`class="${cls}" `:''}viewBox="0 0 300 200" preserveAspectRatio="xMid${slice===false?'YMid meet':'YMid slice'}" aria-hidden="true">${draw[k]?draw[k]():''}</svg>`;
window.NTS_ART={defs:DEFS,draw,svg};
})();
