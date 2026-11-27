/* Thế giới 3D của game "Nghị trường số": sa bàn xứ Thanh với núi phía tây, đồng bằng, sông Mã, sông Chu, biển Đông
   và 10 cụm di sản đặt theo vị trí địa lý tương đối. Cần assets/vendor/three.min.js và assets/3d/mo-hinh.js nạp trước.
   Dùng qua window.NTS_3D:
     init({stages, quality, reduced, onSelect, onEnter})  dựng cảnh, trả về true nếu máy chạy được WebGL
     mount(host)            đặt khung 3D vào một phần tử (null để tạm nghỉ)
     setView(mode, i)       'map' bản đồ hành trình | 'focus' cận cảnh chặng i | 'idle' toàn cảnh xoay chậm | 'fly' bay dọc sông Mã
     select(i), setStates([...]), setMascot(i, walk), react('ok'|'bad'|'win'|'drum'), flyTo(p), thumb(key, w, h), setQuality(q)
   Trục tọa độ: x hướng đông, z hướng nam, y lên cao; mặt nước ở y = 0. */
(function(){
'use strict';
const T=window.THREE,MD=window.NTS_MODELS,G={ok:false};window.NTS_3D=G;
if(!T||!MD)return;
const PI=Math.PI,sat=v=>v<0?0:v>1?1:v,lerp=(a,b,t)=>a+(b-a)*t,smooth=t=>{t=sat(t);return t*t*(3-2*t)};
const h2=(x,z)=>{let n=(Math.imul(x,374761393)+Math.imul(z,668265263))|0;n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967296};
function vnoise(x,z){const xi=Math.floor(x),zi=Math.floor(z),xf=x-xi,zf=z-zi,u=xf*xf*(3-2*xf),v=zf*zf*(3-2*zf);return lerp(lerp(h2(xi,zi),h2(xi+1,zi),u),lerp(h2(xi,zi+1),h2(xi+1,zi+1),u),v)}
function fbm(x,z){let a=.5,f=1,s=0;for(let i=0;i<4;i++){s+=a*vnoise(x*f,z*f);a*=.5;f*=2.03}return s/.9375}
function rng(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}

/* ---------- Địa lý: bờ biển, sông, vị trí 10 chặng ---------- */
const S=2; /* hệ số giãn sa bàn: tọa độ sông và hàm núi được thiết kế ở tỷ lệ 1, nhân S khi dựng */
const coastX=z=>124-.33*z+5*Math.sin(z*.04);
const RIV={ma:[[-170,-100,1],[-110,-75,1.2],[-82,-62,1.3],[-58,-46,1.5],[-42,-38,1.6],[-27,-27,1.8],[-14,-17,2],[-2,-6,2.2],[8,2,2.4],[16,3.4,2.7],[24,3.2,2.8],[33,2,2.9],[42,4.6,3.1],[52,9,3.5],[60,12,4.2],[72,14.5,5.5]],
 chu:[[-170,30,.9],[-110,23,1.1],[-80,19.5,1.2],[-55,18.5,1.3],[-38,17.5,1.4],[-22,15,1.5],[-8,11,1.6],[6,6,1.7],[16,3.4,1.8]]};
/* [khóa, x, z, góc quay, các bãi phẳng (tọa độ cục bộ)] */
const PLACE=[
 ['dongson',30,27,0,[{x:0,z:0,r:7.5,h:.9}]],
 ['hamrong',66,4,-.11,null],
 ['thanhho',8,-56,0,[{x:0,z:2,r:16,h:1},{x:-15,z:0,r:9,h:1},{x:15,z:0,r:9,h:1}]],
 ['lamkinh',-68,-16,0,[{x:0,z:3,r:16.5,h:1.8}]],
 ['batrieu',98,-32,0,[{x:0,z:-1,r:14,h:1.2}]],
 ['samson',106.3,54,-.41,[{x:-3,z:0,r:9.5,h:.7}]],
 ['puluong',-132,-126,.12,[{x:0,z:1,r:13,h:9}]],
 ['camluong',-50,-80,0,[{x:0,z:0,r:12.5,h:1.6}]],
 ['nghison',72.7,124,-.27,[{x:-4,z:0,r:11.5,h:.7}]],
 ['hacthanh',58,58,0,[{x:0,z:0,r:15,h:.9}]]];
const ISLES=[{x:118,z:158,r:11,h:7},{x:160,z:18,r:8,h:5},{x:134,z:98,r:5,h:3.4}];
const AZ0=.42,FOV=38;

let cloudG=null,renderer,scene,camera,canvas,wrap,pinsEl,hudEl,opts={},LM=[],PADS=[],rivS=[],rivGrid=new Map(),maCurve,jCurve;
let skyMesh,sun,hemi,water,waterTex,skyMat,trail,ring,puffs=[],clouds=[],boats=[],flock=[],mascot,qdrum,hero,parts,env;
let running=false,raf=0,last=0,time=0,W=1,H=1,dpr=1,quality='high',reduced=false,states=[],sel=0,ro=null,io=null,inView=true;
const cam={lift:0,mode:'map',i:0,u:0,ug:0,az:AZ0,el:.62,dist:50,tgt:new T.Vector3(),azOff:0,elOff:0,zoom:1,fly:0,flyG:0,snap:true};
const mas={i:0,u:0,from:0,to:0,t:1,dur:1,pos:new T.Vector3(),yaw:0};
const V=new T.Vector3(),V2=new T.Vector3();

/* ---------- Độ cao địa hình ---------- */
function sampleRiver(pts){
 const c=new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(p[0]*S,0,p[1]*S))),n=Math.ceil(c.getLength()/1.3),out=[];
 for(let i=0;i<=n;i++){const t=i/n,p=c.getPoint(t),f=t*(pts.length-1),k=Math.min(pts.length-2,Math.floor(f));out.push([p.x,p.z,lerp(pts[k][2],pts[k+1][2],f-k)*1.45])}
 return{c,s:out};
}
function addRiver(s){s.forEach(p=>{rivS.push(p);const k=Math.floor(p[0]/14)+','+Math.floor(p[1]/14);if(!rivGrid.has(k))rivGrid.set(k,[]);rivGrid.get(k).push(p)})}
function riverD(x,z){ /* khoảng cách tới mép nước gần nhất (âm nếu ở trong lòng sông) */
 const cx=Math.floor(x/14),cz=Math.floor(z/14);let best=99;
 for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const l=rivGrid.get((cx+a)+','+(cz+b));if(!l)continue;for(let i=0;i<l.length;i++){const p=l[i],d=Math.hypot(x-p[0],z-p[1])-p[2];if(d<best)best=d}}
 return best;
}
const AUX={m:0,dr:0,dc:0};
function mountain(x,z){const w=sat((-x*.9-z*.5-12)/116);return w*w*(3-2*w)}
function HT(x,z){
 const m=mountain(x,z),hills=fbm(x*.036+11,z*.036+7),ridg=1-Math.abs(2*fbm(x*.024+3,z*.024+9)-1);
 let h=.75+.35*fbm(x*.1,z*.1)+m*(3+27*hills*ridg+5*hills);
 h+=sat((-x*.6+z*.5-44)/100)*6*fbm(x*.05+31,z*.05);
 for(let i=0;i<PADS.length;i++){const p=PADS[i],d=Math.hypot(x-p.x,z-p.z);if(d<p.r+p.f){const t=smooth((d-p.r)/p.f);h=lerp(p.h,h,t)}}
 const dr=riverD(x,z),bank=3+m*7;
 if(dr<bank)h=dr<0?-1:lerp(-.5,h,smooth(dr/bank));
 const dc=x-coastX(z);
 if(dc>-7)h=lerp(h,-3,smooth((dc+7)/11));
 for(let i=0;i<ISLES.length;i++){const s=ISLES[i],d=Math.hypot(x-s.x,z-s.z)/s.r;if(d<1.4)h=Math.max(h,s.h*(1-d*d)+ (d<1?fbm(x*.4,z*.4)*.8:0)-.2)}
 AUX.m=m;AUX.dr=dr;AUX.dc=dc;return h;
}
const ground=(x,z)=>Math.max(0,HT(x,z));

