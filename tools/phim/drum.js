const f1=n=>n.toFixed(1);
const BIRD='M-14,0 C-8,-4 2,-4 7,-1.5 L18,-2 L7,1.5 C2,3.5 -8,3.5 -14,0Z M-3,-2 L-9,-9 L0,-3Z M-3,2 L-9,9 L0,3Z M-14,0 L-21,-4 M-14,0 L-21,4 M4,-2.5 L1,-8 M6,-2 L5,-8';
function drum(cx,cy,r,spin){
 let s=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#gDrum)"/><circle cx="${cx}" cy="${cy}" r="${f1(r-1)}" fill="none" stroke="#f6dc98" stroke-width="1.2" opacity=".8"/>`;
 [.9,.8,.62,.5,.36].forEach(k=>{s+=`<circle cx="${cx}" cy="${cy}" r="${f1(r*k)}" fill="none" stroke="#6e4116" stroke-width="${(r/80).toFixed(2)}" opacity=".75"/>`});
 let t='';for(let i=0;i<60;i++){const a=i*6*Math.PI/180,c=Math.cos(a),n=Math.sin(a);t+=`M${f1(cx+c*r*.81)},${f1(cy+n*r*.81)}L${f1(cx+c*r*.89)},${f1(cy+n*r*.89)}`}
 s+=`<path d="${t}" stroke="#6e4116" stroke-width="${(r/70).toFixed(2)}" opacity=".8"/>`;
 let d='';for(let i=0;i<36;i++){const a=i*10*Math.PI/180;d+=`<circle cx="${f1(cx+Math.cos(a)*r*.43)}" cy="${f1(cy+Math.sin(a)*r*.43)}" r="${(r*.018).toFixed(2)}"/>`}
 s+=`<g fill="#6e4116">${d}</g>`;
 let b='';const R=r*.71,sc=(r/90).toFixed(3);for(let i=0;i<6;i++){const a=i*60*Math.PI/180;b+=`<g transform="translate(${f1(cx+Math.cos(a)*R)},${f1(cy+Math.sin(a)*R)}) rotate(${i*60-90}) scale(${sc})"><path d="${BIRD}"/></g>`}
 s+=`<g class="${spin?'spin':''}" style="transform-origin:${cx}px ${cy}px" fill="#6e4116" stroke="#6e4116" stroke-width="1.2" stroke-linecap="round">${b}</g>`;
 let p='';for(let i=0;i<28;i++){const a=i*Math.PI/14-Math.PI/2,rr=i%2?r*.1:r*.28;p+=`${f1(cx+Math.cos(a)*rr)},${f1(cy+Math.sin(a)*rr)} `}
 s+=`<polygon points="${p}" fill="#fff1c4"/><circle cx="${cx}" cy="${cy}" r="${f1(r*.08)}" fill="#e0a94e"/>`;
 return s;
}
const ELE=`<ellipse cx="62" cy="96" rx="50" ry="4.5" fill="#000" opacity=".3"/>
<path d="M15,50 C8,54 8,62 6,67" fill="none" stroke="#8a5222" stroke-width="2.5" stroke-linecap="round"/>
<rect x="22" y="58" width="15" height="37" rx="6" fill="#7d4a1d"/><rect x="64" y="58" width="15" height="37" rx="6" fill="#7d4a1d"/>
<path d="M14,56 C10,32 32,19 58,21 C82,22 94,34 94,52 C94,68 82,74 60,74 C36,74 18,70 14,56Z" fill="url(#gEle)"/>
<rect x="36" y="60" width="15" height="36" rx="6" fill="url(#gEle)"/><rect x="78" y="60" width="15" height="36" rx="6" fill="url(#gEle)"/>
<path d="M32,24 C44,19 66,19 76,24 L74,47 C62,51 46,51 34,47Z" fill="#b8322a"/>
<path d="M36,31 l5,-4 5,4 5,-4 5,4 5,-4 5,4 5,-4 5,4 4,-3" fill="none" stroke="#f3d48a" stroke-width="1.4"/>
<path d="M35,41 C47,45 61,45 73,41" fill="none" stroke="#f3d48a" stroke-width="1.3" stroke-dasharray="2 3"/>
<path d="M22,28 C34,20 50,18 64,20" fill="none" stroke="#fbe3a8" stroke-width="1.5" opacity=".6"/>
<path d="M110,46 C124,40 128,26 122,15" fill="none" stroke="#c88d40" stroke-width="9" stroke-linecap="round"/>
<circle cx="98" cy="40" r="19" fill="url(#gEle)"/>
<path d="M86,26 C70,26 66,50 76,60 C83,66 92,59 92,50Z" fill="#8a5222"/>
<circle cx="81" cy="44" r="8" fill="none" stroke="#f3d48a" stroke-width="1"/><circle cx="81" cy="44" r="4.5" fill="none" stroke="#f3d48a" stroke-width="1"/><circle cx="81" cy="44" r="1.6" fill="#f3d48a"/>
<path d="M107,55 C113,59 119,59 123,54" fill="none" stroke="#fbf3e0" stroke-width="3" stroke-linecap="round"/>
<circle cx="103" cy="35" r="2.5" fill="#1b1206"/><circle cx="103.8" cy="34.2" r=".8" fill="#fff"/>
<path d="M98,21 l1.6,3.4 3.6,.4 -2.7,2.4 .8,3.6 -3.3,-1.9 -3.3,1.9 .8,-3.6 -2.7,-2.4 3.6,-.4Z" fill="#f3d48a"/>`;
const voi=w=>`<svg viewBox="0 0 130 100" width="${w}" height="${Math.round(w*100/130)}" aria-label="Voi Đồng" role="img">${ELE}</svg>`;