function axis(a,b,step,f0,f1){const pre=[],v=[];let x=a,s=step;while(x>f0){s*=1.32;x-=s;pre.push(Math.max(x,f0))}pre.reverse().forEach(p=>v.push(p));for(x=a;x<=b+1e-6;x+=step)v.push(x);x=b;s=step;while(x<f1){s*=1.32;x+=s;v.push(Math.min(x,f1))}return v}
function buildTerrain(){
 const XS=axis(-196,158,1.7,-600,540),ZS=axis(-182,180,1.7,-540,600),nx=XS.length,nz=ZS.length;
 const P=new Float32Array(nx*nz*3),C=new Float32Array(nx*nz*3),I=[],c=new T.Color(),c2=new T.Color();
 const PAD=[0x9cc552,0x8fbf50,0xa9cc5a,0xd2c459,0x7ab04e,0x86b84f];
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){
  const x=XS[i],z=ZS[j],h=HT(x,z),m=AUX.m,dr=AUX.dr,dc=AUX.dc,k=(j*nx+i)*3;P[k]=x;P[k+1]=h;P[k+2]=z;
  const n=fbm(x*.3,z*.3);
  if(h<.06){c.setHex(0xd9c690).lerp(c2.setHex(0x2f6f6a),sat(-h/1.6))}
  else if(dc>-10.5&&h<1.3){c.setHex(0xe9d7a4).lerp(c2.setHex(0xd8c58c),n)}
  else if(dr<1.6&&h<.9){c.setHex(0xbdb47c)}
  else if(m<.12){c.setHex(PAD[Math.floor(h2(Math.floor(x/6),Math.floor(z/6))*PAD.length)]).lerp(c2.setHex(0x6aa84f),n*.35)}
  else{const s=Math.abs(HT(x+1,z)-h)+Math.abs(HT(x,z+1)-h);c.setHex(0x5e9f52).lerp(c2.setHex(0x2c6646),sat(h/13)).lerp(c2.setHex(0x86b356),(1-sat(m*2.2))*.7);if(s>2.1||h>19)c.lerp(c2.setHex(0x8a937f),sat((s-2.1)*.6+(h-19)*.2));c.offsetHSL(0,0,(n-.5)*.07)}
  C[k]=c.r;C[k+1]=c.g;C[k+2]=c.b;
 }
 for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){const a=j*nx+i,b=a+1,d=a+nx,e=d+1;I.push(a,d,b,b,d,e)}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(P,3));g.setAttribute('color',new T.BufferAttribute(C,3));g.setIndex(I);g.computeVertexNormals();
 const me=new T.Mesh(g,new T.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:.95,metalness:0}));me.receiveShadow=true;me.castShadow=false;return me;
}

/* ---------- Bầu trời, nước ---------- */
function buildSky(){
 skyMat=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,fog:false,
  uniforms:{top:{value:new T.Color(0x2f86b8)},mid:{value:new T.Color(0x9fd3d6)},hor:{value:new T.Color(0xffe6b3)},sun:{value:new T.Vector3(-.45,.5,.74).normalize()}},
  vertexShader:'varying vec3 v;void main(){v=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'uniform vec3 top,mid,hor,sun;varying vec3 v;void main(){float h=clamp(v.y,-.2,1.);vec3 c=mix(hor,mid,smoothstep(0.,.22,h));c=mix(c,top,smoothstep(.18,.8,h));float s=max(dot(normalize(v),sun),0.);c+=vec3(1.,.82,.5)*(pow(s,90.)*.9+pow(s,8.)*.16);gl_FragColor=vec4(c,1.);}'});
 return new T.Mesh(new T.SphereGeometry(900,24,14),skyMat);
}
function buildWater(){
 const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,256,256);
 g.strokeStyle='rgba(120,190,190,.5)';g.lineWidth=2.2;g.lineCap='round';const r=rng(7);
 for(let i=0;i<34;i++){const x=r()*256,y=r()*256,l=14+r()*26;for(let ox=-256;ox<=256;ox+=256)for(let oy=-256;oy<=256;oy+=256){g.beginPath();g.moveTo(x+ox,y+oy);g.quadraticCurveTo(x+ox+l/2,y+oy-5,x+ox+l,y+oy);g.stroke()}}
 waterTex=new T.CanvasTexture(c);waterTex.colorSpace=T.SRGBColorSpace;waterTex.wrapS=waterTex.wrapT=T.RepeatWrapping;waterTex.repeat.set(150,150);
 const m=new T.MeshStandardMaterial({color:0x3fa7a6,map:waterTex,transparent:true,opacity:.9,roughness:.16,metalness:.25});
 const me=new T.Mesh(new T.PlaneGeometry(2600,2600),m);me.rotation.x=-PI/2;me.receiveShadow=true;return me;
}

/* ---------- Cây, làng, mây, chim, thuyền ---------- */
function mergeColored(list){ /* [[geometry, màu]] -> một lưới có màu theo đỉnh */
 let n=0;const gs=list.map(([g,col])=>{const q=g.index?g.toNonIndexed():g;n+=q.attributes.position.count;return[q,new T.Color(col)]});
 const P=new Float32Array(n*3),N=new Float32Array(n*3),C=new Float32Array(n*3);let k=0;
 gs.forEach(([g,col])=>{if(!g.attributes.normal)g.computeVertexNormals();P.set(g.attributes.position.array,k*3);N.set(g.attributes.normal.array,k*3);for(let i=0;i<g.attributes.position.count;i++){C[(k+i)*3]=col.r;C[(k+i)*3+1]=col.g;C[(k+i)*3+2]=col.b}k+=g.attributes.position.count});
 const o=new T.BufferGeometry();o.setAttribute('position',new T.BufferAttribute(P,3));o.setAttribute('normal',new T.BufferAttribute(N,3));o.setAttribute('color',new T.BufferAttribute(C,3));return o;
}
const tg=(g,x,y,z)=>{g.translate(x,y,z);return g};
function nearLM(x,z,extra){for(let i=0;i<PADS.length;i++){const p=PADS[i];if(Math.hypot(x-p.x,z-p.z)<p.r+(extra||0))return true}return false}
function buildTrees(n){
 const gA=mergeColored([[tg(new T.CylinderGeometry(.09,.13,.8,5),0,.4,0),0x5e4229],[tg(MD.rockGeo(.75,3,0),0,1.3,0),0x3d8a4a],[tg(MD.rockGeo(.5,5,0),.22,1.8,.1),0x56a052]]);
 const gB=mergeColored([[tg(new T.CylinderGeometry(.07,.1,.6,5),0,.3,0),0x5e4229],[tg(new T.ConeGeometry(.62,1.25,6),0,1.1,0),0x2c6b47],[tg(new T.ConeGeometry(.44,1.05,6),0,1.78,0),0x377a4c]]);
 const mat=new T.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:.95});
 const r=rng(20261),d=new T.Object3D(),cells=new Map(),g=new T.Group();let k=0,guard=0;
 while(k<n&&guard++<n*40){
  const x=-240+r()*400,z=-218+r()*436,h=HT(x,z),m=AUX.m;
  if(h<.85||h>21||AUX.dr<1.2||AUX.dc>-10||nearLM(x,z,1.5))continue;
  const dens=m>.12?.85:(fbm(x*.09+50,z*.09)>.62?.5:.05);if(r()>dens)continue;
  const s=(m>.12?1.5:1.1)*(.75+r()*.7);d.position.set(x,h-.05,z);d.rotation.y=r()*6.28;d.scale.set(s,s*(.85+r()*.4),s);d.updateMatrix();
  const pine=m>.3?r()<.6:r()<.22,key=(pine?'B':'A')+Math.floor(x/110)+','+Math.floor(z/110);
  if(!cells.has(key))cells.set(key,[]);cells.get(key).push([d.matrix.clone(),.82+r()*.18]);k++;
 }
 const col=new T.Color();
 cells.forEach((list,key)=>{const me=new T.InstancedMesh(key[0]==='B'?gB:gA,mat,list.length);list.forEach((it,i)=>{me.setMatrixAt(i,it[0]);me.setColorAt(i,col.setScalar(it[1]))});me.castShadow=true;me.receiveShadow=true;me.computeBoundingSphere();g.add(me)});
 return g;
}
function buildVillages(){
 const pr=new T.Shape();pr.moveTo(-.62,0);pr.lineTo(0,.5);pr.lineTo(.62,0);pr.closePath();const rg=new T.ExtrudeGeometry(pr,{depth:1.5,bevelEnabled:false});rg.translate(0,.62,-.75);
 const geo=mergeColored([[tg(new T.BoxGeometry(1,.62,1.3),0,.31,0),0xf1e7cf],[rg,0xb5482f]]);
 const N=260,me=new T.InstancedMesh(geo,new T.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:.9}),N),r=rng(977),d=new T.Object3D(),col=new T.Color();let k=0,guard=0;
 while(k<N&&guard++<1500){
  const cx=-90+r()*215,cz=-110+r()*270;HT(cx,cz);if(AUX.m>.2||AUX.dc>-13||AUX.dr<3||nearLM(cx,cz,6))continue;
  const cnt=4+Math.floor(r()*6);
  for(let i=0;i<cnt&&k<N;i++){const x=cx+(r()-.5)*9,z=cz+(r()-.5)*9,h=HT(x,z);if(h<.7||AUX.dr<2||nearLM(x,z,2))continue;const s=.8+r()*.5;d.position.set(x,h-.03,z);d.rotation.y=Math.floor(r()*4)*PI/2+(r()-.5)*.3;d.scale.set(s,s,s);d.updateMatrix();me.setMatrixAt(k,d.matrix);col.setHSL(.05,0,.85+r()*.15);me.setColorAt(k++,col)}
 }
 me.count=k;me.castShadow=true;me.receiveShadow=true;return me;
}
function buildClouds(){
 const mat=new T.MeshStandardMaterial({color:0xffffff,roughness:1,flatShading:true,transparent:true,opacity:.93}),g=new T.Group(),r=rng(31);
 for(let i=0;i<13;i++){const c=new T.Group(),n=3+Math.floor(r()*3);for(let k=0;k<n;k++){const s=2.4+r()*2.6,me=new T.Mesh(MD.rockGeo(1,i*7+k),mat);me.position.set((k-n/2)*3+r()*1.5,r()*1.2,r()*2.5);me.scale.set(s*1.3,s*.55,s);c.add(me)}
  c.position.set(-240+r()*460,36+r()*12,-200+r()*390);c.userData.v=.5+r()*.6;g.add(c);clouds.push(c)}
 return g;
}
function buildBoat(sail){
 const m=MD.mats(),g=new T.Group();
 const hs=new T.Shape();hs.moveTo(-.34,-.9);hs.lineTo(.34,-.9);hs.lineTo(.4,.5);hs.lineTo(0,1.2);hs.lineTo(-.4,.5);hs.closePath();const hg=new T.ExtrudeGeometry(hs,{depth:.32,bevelEnabled:false});hg.rotateX(PI/2);
 g.add(MD.mesh(hg,m.wood,0,.28,0));g.add(MD.box(.5,.26,.7,m.thatch,0,.38,-.35));g.add(MD.cyl(.03,.035,1.5,m.woodD,0,.9,.15,5));
 const sg=new T.BufferGeometry();sg.setAttribute('position',new T.Float32BufferAttribute([0,.4,.2,0,1.6,.2,0,.5,-.8, 0,.4,.2,0,.5,-.8,0,1.6,.2],3));sg.computeVertexNormals();g.add(new T.Mesh(sg,sail?m.wood:m.ivory));
 g.traverse(o=>{if(o.isMesh)o.castShadow=true});return g;
}
function buildBird(){
 const m=MD.mats(),g=new T.Group();g.add(MD.mesh(new T.ConeGeometry(.1,.7,5),m.ivory,0,0,0,[PI/2,0,0]));
 const wg=new T.BufferGeometry();wg.setAttribute('position',new T.Float32BufferAttribute([0,0,.18,0,0,-.2,.85,0,-.05],3));wg.computeVertexNormals();
 const wm=new T.MeshStandardMaterial({color:0xf6eedb,side:T.DoubleSide,flatShading:true});
 const l=new T.Mesh(wg,wm),r=new T.Mesh(wg,wm);r.scale.x=-1;g.add(l,r);g.userData.w=[l,r];return g;
}

/* ---------- Hạt hiệu ứng ---------- */
function buildParts(){
 const N=220,c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),gr=x.createRadialGradient(32,32,2,32,32,30);gr.addColorStop(0,'#fff');gr.addColorStop(.35,'rgba(255,255,255,.75)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,64,64);
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(new Float32Array(N*3),3));geo.setAttribute('color',new T.BufferAttribute(new Float32Array(N*3),3));
 const pts=new T.Points(geo,new T.PointsMaterial({size:.7,map:new T.CanvasTexture(c),vertexColors:true,transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false}));pts.frustumCulled=false;
 parts={pts,N,v:new Float32Array(N*3),life:new Float32Array(N),max:new Float32Array(N),col:new Float32Array(N*3),next:0};return pts;
}
function burst(p,n,cols,spd,up){
 const c=new T.Color(),P=parts.pts.geometry.attributes.position;
 for(let k=0;k<n;k++){const i=parts.next;parts.next=(i+1)%parts.N;const a=Math.random()*6.283,b=Math.acos(2*Math.random()-1),s=(spd||5)*(.4+Math.random()*.8);
  P.setXYZ(i,p.x,p.y,p.z);parts.v[i*3]=Math.sin(b)*Math.cos(a)*s;parts.v[i*3+1]=Math.cos(b)*s+(up||0);parts.v[i*3+2]=Math.sin(b)*Math.sin(a)*s;
  parts.max[i]=parts.life[i]=.8+Math.random()*.9;c.setHex(cols[k%cols.length]);parts.col[i*3]=c.r;parts.col[i*3+1]=c.g;parts.col[i*3+2]=c.b}
}
function tickParts(dt){
 const P=parts.pts.geometry.attributes.position,C=parts.pts.geometry.attributes.color;let any=false;
 for(let i=0;i<parts.N;i++){if(parts.life[i]<=0)continue;any=true;parts.life[i]-=dt;const f=Math.max(0,parts.life[i]/parts.max[i]);
  parts.v[i*3+1]-=6*dt;P.setXYZ(i,P.getX(i)+parts.v[i*3]*dt,P.getY(i)+parts.v[i*3+1]*dt,P.getZ(i)+parts.v[i*3+2]*dt);C.setXYZ(i,parts.col[i*3]*f,parts.col[i*3+1]*f,parts.col[i*3+2]*f)}
 if(any||parts.dirty){P.needsUpdate=true;C.needsUpdate=true;parts.dirty=any}
}

/* ---------- Dựng cảnh ---------- */
function build(){
 scene=new T.Scene();scene.fog=new T.Fog(0xdfe6cf,130,480);
 skyMesh=buildSky();scene.add(skyMesh);
 const pm=new T.PMREMGenerator(renderer),es=new T.Scene();es.add(buildSky());env=pm.fromScene(es,.04).texture;scene.environment=env;scene.environmentIntensity=.55;pm.dispose();
 hemi=new T.HemisphereLight(0xdcefff,0x9a8a5c,1.15);scene.add(hemi);
 sun=new T.DirectionalLight(0xfff1d6,2.7);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-.0006;sun.shadow.normalBias=.06;scene.add(sun,sun.target);
 const ma=sampleRiver(RIV.ma),chu=sampleRiver(RIV.chu);addRiver(ma.s);addRiver(chu.s);maCurve=ma.c;
 /* 10 cụm mô hình: dựng trước để biết các bãi phẳng, rồi mới nặn địa hình */
 const defs=(opts.stages||[]);
 PLACE.forEach((p,i)=>{
  const pads=p[4],y=pads?pads[0].h:0,res=MD.build[p[0]]({wl:-y}),cs=Math.cos(p[3]),sn=Math.sin(p[3]);
  const w=(lx,lz)=>[p[1]+lx*cs+lz*sn,p[2]-lx*sn+lz*cs];
  (pads||res.pads||[]).forEach(q=>{const a=w(q.x,q.z);PADS.push({x:a[0],z:a[1],r:q.r,h:q.h,f:pads?8:5})});
  /* dọn quang một dải về phía ống kính để núi không che cụm mô hình */
  if(pads)[15,29].forEach((dd,k)=>{const a=w(Math.sin(res.face)*dd,Math.cos(res.face)*dd);PADS.push({x:a[0],z:a[1],r:12+k*3,h:Math.max(.9,y*(k?.55:.8)),f:11})});
  const cc=res.c?w(res.c[0],res.c[1]):[p[1],p[2]];
  res.obj.position.set(p[1],y,p[2]);res.obj.rotation.y=p[3];scene.add(res.obj);
  const sp=w(res.spot[0],res.spot[1]);
  LM.push({k:p[0],x:p[1],y,z:p[2],cx:cc[0],cz:cc[1],rot:p[3],H:res.H,R:res.R,face:res.face+p[3],spot:sp,res,def:defs[i]||{}});
 });
 scene.add(buildTerrain());
 LM.forEach(l=>{l.spotY=Math.max(l.y,ground(l.spot[0],l.spot[1]))});
 water=buildWater();scene.add(water);
 scene.add(buildTrees(quality==='low'?1300:3400));scene.add(buildVillages());
 if(quality!=='low'){cloudG=buildClouds();scene.add(cloudG)}
 /* đường hành trình nối 10 chặng */
 jCurve=new T.CatmullRomCurve3(LM.map(l=>new T.Vector3(l.x,l.y,l.z)),false,'catmullrom',.5);
 const dots=[];for(let i=0;i<=640;i++){const t=i/640,p=jCurve.getPoint(t);if(LM.some(l=>Math.hypot(p.x-l.x,p.z-l.z)<l.R*.62))continue;dots.push([p.x,ground(p.x,p.z)+.22,p.z,t*9])}
 trail=new T.InstancedMesh(new T.SphereGeometry(.42,8,5),new T.MeshBasicMaterial({color:0xffffff}),dots.length);trail.userData.d=dots;
 const d=new T.Object3D();dots.forEach((p,i)=>{d.position.set(p[0],p[1],p[2]);d.scale.set(1,.45,1);d.updateMatrix();trail.setMatrixAt(i,d.matrix);trail.setColorAt(i,new T.Color(0xf9f1df))});scene.add(trail);
 ring=new T.Mesh(new T.TorusGeometry(1,.035,6,56),new T.MeshBasicMaterial({color:0xf5d98f,transparent:true,opacity:.9,fog:false}));ring.rotation.x=PI/2;scene.add(ring);
 /* mây che chặng chưa mở */
 const pmat=new T.MeshStandardMaterial({color:0xf2f4ee,roughness:1,flatShading:true,transparent:true,opacity:.94});
 LM.forEach((l,i)=>{const g=new T.Group();for(let k=0;k<5;k++){const a=k*1.26+i,me=new T.Mesh(MD.rockGeo(1,i*5+k),pmat),s=l.R*.34;me.position.set(Math.cos(a)*l.R*.42,l.H*(.35+.14*(k%3)),Math.sin(a)*l.R*.42);me.scale.set(s*1.4,s*.6,s*1.1);g.add(me)}
  g.position.set(l.x,l.y,l.z);g.userData.k=0;g.visible=false;scene.add(g);puffs.push(g)});
 /* linh vật và trống hội */
 hero=new T.Group();mascot=MD.voi();mascot.scale.setScalar(1.45);hero.add(mascot);
 qdrum=MD.drum();qdrum.scale.setScalar(.62);qdrum.position.set(1.9,.38,.5);qdrum.rotation.set(.75,-.5,0);hero.add(qdrum);
 const st=MD.mats();[-1,1].forEach(s=>{const leg=MD.box(.09,.9,.09,st.woodR,1.9+s*.5,.36,.2,[.5,0,s*.2]);leg.castShadow=true;hero.add(leg)});
 scene.add(hero);
 /* thuyền trên sông, chim trời */
 for(let i=0;i<4;i++){const b=buildBoat(i%2);b.userData.u=.3+i*.17;b.userData.v=.004+i*.0012;scene.add(b);boats.push(b)}
 [[124,70,1],[130,86,0],[100,142,1]].forEach(([x,z,s],i)=>{const b=buildBoat(s);b.position.set(x,0,z);b.rotation.y=i*1.3;b.userData.sea=1;b.scale.setScalar(1.3);scene.add(b);boats.push(b)});
 for(let i=0;i<10;i++){const b=buildBird();b.userData.i=i;scene.add(b);flock.push(b)}
 scene.add(buildParts());
 mas.i=0;placeMascot();
}

/* ---------- Camera ---------- */
function fit(R,Hh){const t=Math.tan(FOV*PI/360),a=W/H;return Math.max(Hh/t,R/(t*a))*1.06}
function jPoint(u,out){u=Math.max(0,Math.min(9,u));jCurve.getPoint(u/9,out);out.y=ground(out.x,out.z);return out}
function goal(){
 const t=time,g={x:0,y:0,z:0,az:AZ0,el:.62,d:50};
 if(cam.mode==='focus'){
  const l=LM[cam.i]||LM[0];g.x=l.cx;g.y=l.y+l.H*.3;g.z=l.cz;g.az=l.face+cam.azOff+(reduced?0:Math.sin(t*.16)*.3);g.el=Math.max(.12,Math.min(1.2,.37+cam.elOff))+cam.lift;g.d=fit(l.R*1.42,l.H*.92)*cam.zoom;
 }else if(cam.mode==='fly'){
  const p=Math.min(.985,.42+cam.fly*.565);maCurve.getPointAt(p,V);const tn=maCurve.getTangentAt(p,V2),mm=mountain(V.x,V.z);g.x=V.x+tn.x*6;g.y=1.2;g.z=V.z+tn.z*6;g.az=Math.atan2(-tn.x,-tn.z)+.45;g.el=lerp(.64,1.12,mm);g.d=fit(24,15)*(1+mm*.25);
 }else if(cam.mode==='idle'){
  jPoint(cam.u,V);g.x=lerp(V.x,18,.6);g.y=2;g.z=lerp(V.z,6,.6);g.az=AZ0+cam.azOff+(reduced?0:t*.035);g.el=Math.max(.3,Math.min(1.25,.72+cam.elOff));g.d=fit(104,60)*cam.zoom;
 }else{
  jPoint(cam.u,V);g.x=V.x;g.y=V.y+2.5;g.z=V.z;g.az=AZ0+(reduced?0:Math.sin(t*.1)*.06);g.el=.6;g.d=fit(27,17)*cam.zoom;
 }
 return g;
}
function tickCamera(dt){
 if(cam.mode==='map'||cam.mode==='idle'){const k=1-Math.exp(-dt*4.5);cam.u=cam.drag?cam.ug:lerp(cam.u,cam.ug,k)}
 cam.fly=lerp(cam.fly,cam.flyG,1-Math.exp(-dt*2));
 const g=goal(),k=(cam.snap||reduced)?1:1-Math.exp(-dt*3.1);cam.snap=false;
 cam.tgt.x=lerp(cam.tgt.x,g.x,k);cam.tgt.y=lerp(cam.tgt.y,g.y,k);cam.tgt.z=lerp(cam.tgt.z,g.z,k);
 let da=g.az-cam.az;da=Math.atan2(Math.sin(da),Math.cos(da));cam.az+=da*k;cam.el=lerp(cam.el,g.el,k);cam.dist=lerp(cam.dist,g.d,k);
 const ce=Math.cos(cam.el),x=cam.tgt.x+Math.sin(cam.az)*ce*cam.dist,z=cam.tgt.z+Math.cos(cam.az)*ce*cam.dist;let y=cam.tgt.y+Math.sin(cam.el)*cam.dist;
 y=Math.max(y,ground(x,z)+(cam.mode==='fly'?7:2.2));
 /* núi che tầm nhìn khi cận cảnh thì nâng dần góc máy */
 if(cam.mode==='focus'){let blk=false;for(let i=1;i<7&&!blk;i++){const f=i/7;if(ground(lerp(x,cam.tgt.x,f),lerp(z,cam.tgt.z,f))+.8>lerp(y,cam.tgt.y,f))blk=true}
  cam.lift=blk?Math.min(.75,cam.lift+dt*.8):cam.lift}else cam.lift=0;
 camera.position.set(x,y,z);camera.lookAt(cam.tgt);skyMesh.position.copy(camera.position);
 /* nắng đi theo điểm nhìn để bóng đổ luôn sắc nét */
 const s=Math.max(16,Math.min(95,cam.dist*.8)),q=s/512;
 sun.target.position.set(Math.round(cam.tgt.x/q)*q,0,Math.round(cam.tgt.z/q)*q);sun.position.copy(sun.target.position).add(V.set(-.45,.62,.6).multiplyScalar(140));
 const sc=sun.shadow.camera;if(sc.right!==s){sc.left=-s;sc.right=s;sc.top=s;sc.bottom=-s;sc.near=10;sc.far=380;sc.updateProjectionMatrix()}
}

/* ---------- Linh vật ---------- */
function spotOf(i,out){const l=LM[i];return out.set(l.spot[0],l.spotY,l.spot[1])}
function placeMascot(){spotOf(mas.i,mas.pos);hero.position.copy(mas.pos)}
function tickMascot(dt){
 const U=mascot.userData;
 if(mas.t<1){
  mas.t=Math.min(1,mas.t+dt/mas.dur);const e=smooth(mas.t),u=lerp(mas.from,mas.to,e);
  jPoint(u,V);const a=spotOf(Math.round(mas.from),V2).clone(),b=spotOf(Math.round(mas.to),V2),w=Math.sin(e*PI);
  const px=lerp(lerp(a.x,b.x,e),V.x,w),pz=lerp(lerp(a.z,b.z,e),V.z,w),dx=px-hero.position.x,dz=pz-hero.position.z;
  if(Math.abs(dx)+Math.abs(dz)>1e-4)mas.yaw=Math.atan2(dx,dz);
  hero.position.set(px,Math.max(ground(px,pz),lerp(a.y,b.y,e)*(1-w)),pz);
  if(mas.t>=1){mas.i=Math.round(mas.to);U.play('idle');placeMascot()}
 }else{
  const want=Math.atan2(camera.position.x-hero.position.x,camera.position.z-hero.position.z)-.3;let d=want-mas.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));mas.yaw+=d*(1-Math.exp(-dt*3));
 }
 hero.rotation.y=mas.yaw;qdrum.visible=mas.t>=1;hero.children.forEach((c,i)=>{if(i>1)c.visible=mas.t>=1});
 U.tick(time,dt);
 if(qdrum.userData.b>0){qdrum.userData.b=Math.max(0,qdrum.userData.b-dt*3.2);qdrum.scale.setScalar(.62*(1+Math.sin(qdrum.userData.b*PI)*.16))}
}

/* ---------- Vòng lặp ---------- */
function update(dt){
 time+=dt;
 tickCamera(dt);tickMascot(dt);
 LM.forEach(l=>{if(l.res.tick)l.res.tick(time,dt)});
 waterTex.offset.set(time*.006,time*.004);
 if(cloudG){cloudG.visible=camera.position.y<30;clouds.forEach(c=>{c.position.x+=c.userData.v*dt;if(c.position.x>240)c.position.x=-240})}
 boats.forEach((b,i)=>{if(b.userData.sea){b.position.y=Math.sin(time+i)*.06;b.rotation.z=Math.sin(time*.8+i)*.05;return}
  const u=(b.userData.u+time*b.userData.v)%.66+.3;maCurve.getPointAt(u,V);maCurve.getTangentAt(u,V2);b.position.set(V.x,Math.sin(time*1.2+i)*.04,V.z);b.rotation.y=Math.atan2(V2.x,V2.z)});
 flock.forEach((b,k)=>{const i=b.userData.i,grp=i<6?0:1,cx=grp?-112:46,cz=grp?-108:14,R=grp?16:24,a=time*(grp?.2:.16)+i*.34,y=(grp?24:10)+Math.sin(time*.5+i)*1.2;
  b.position.set(cx+Math.cos(a)*(R+(i%3)*1.6),y+(i%2)*.8,cz+Math.sin(a)*(R*.7+(i%3)*1.4));b.rotation.y=-a;const f=Math.sin(time*7+i)*.6;b.userData.w[0].rotation.z=f;b.userData.w[1].rotation.z=-f});
 /* vòng sáng dưới chặng đang chọn, mây che chặng chưa mở */
 const l=LM[sel];ring.visible=cam.mode==='map'&&!!l;if(l){const s=l.R*.98*(1+Math.sin(time*2.4)*.025);ring.scale.set(s,s,s);ring.position.set(l.x,Math.max(l.y,0)+.25,l.z);ring.material.opacity=.55+.35*Math.sin(time*2.4)}
 puffs.forEach((g,i)=>{const lock=states[i]&&!states[i].open&&cam.mode!=='focus',k=g.userData.k=lerp(g.userData.k,lock?1:0,1-Math.exp(-dt*3));g.visible=k>.02;if(g.visible){g.scale.setScalar(k);g.rotation.y=time*.05+i}});
 tickParts(dt);
}
function updatePins(){
 if(!pinsEl)return;const show=cam.mode==='map';pinsEl.style.display=show?'':'none';if(!show)return;
 const ps=pinsEl.children;
 for(let i=0;i<LM.length;i++){const l=LM[i],el=ps[i];if(!el)continue;V.set(l.x,l.y+l.H+1.1,l.z).project(camera);
  const ok=V.z<1&&V.x>-1.15&&V.x<1.15&&V.y>-1.1&&V.y<1.2;el.style.display=ok?'':'none';if(!ok)continue;
  const x=(V.x*.5+.5)*W,y=(-V.y*.5+.5)*H,d=camera.position.distanceTo(V2.set(l.x,l.y,l.z)),s=Math.max(.6,Math.min(1.08,54/d));
  el.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-100%) scale(${(i===sel?s*1.12:s).toFixed(3)})`;el.style.zIndex=i===sel?30:Math.round(20-d/10)}
}
let fAcc=0,fN=0,autoQ=true;
function frame(now){
 raf=requestAnimationFrame(frame);
 if(!running||!inView||document.hidden){last=now;return}
 const dt=Math.min(.05,Math.max(0,(now-last)/1000));
 if(quality==='low'&&now-last<30&&now>=last)return;
 last=now;update(dt);renderer.render(scene,camera);updatePins();
 if(autoQ&&quality==='high'){fAcc+=dt;fN++;if(fN===70){if(fAcc/fN>.036){setQuality('low',true)}autoQ=false}}
}
function resize(){
 if(!wrap||!renderer)return;const w=wrap.clientWidth,h=wrap.clientHeight;if(!w||!h)return;W=w;H=h;
 dpr=Math.min(window.devicePixelRatio||1,quality==='low'?1:2);renderer.setPixelRatio(dpr);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
 if(running){update(0);renderer.render(scene,camera);updatePins()}
}
function setQuality(q,auto){
 quality=q==='low'?'low':'high';if(!auto)autoQ=false;if(!renderer)return;
 renderer.shadowMap.enabled=quality==='high';sun.castShadow=quality==='high';scene.traverse(o=>{if(o.material)o.material.needsUpdate=true});resize();
 if(auto&&opts.onQuality)opts.onQuality(quality);
}

/* ---------- Thao tác ---------- */
function bindInput(){
 let id=null,x0=0,y0=0,u0=0,az0=0,el0=0,moved=0,t0=0,lx=0,vx=0;
 canvas.addEventListener('pointerdown',e=>{if(id!==null)return;id=e.pointerId;x0=lx=e.clientX;y0=e.clientY;u0=cam.ug;az0=cam.azOff;el0=cam.elOff;moved=0;vx=0;t0=performance.now();try{canvas.setPointerCapture(id)}catch(_){}} );
 canvas.addEventListener('pointermove',e=>{if(e.pointerId!==id)return;const dx=e.clientX-x0,dy=e.clientY-y0;moved=Math.max(moved,Math.abs(dx)+Math.abs(dy));vx=e.clientX-lx;lx=e.clientX;
  if(moved<6)return;
  if(cam.mode==='map'){cam.drag=true;cam.ug=Math.max(-.3,Math.min(9.3,u0-dx/Math.max(180,W*.42)))}
  else if(cam.mode==='focus'||cam.mode==='idle'){cam.azOff=az0-dx*.006;cam.elOff=Math.max(-.25,Math.min(.75,el0+dy*.004))}});
 const up=e=>{if(e.pointerId!==id)return;id=null;try{canvas.releasePointerCapture(e.pointerId)}catch(_){}
  if(cam.mode==='map'){
   if(cam.drag){cam.drag=false;let t=Math.round(cam.ug+(Math.abs(vx)>4?-Math.sign(vx)*.35:0));select(Math.max(0,Math.min(9,t)),true)}
   else if(moved<6&&e.type==='pointerup'){const r=canvas.getBoundingClientRect(),px=e.clientX-r.left,py=e.clientY-r.top;let best=-1,bd=70;
    LM.forEach((l,i)=>{V.set(l.x,l.y+l.H*.45,l.z).project(camera);if(V.z>1)return;const d=Math.hypot((V.x*.5+.5)*W-px,(-V.y*.5+.5)*H-py);if(d<bd){bd=d;best=i}});
    if(best>=0){if(best===sel){if(opts.onEnter)opts.onEnter(best)}else select(best,true)}}
  }};
 canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);
 canvas.addEventListener('wheel',e=>{if(!wrap.classList.contains('free'))return;e.preventDefault();cam.zoom=Math.max(.62,Math.min(1.7,cam.zoom*Math.exp(e.deltaY*.0011)))},{passive:false});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();running=false});
 canvas.addEventListener('webglcontextrestored',()=>{running=!!wrap.parentNode;resize()});
}
function select(i,notify){sel=Math.max(0,Math.min(LM.length-1,+i||0));cam.ug=sel;paintPins();if(notify&&opts.onSelect)opts.onSelect(sel)}
function paintPins(){
 if(!pinsEl)return;const ps=pinsEl.children;let prog=0;
 for(let i=0;i<LM.length;i++){const s=states[i]||{},el=ps[i];if(!el)continue;if(s.open)prog=Math.max(prog,i);
  el.className='pin'+(s.open?'':' lock')+(s.cur?' cur':'')+(s.stars?' done':'')+(i===sel?' sel':'');
  el.lastChild.textContent=s.open?(s.stars?'★'.repeat(Math.min(3,Math.ceil(s.stars/3)))+' '+s.stars+'/9':''):'';}
 if(trail){const c=new T.Color(),d=trail.userData.d;for(let i=0;i<d.length;i++)trail.setColorAt(i,c.setHex(d[i][3]<=prog?0xf5d98f:0xfbf6e8));trail.instanceColor.needsUpdate=true}
}

/* ---------- API ---------- */
G.init=function(o){
 opts=o||{};reduced=!!opts.reduced;quality=opts.quality==='low'?'low':'high';autoQ=opts.quality!=='high'&&opts.quality!=='low';
 try{
  canvas=document.createElement('canvas');
  renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setClearColor(0xdfe6cf,1);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.02;
  renderer.shadowMap.enabled=quality==='high';renderer.shadowMap.type=T.PCFSoftShadowMap;
  camera=new T.PerspectiveCamera(FOV,1,.5,1600);
  wrap=document.createElement('div');wrap.className='g3d';wrap.id='g3d';canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Sa bàn 3D hành trình mười di sản xứ Thanh');
  pinsEl=document.createElement('div');pinsEl.className='g3d-pins';hudEl=document.createElement('div');hudEl.className='g3d-hud';
  wrap.append(canvas,pinsEl,hudEl);
  build();
  if(quality==='low'){renderer.shadowMap.enabled=false;sun.castShadow=false}
  pinsEl.innerHTML=LM.map((l,i)=>`<button class="pin" data-act="pin" data-v="${i}" aria-label="Chặng ${i+1}: ${l.def.n||''}"><b>${i+1}</b><span>${l.def.n||''}</span><em></em></button>`).join('');
  bindInput();
  if(window.ResizeObserver){ro=new ResizeObserver(resize);ro.observe(wrap)}else window.addEventListener('resize',resize);
  if(window.IntersectionObserver){io=new IntersectionObserver(es=>{inView=es[es.length-1].isIntersecting});io.observe(wrap)}
  jPoint(0,cam.tgt);cam.snap=true;
  G.ok=true;G.wrap=wrap;G.hud=hudEl;G.canvas=canvas;
 }catch(e){G.ok=false;G.error=e;if(window.console)console.warn('Không khởi tạo được đồ họa 3D:',e)}
 return G.ok;
};
G.mount=function(host){
 if(!G.ok)return;
 if(!host){if(wrap.parentNode)wrap.parentNode.removeChild(wrap);running=false;return}
 if(wrap.parentNode!==host){host.appendChild(wrap);inView=true}
 running=true;resize();if(!raf){last=performance.now();raf=requestAnimationFrame(frame)}
};
G.setView=function(mode,i,o){
 if(!G.ok)return;const ch=cam.mode!==mode||(mode==='focus'&&cam.i!==i);
 cam.mode=mode;if(i!=null&&mode==='focus')cam.i=i;
 if(ch){cam.azOff=0;cam.elOff=0;cam.zoom=1;cam.lift=0;if(o&&o.snap)cam.snap=true;if(mode==='fly'){cam.fly=cam.flyG=0}}
 wrap.classList.toggle('view-map',mode==='map');
};
G.setFree=function(f){if(G.ok)wrap.classList.toggle('free',!!f)};
G.select=function(i,notify){if(G.ok)select(i,notify)};
G.sel=()=>sel;
G.mode=()=>cam.mode;
G.setStates=function(s){if(!G.ok)return;states=s||[];paintPins()};
G.setMascot=function(i,walk){
 if(!G.ok||i==null||i<0||i>=LM.length)return;
 if(mas.t<1&&Math.round(mas.to)===i)return;if(mas.t>=1&&mas.i===i)return;
 if(walk&&!reduced&&mas.t>=1){mas.from=mas.i;mas.to=i;mas.t=0;mas.dur=Math.min(3.2,1.3+Math.abs(i-mas.i)*.5);mascot.userData.play('walk')}
 else{mas.i=i;mas.t=1;mascot.userData.play('idle');placeMascot()}
};
G.react=function(kind){
 if(!G.ok)return;const U=mascot.userData,p=V.copy(hero.position);p.y+=2.4;
 if(kind==='ok'){U.play('ok');qdrum.userData.b=1;burst(p,34,[0xf5d98f,0xffe9ad,0xd9a441],5,3.5)}
 else if(kind==='bad'){U.play('bad')}
 else if(kind==='drum'){qdrum.userData.b=1;const l=LM[cam.i];if(l&&l.res.hit)l.res.hit()}
 else if(kind==='win'){U.play('win');qdrum.userData.b=1;const l=LM[cam.mode==='focus'?cam.i:mas.i];
  [0,.35,.7,1.05].forEach((d,k)=>setTimeout(()=>{if(!G.ok)return;burst(new T.Vector3(l.x+(k%2?-1:1)*l.R*.35*Math.random(),l.y+l.H+2+Math.random()*2.5,l.z+(Math.random()-.5)*l.R*.5),50,[[0xf5d98f,0xfff1c4],[0xff6a5a,0xffb09f],[0x74d6a5,0xdfffee],[0xf5d98f,0xff9282]][k],7,2)},d*1000))}
};
G.flyTo=function(p){cam.flyG=sat(p)};
G.setQuality=function(q){if(G.ok)setQuality(q)};
G.quality=()=>quality;
/* Ảnh chụp mô hình để dùng làm hình đại diện (huy hiệu chặng, thẻ di sản, linh vật) */
G.thumb=function(key,w,h){
 if(!G.ok)return'';
 try{
  const cm=new T.PerspectiveCamera(30,w/h,.5,700),pv=puffs.map(g=>g.visible),hv=hero.visible,rv=ring.visible,tv=trail.visible;
  ring.visible=trail.visible=false;puffs.forEach(g=>{g.visible=false});
  let sc=scene,url;
  if(key==='voi'){
   sc=new T.Scene();sc.environment=env;sc.environmentIntensity=.6;sc.add(new T.HemisphereLight(0xffffff,0x8a7a5c,1.3));const dl=new T.DirectionalLight(0xfff1d6,2.6);dl.position.set(-2,4,5);sc.add(dl);
   const par=mascot.parent,ps=mascot.scale.x;sc.add(mascot);mascot.position.set(0,0,0);mascot.rotation.set(0,.55,0);mascot.scale.setScalar(1);mascot.userData.anim={n:'idle',t:0};mascot.userData.tick(1.2,0);
   cm.position.set(0,1.25,5.4);cm.lookAt(0,.98,0);renderer.setClearColor(0,0);
   renderer.setPixelRatio(1);renderer.setSize(w,h,false);renderer.render(sc,cm);url=canvas.toDataURL('image/png');
   par.add(mascot);par.children.unshift(par.children.pop());mascot.rotation.set(0,0,0);mascot.scale.setScalar(ps);renderer.setClearColor(0xdfe6cf,1);
  }else{
   const l=LM[key];hero.visible=false;const d=Math.max(l.H*.7/Math.tan(15*PI/180),l.R*1.02/(Math.tan(15*PI/180)*(w/h)))*1.02,az=l.face,el=.4,ce=Math.cos(el);
   cm.position.set(l.cx+Math.sin(az)*ce*d,l.y+l.H*.34+Math.sin(el)*d,l.cz+Math.cos(az)*ce*d);cm.lookAt(l.cx,l.y+l.H*.34,l.cz);
   sun.target.position.set(l.x,0,l.z);sun.position.copy(sun.target.position).add(V.set(-.45,.62,.6).multiplyScalar(140));const scm=sun.shadow.camera;scm.left=-26;scm.right=26;scm.top=26;scm.bottom=-26;scm.updateProjectionMatrix();
   scene.updateMatrixWorld(true);renderer.setPixelRatio(1);renderer.setSize(w,h,false);renderer.render(scene,cm);url=canvas.toDataURL('image/jpeg',.86);
  }
  hero.visible=hv;ring.visible=rv;trail.visible=tv;puffs.forEach((g,i)=>{g.visible=pv[i]});
  renderer.setPixelRatio(dpr);renderer.setSize(W,H,false);if(running){tickCamera(0);renderer.render(scene,camera)}
  return url;
 }catch(e){return''}
};
G.resize=resize;
G.debug=()=>({cam,LM,scene,camera,renderer,mas});
})();
