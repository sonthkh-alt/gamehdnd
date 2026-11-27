/* Bộ mô hình 3D của game "Nghị trường số" (dựng bằng mã, không dùng tệp mô hình ngoài).
   Gồm: linh vật Voi Đồng, trống đồng Đông Sơn và 10 cụm mô hình cho 10 chặng di sản xứ Thanh.
   Phong cách: khối ít mặt (low-poly), bảng màu sơn mài: đỏ son, vàng thếp, xanh đồng, ngà.
   Dùng: NTS_MODELS.build.dongson() trả về {obj, H, R, spot, face, tick}; NTS_MODELS.voi(), NTS_MODELS.drum().
   Quy ước: mặt chính của cụm mô hình quay về +z, mặt đất ở y = 0, một đơn vị xấp xỉ một sải tay của linh vật. */
(function(){
'use strict';
const T=window.THREE;if(!T)return;
const PI=Math.PI,lerp=(a,b,t)=>a+(b-a)*t;
const hash=(x,y,z,s)=>{const v=Math.sin(x*12.9898+y*78.233+z*37.719+(s||0)*4.17)*43758.5453;return v-Math.floor(v)};

/* ---------- Vật liệu dùng chung ---------- */
let MT=null;
function mats(){
 if(MT)return MT;
 const S=(c,o)=>new T.MeshStandardMaterial(Object.assign({color:c,roughness:.9,metalness:0,flatShading:true},o||{}));
 MT={
  stone:S(0xd3c19a),stoneD:S(0xa8946b),rock:S(0x7f8c80),rockD:S(0x5d6a62),pave:S(0xbfb394),
  wood:S(0x6b3f22),woodD:S(0x3d2414),woodR:S(0x8e2a1c),tile:S(0xb0452f,{side:T.DoubleSide}),tileD:S(0x74281b),
  gold:S(0xe9bb55,{metalness:.85,roughness:.32,flatShading:false}),bronze:S(0xb9853c,{metalness:.7,roughness:.42,flatShading:false}),
  patina:S(0x3f8172,{metalness:.5,roughness:.55,flatShading:false}),
  voi:S(0xd09a48,{metalness:.38,roughness:.5,flatShading:false}),voiD:S(0xb37a30,{metalness:.38,roughness:.52,flatShading:false}),
  ivory:S(0xf6eedb,{roughness:.6,flatShading:false}),white:S(0xf4f1e6),red:S(0xc0271d,{roughness:.75}),redS:S(0xc0271d,{roughness:.7,flatShading:false}),
  black:S(0x1a1613,{roughness:.6,flatShading:false}),
  grass:S(0x6aa84f),grassD:S(0x3f7d47),leaf:S(0x3d8a4a),leafD:S(0x2a6a45),leafL:S(0x8fc45a),rice:S(0x9cc552),riceY:S(0xdcc458),riceD:S(0x5fa04e),
  trunk:S(0x5e4229),sand:S(0xe7d5a2),thatch:S(0xb48d4c),bamboo:S(0xd2b473),
  steel:S(0x4b5d5c,{metalness:.5,roughness:.6}),steelL:S(0x9aa9a8,{metalness:.6,roughness:.5}),concrete:S(0xbdb9ab),asphalt:S(0x55585a),
  glass:S(0x8ec3d4,{metalness:.3,roughness:.25}),water:S(0x45aaa6,{transparent:true,opacity:.86,roughness:.18,metalness:.1,flatShading:false}),
  cRed:S(0xcf4a33),cBlue:S(0x2f6f9f),cGreen:S(0x3f8f6a),cYellow:S(0xe4b23c),cOrange:S(0xdd7a2a),hull:S(0x24415f),hullR:S(0x9c2a22),
  fire:new T.MeshBasicMaterial({color:0xffb347}),lamp:new T.MeshBasicMaterial({color:0xffe9a8})};
 MT.water.userData.noShadow=true;
 MT.drumFace=new T.MeshStandardMaterial({map:drumTex(),metalness:.62,roughness:.4});
 MT.stoneBlock=new T.MeshStandardMaterial({map:stoneTex(),roughness:.95,flatShading:true});
 return MT;
}

/* ---------- Họa tiết vẽ bằng canvas ---------- */
const BIRD='M-14,0 C-8,-4 2,-4 7,-1.5 L18,-2 L7,1.5 C2,3.5 -8,3.5 -14,0Z M-3,-2 L-9,-9 L0,-3Z M-3,2 L-9,9 L0,3Z';
function cv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
function tex(c,rep){const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;if(rep){t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(rep,rep)}return t}
/* mặt trống đồng: sao 14 cánh, vành chim Lạc, vành răng lược */
function drumCanvas(n){
 const c=cv(n,n),g=c.getContext('2d'),R=n/2;g.translate(R,R);
 const gr=g.createRadialGradient(-R*.18,-R*.2,R*.05,0,0,R);gr.addColorStop(0,'#ffe9ad');gr.addColorStop(.5,'#dba44b');gr.addColorStop(1,'#925a20');
 g.fillStyle=gr;g.beginPath();g.arc(0,0,R,0,7);g.fill();
 g.strokeStyle='#5e3610';g.fillStyle='#5e3610';g.lineCap='round';
 [.97,.89,.81,.62,.5,.36].forEach(k=>{g.lineWidth=R*.012;g.beginPath();g.arc(0,0,R*k,0,7);g.stroke()});
 g.lineWidth=R*.014;for(let i=0;i<72;i++){const a=i*PI/36;g.beginPath();g.moveTo(Math.cos(a)*R*.82,Math.sin(a)*R*.82);g.lineTo(Math.cos(a)*R*.885,Math.sin(a)*R*.885);g.stroke()}
 for(let i=0;i<48;i++){const a=i*PI/24;g.beginPath();g.arc(Math.cos(a)*R*.93,Math.sin(a)*R*.93,R*.014,0,7);g.fill()}
 for(let i=0;i<36;i++){const a=i*PI/18;g.beginPath();g.arc(Math.cos(a)*R*.43,Math.sin(a)*R*.43,R*.017,0,7);g.fill()}
 g.lineWidth=R*.01;for(let i=0;i<40;i++){const a=i*PI/20,b=a+PI/40;g.beginPath();g.moveTo(Math.cos(a)*R*.51,Math.sin(a)*R*.51);g.lineTo(Math.cos(b)*R*.61,Math.sin(b)*R*.61);g.lineTo(Math.cos(a+PI/20)*R*.51,Math.sin(a+PI/20)*R*.51);g.stroke()}
 const bird=new Path2D(BIRD);
 for(let i=0;i<6;i++){g.save();g.rotate(i*PI/3);g.translate(R*.715,0);g.rotate(PI/2);g.scale(R/105,R/105);g.fill(bird);g.restore()}
 g.fillStyle='#fff3c9';g.beginPath();for(let i=0;i<28;i++){const a=i*PI/14-PI/2,r=i%2?R*.11:R*.31;g.lineTo(Math.cos(a)*r,Math.sin(a)*r)}g.closePath();g.fill();
 g.fillStyle='#e0a94e';g.beginPath();g.arc(0,0,R*.085,0,7);g.fill();
 return c;
}
function drumTex(){return tex(drumCanvas(512))}
function stoneTex(){
 const c=cv(256,256),g=c.getContext('2d');g.fillStyle='#cdb994';g.fillRect(0,0,256,256);
 for(let r=0;r<4;r++){const off=r%2?48:0;for(let k=-1;k<3;k++){const x=k*96+off,y=r*64,v=hash(r,k,1,3);g.fillStyle=`rgba(${v>.5?255:70},${v>.5?240:50},${v>.5?200:20},${(.05+.12*hash(k,r,2,5)).toFixed(3)})`;g.fillRect(x+2,y+2,92,60)}}
 g.strokeStyle='#8f7c57';g.lineWidth=3;for(let r=0;r<=4;r++){g.beginPath();g.moveTo(0,r*64);g.lineTo(256,r*64);g.stroke();const off=r%2?48:0;for(let k=-1;k<4;k++){g.beginPath();g.moveTo(k*96+off,r*64);g.lineTo(k*96+off,r*64+64);g.stroke()}}
 return tex(c,.3);
}
function flagVNTex(){
 const c=cv(240,160),g=c.getContext('2d');g.fillStyle='#da251d';g.fillRect(0,0,240,160);
 g.fillStyle='#ffe000';g.beginPath();for(let i=0;i<10;i++){const a=i*PI/5-PI/2,r=i%2?48*.382:48;g.lineTo(120+Math.cos(a)*r,80+Math.sin(a)*r)}g.closePath();g.fill();
 return tex(c);
}
function flagHoiTex(){
 const c=cv(128,128),g=c.getContext('2d');
 ['#b8281f','#2f6fb0','#f2c94c','#f6efe0','#3f8f5a','#c0271d'].forEach((col,i)=>{g.fillStyle=col;const p=i*11;g.fillRect(p,p,128-2*p,128-2*p)});
 return tex(c);
}
function textTex(s,col){
 const c=cv(512,96),g=c.getContext('2d');g.font='800 64px "Be Vietnam Pro",Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle=col||'#fff';g.fillText(s,256,52);
 return tex(c);
}

/* ---------- Dựng khối ---------- */
function mesh(g,m,x,y,z,r,s){const o=new T.Mesh(g,m);o.position.set(x||0,y||0,z||0);if(r)o.rotation.set(r[0]||0,r[1]||0,r[2]||0);if(s!=null){if(s.length)o.scale.set(s[0],s[1],s[2]);else o.scale.setScalar(s)}return o}
const box=(w,h,d,m,x,y,z,r)=>mesh(new T.BoxGeometry(w,h,d),m,x,y,z,r);
const cyl=(rt,rb,h,m,x,y,z,seg,r)=>mesh(new T.CylinderGeometry(rt,rb,h,seg||10),m,x,y,z,r);
const sph=(rad,m,x,y,z,s,ws,hs)=>mesh(new T.SphereGeometry(rad,ws||10,hs||8),m,x,y,z,null,s);
const cone=(rad,h,m,x,y,z,seg,r)=>mesh(new T.ConeGeometry(rad,h,seg||8),m,x,y,z,r);
/* hộp thu nhỏ phần đỉnh (bệ, mố cầu, lũy đất) */
function tbox(w,h,d,kx,kz,m,x,y,z,r){const g=new T.BoxGeometry(w,h,d),p=g.attributes.position;for(let i=0;i<p.count;i++)if(p.getY(i)>0){p.setX(i,p.getX(i)*kx);p.setZ(i,p.getZ(i)*kz)}g.computeVertexNormals();return mesh(g,m,x,y,z,r)}
/* khối đá, đồi: khối nhị thập diện bị xô lệch */
function rockGeo(r,seed,det){const g=new T.IcosahedronGeometry(r,det==null?1:det),p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),n=1+(hash(Math.round(x*50),Math.round(y*50),Math.round(z*50),seed)-.5)*.42;p.setXYZ(i,x*n,y*n,z*n)}g.computeVertexNormals();return g}
const rock=(r,m,x,y,z,s,seed,det)=>mesh(rockGeo(r,seed||1,det),m,x,y,z,null,s);
const dyn=o=>{o.userData.dyn=true;return o};
/* mặt phẳng nằm ngang cắt theo hình vẽ (suối, ao), mặt quay lên trời; trục y của hình vẽ thành trục z */
function flat(sh,m,y,seg){const g=new T.ShapeGeometry(sh,seg||8);g.rotateX(PI/2);const ix=g.index.array;for(let i=0;i<ix.length;i+=3){const t=ix[i+1];ix[i+1]=ix[i+2];ix[i+2]=t}g.computeVertexNormals();return mesh(g,m,0,y,0)}

/* Gộp các khối tĩnh cùng vật liệu thành một lưới để giảm số lệnh vẽ; khối đánh dấu dyn được giữ riêng để chuyển động */
function bake(root){
 root.updateMatrixWorld(true);
 const inv=new T.Matrix4().copy(root.matrixWorld).invert(),by=new Map(),keep=[];
 (function walk(o){
  if(o!==root&&o.userData.dyn){keep.push(o);return}
  if(o.isMesh){
   const mx=new T.Matrix4().multiplyMatrices(inv,o.matrixWorld);let g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();
   if(!g.attributes.normal)g.computeVertexNormals();g.applyMatrix4(mx);
   if(mx.determinant()<0){const p=g.attributes.position.array,n=g.attributes.normal.array;for(let i=0;i<p.length;i+=9)for(let k=0;k<3;k++){let t=p[i+3+k];p[i+3+k]=p[i+6+k];p[i+6+k]=t;t=n[i+3+k];n[i+3+k]=n[i+6+k];n[i+6+k]=t}}
   if(!by.has(o.material))by.set(o.material,[]);by.get(o.material).push(g);
  }
  o.children.slice().forEach(walk);
 })(root);
 const out=new T.Group();
 by.forEach((list,mat)=>{
  let n=0;list.forEach(g=>{n+=g.attributes.position.count});
  const P=new Float32Array(n*3),N=new Float32Array(n*3),U=new Float32Array(n*2);let k=0;
  list.forEach(g=>{P.set(g.attributes.position.array,k*3);N.set(g.attributes.normal.array,k*3);if(g.attributes.uv)U.set(g.attributes.uv.array,k*2);k+=g.attributes.position.count;g.dispose()});
  const G=new T.BufferGeometry();G.setAttribute('position',new T.BufferAttribute(P,3));G.setAttribute('normal',new T.BufferAttribute(N,3));G.setAttribute('uv',new T.BufferAttribute(U,2));
  const me=new T.Mesh(G,mat);me.castShadow=!mat.userData.noShadow;me.receiveShadow=true;out.add(me);
 });
 keep.forEach(o=>{const mx=new T.Matrix4().multiplyMatrices(inv,o.matrixWorld);o.removeFromParent();mx.decompose(o.position,o.quaternion,o.scale);out.add(o);o.traverse(c=>{if(c.isMesh){c.castShadow=!c.material.userData.noShadow;c.receiveShadow=true}})});
 return out;
}

/* ---------- Mái đao cong ---------- */
function roofGeo(w,d,h,o){
 o=o||{};const n=o.n||5,lift=o.lift==null?h*.3:o.lift,ridge=o.ridge==null?Math.max(.22,(w-d)*.5):o.ridge,P=[],I=[];
 for(let k=0;k<=n;k++){
  const s=k/n,e=Math.pow(s,.78),hw=lerp(w/2,ridge,e),hd=lerp(d/2,.001,e),y=h*Math.pow(s,1.55),up=lift*Math.pow(1-s,3);
  P.push(-hw,y+up,-hd, 0,y,-hd, hw,y+up,-hd, hw,y,0, hw,y+up,hd, 0,y,hd, -hw,y+up,hd, -hw,y,0);
 }
 for(let k=0;k<n;k++)for(let j=0;j<8;j++){const a=k*8+j,b=k*8+(j+1)%8,c=a+8,e=b+8;I.push(a,c,b,b,c,e)}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setIndex(I);g.computeVertexNormals();return g;
}
function roof(w,d,h,m,o){
 const g=new T.Group(),rl=(o&&o.ridge!=null)?o.ridge:Math.max(.22,(w-d)*.5);
 g.add(mesh(roofGeo(w,d,h,o),m.tile));
 g.add(box(rl*2+.3,.17,.22,m.tileD,0,h+.04,0));
 [-1,1].forEach(s=>g.add(box(.17,.36,.24,m.tileD,s*(rl+.14),h+.15,0)));
 return g;
}
/* một tòa điện: nền, hàng cột hiên, tường gỗ, một hoặc hai tầng mái */
function hall(w,d,colH,m,o){
 o=o||{};const g=new T.Group(),nx=o.nx||5,nz=o.nz||2,wood=o.wood||m.woodR,rh=o.roofH||colH*.75;
 for(let i=0;i<=nx;i++)for(let j=0;j<=nz;j++){
  if(i>0&&i<nx&&j>0&&j<nz)continue;const x=-w/2+.45+(w-.9)*i/nx,z=-d/2+.45+(d-.9)*j/nz;
  g.add(cyl(.16,.18,colH,wood,x,colH/2,z,8));g.add(cyl(.25,.28,.14,m.stone,x,.07,z,8));
 }
 if(!o.open){
  g.add(box(w-2,colH,d-2,o.wall||m.wood,0,colH/2,0));
  const nd=o.doors||3;for(let i=0;i<nd;i++)g.add(box((w-2.8)/nd*.72,colH*.74,.08,m.woodD,(i-(nd-1)/2)*(w-2.8)/nd,colH*.37,(d-2)/2+.03));
 }
 g.add(box(w-.5,.16,d-.5,m.woodD,0,colH+.02,0));
 const r=roof(w+1.7,d+1.7,rh,m,o.roof);r.position.y=colH;g.add(r);
 if(o.tier){
  const y=colH+rh*.5;g.add(box(w*.6,.75,d*.56,wood,0,y+.3,0));
  const r2=roof(w*.6+1.9,d*.56+1.9,rh*.92,m);r2.position.y=y+.68;g.add(r2);
 }
 return g;
}

/* ---------- Cây ---------- */
function tree(m,x,z,s,kind,seed){
 const g=new T.Group();s=s||1;seed=seed||x*7+z*3;
 if(kind==='palm'){
  let p=new T.Group();g.add(p);
  for(let i=0;i<4;i++){const seg=new T.Group();seg.position.y=i?.62:0;seg.rotation.z=.11;const ge=new T.CylinderGeometry(.09-i*.01,.11-i*.01,.66,6);ge.translate(0,.31,0);seg.add(new T.Mesh(ge,m.trunk));p.add(seg);p=seg}
  const top=new T.Group();top.position.y=.64;p.add(top);
  for(let i=0;i<7;i++){const pv=new T.Group();pv.rotation.y=i*2*PI/7;const lf=mesh(new T.ConeGeometry(.2,1.25,4),m.leaf,0,-.12,.6,[1.95,0,0],[1,1,.28]);pv.add(lf);top.add(pv)}
  top.add(sph(.09,m.trunk,.08,-.08,.05,null,6,5));top.add(sph(.09,m.trunk,-.07,-.1,-.04,null,6,5));
 }else if(kind==='pine'){
  g.add(cyl(.07,.1,.6,m.trunk,0,.3,0,6));g.add(cone(.62,1.2,m.leafD,0,1.05,0,7));g.add(cone(.44,1,m.leafD,0,1.7,0,7));
 }else if(kind==='banyan'){
  g.add(cyl(.34,.5,1.5,m.trunk,0,.75,0,8));g.add(cyl(.1,.14,1.3,m.trunk,.55,.65,.2,5,[0,0,.25]));g.add(cyl(.09,.12,1.2,m.trunk,-.5,.6,-.2,5,[0,0,-.3]));
  [[0,2.5,0,1.5],[1.1,2.1,.3,1.05],[-1.1,2.2,-.2,1.1],[.2,2.2,1,.95],[-.2,2.3,-1,.9],[0,3.2,0,.95]].forEach((c,i)=>g.add(rock(c[3],i%2?m.leafD:m.leaf,c[0],c[1],c[2],[1,.78,1],seed+i)));
 }else{
  g.add(cyl(.09,.13,.8,m.trunk,0,.4,0,6));g.add(rock(.72,m.leaf,0,1.25,0,[1,.9,1],seed));g.add(rock(.48,m.leafL,.25,1.72,.1,[1,.85,1],seed+3));
 }
 g.position.set(x,0,z);g.scale.setScalar(s);g.rotation.y=hash(x,z,1,2)*6;return g;
}

/* ---------- Cờ ---------- */
let TXVN=null,TXHOI=null;
function flag(m,kind,poleH,w,h,ticks){
 const g=new T.Group(),tx=kind==='vn'?(TXVN=TXVN||flagVNTex()):(TXHOI=TXHOI||flagHoiTex());
 g.add(cyl(.045,.06,poleH,m.steelL,0,poleH/2,0,6));g.add(sph(.09,m.gold,0,poleH+.05,0,null,8,6));
 const geo=new T.PlaneGeometry(w,h,8,3);geo.translate(w/2,0,0);
 const cloth=dyn(new T.Mesh(geo,new T.MeshStandardMaterial({map:tx,side:T.DoubleSide,roughness:.85})));cloth.position.set(.04,poleH-h/2-.05,0);g.add(cloth);
 const base=geo.attributes.position.array.slice(),ph=hash(poleH,w,h,7)*6;
 ticks.push(t=>{const p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=base[i*3],k=x/w;p.setZ(i,Math.sin(x*3.2-t*4.4+ph)*.16*k);p.setY(i,base[i*3+1]+Math.sin(x*2.1-t*3.1+ph)*.05*k)}p.needsUpdate=true;geo.computeVertexNormals()});
 return g;
}

/* ---------- Trống đồng Đông Sơn (cao 1, bán kính mặt 0,96) ---------- */
function drum(){
 const m=mats(),g=new T.Group();
 const pts=[[0,0],[.98,0],[.96,.05],[.8,.3],[.72,.34],[.74,.62],[.92,.7],[1.08,.84],[1.06,.93],[.96,1]].map(p=>new T.Vector2(p[0],p[1]));
 g.add(new T.Mesh(new T.LatheGeometry(pts,30),m.bronze));
 g.add(mesh(new T.CircleGeometry(.96,40),m.drumFace,0,1.002,0,[-PI/2,0,0]));
 [.34,.62].forEach(y=>g.add(mesh(new T.TorusGeometry(.745,.022,6,30),m.patina,0,y,0,[PI/2,0,0])));
 for(let i=0;i<4;i++){const a=i*PI/2+PI/4;g.add(mesh(new T.TorusGeometry(.1,.028,6,10,PI),m.bronze,Math.cos(a)*.74,.5,Math.sin(a)*.74,[0,-a+PI/2,PI/2]))}
 g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
 return g;
}

/* ---------- Linh vật Voi Đồng ---------- */
function voi(o){
 o=o||{};const m=mats(),skin=o.mat||m.voi,dark=o.mat||m.voiD,ivory=o.mat||m.ivory,red=o.mat||m.redS,gold=m.gold;
 const g=new T.Group(),core=new T.Group(),P={};g.add(core);
 core.add(sph(.62,skin,0,.98,0,[.9,.95,1.25],18,14));
 const cl=new T.Group();cl.position.set(0,.98,0);cl.scale.set(.92,.97,1.0);
 cl.add(new T.Mesh(new T.SphereGeometry(.64,18,7,0,2*PI,0,PI*.46),red));
 cl.add(mesh(new T.TorusGeometry(.635,.03,6,30),gold,0,.08,0,[PI/2,0,0]));
 cl.add(mesh(new T.TorusGeometry(.4,.02,6,24),gold,0,.5,0,[PI/2,0,0]));core.add(cl);
 P.legs=[[-.3,.5],[.3,.5],[-.3,-.52],[.3,-.52]].map(([x,z])=>{const pv=new T.Group();pv.position.set(x,.68,z);const ge=new T.CylinderGeometry(.19,.21,.68,10);ge.translate(0,-.34,0);pv.add(new T.Mesh(ge,dark));pv.add(mesh(new T.CylinderGeometry(.215,.215,.07,10),ivory,0,-.645,0));core.add(pv);return pv});
 const head=new T.Group();head.position.set(0,1.32,.78);core.add(head);P.head=head;
 head.add(sph(.43,skin,0,0,0,[1,1.05,.95],18,14));
 P.ears=[-1,1].map(s=>{const pv=new T.Group();pv.position.set(s*.34,.1,-.06);pv.add(sph(.36,dark,s*.26,-.03,0,[1,1.15,.13],12,10));pv.add(sph(.25,skin,s*.26,-.03,.035,[1,1.15,.1],12,10));head.add(pv);pv.userData.s=s;return pv});
 P.trunk=[];let par=head;const RR=[.17,.145,.12,.1,.082,.066];
 for(let i=0;i<5;i++){const len=.2,ge=new T.CylinderGeometry(RR[i],RR[i+1],len,10);ge.translate(0,-len/2,0);const seg=new T.Group();seg.add(new T.Mesh(ge,skin));seg.add(sph(RR[i+1],skin,0,-len,0,null,10,8));if(i)seg.position.set(0,-len,0);else seg.position.set(0,-.1,.36);par.add(seg);P.trunk.push(seg);par=seg}
 [-1,1].forEach(s=>head.add(mesh(new T.ConeGeometry(.055,.36,8),ivory,s*.17,-.24,.4,[2.0,0,s*-.18])));
 [-1,1].forEach(s=>{head.add(sph(.052,m.black,s*.25,.1,.32,null,8,6));head.add(sph(.018,m.white,s*.262,.122,.362,null,6,4))});
 head.add(mesh(new T.CylinderGeometry(.085,.085,.03,14),gold,0,.25,.36,[1.15,0,0]));
 const tail=new T.Group();tail.position.set(0,1.1,-.76);const tg=new T.CylinderGeometry(.03,.02,.42,6);tg.translate(0,-.21,0);tail.add(new T.Mesh(tg,dark));tail.add(sph(.045,dark,0,-.44,0,null,6,5));tail.rotation.x=.5;core.add(tail);P.tail=tail;
 g.traverse(c=>{if(c.isMesh){c.castShadow=true;c.receiveShadow=true}});
 const REST=[-.75,.22,.26,.26,.12],UP=[-2.0,-.5,-.5,-.45,-.35],U=g.userData;
 U.P=P;U.core=core;U.anim={n:'idle',t:0};U.play=n=>{U.anim={n,t:0}};
 U.tick=(time,dt)=>{
  const a=U.anim;a.t+=dt;let y=0,yaw=0,hy=0,hx=0,ch=0,wk=0;
  if(a.n==='ok'){const k=Math.min(1,a.t/.8);y=Math.sin(k*PI)*.75;ch=Math.sin(k*PI);if(k>=1)U.play('idle')}
  else if(a.n==='bad'){const k=Math.min(1,a.t/1);hy=Math.sin(k*PI*5)*.5*(1-k);hx=.28*Math.sin(k*PI);if(k>=1)U.play('idle')}
  else if(a.n==='win'){const k=Math.min(1,a.t/2.4);y=Math.abs(Math.sin(k*PI*3))*.8;yaw=k*PI*2;ch=1-Math.pow(k,6);if(k>=1)U.play('idle')}
  else if(a.n==='walk'){wk=1;y=Math.abs(Math.sin(time*9))*.1}
  core.position.y=y+Math.sin(time*2.2)*.015;core.rotation.y=yaw;
  head.rotation.y=hy;head.rotation.x=hx-ch*.4+Math.sin(time*1.3)*.035;
  P.ears.forEach(e=>{e.rotation.y=e.userData.s*(.42+.16*Math.sin(time*2.6)+ch*.45)});
  P.trunk.forEach((s,i)=>{s.rotation.x=lerp(REST[i],UP[i],ch)+Math.sin(time*1.7+i*.7)*.07;s.rotation.z=Math.sin(time*1.1+i*.5)*.05*(i+1)*.5});
  P.legs.forEach((l,i)=>{l.rotation.x=wk*Math.sin(time*9+((i===0||i===3)?0:PI))*.55});
  P.tail.rotation.z=Math.sin(time*4)*.35;
 };
 return g;
}

/* ---------- 10 cụm mô hình ---------- */
const build={};

/* 1. Đông Sơn: trống đồng lớn trên giá gỗ sơn son, sân đá tròn, cờ hội */
build.dongson=function(){
 const m=mats(),g=new T.Group(),ticks=[];
 g.add(cyl(5.2,5.5,.36,m.stone,0,.18,0,28));g.add(cyl(4.1,4.3,.3,m.pave,0,.5,0,28));
 const d=dyn(drum());d.scale.setScalar(2.5);d.rotation.x=.96;d.position.set(0,2.72,-.5);g.add(d);
 [-1,1].forEach(s=>{
  g.add(box(.3,3.6,.3,m.woodR,s*2.5,2.3,-1.9,[.3,0,0]));g.add(box(.3,2.3,.3,m.woodR,s*2.5,1.7,.95,[-.62,0,0]));
  g.add(box(.36,.3,4.4,m.woodR,s*2.5,.75,-.6));g.add(sph(.2,m.gold,s*2.5,4.08,-2.44,null,8,6));
 });
 g.add(box(5.4,.26,.26,m.woodR,0,1.15,1.3));g.add(box(5.4,.26,.26,m.woodR,0,3.0,-2.12));
 g.add(box(2.2,.5,1.6,m.stoneD,0,.9,-.9));
 [-1,1].forEach(s=>{const f=flag(m,'hoi',4.6,1.25,1.25,ticks);f.position.set(s*4.3,.36,1.8);g.add(f)});
 for(let i=0;i<8;i++){const a=i*PI/4+.4;g.add(cyl(.2,.24,.55,m.stoneD,Math.cos(a)*4.75,.62,Math.sin(a)*4.75,6))}
 g.add(tree(m,-5.8,-2.6,1.5,'round'));g.add(tree(m,6,-2.2,1.3,'round'));g.add(tree(m,-4.6,-4.6,1.1,'pine'));g.add(tree(m,4.4,-4.9,1.2,'pine'));
 const obj=bake(g);let beat=0;
 return{obj,H:6.6,R:7,spot:[4.2,3.6],face:.25,hit(){beat=1},tick(t,dt){ticks.forEach(f=>f(t));beat=Math.max(0,beat-dt*3);const s=2.5*(1+Math.sin(beat*PI)*.05);d.scale.setScalar(s)}};
};

/* 2. Hàm Rồng: cầu giàn thép hai nhịp qua sông Mã, núi Rồng và dòng chữ QUYẾT THẮNG, đoàn tàu qua cầu */
build.hamrong=function(){
 const m=mats(),g=new T.Group(),L=15,Y=2.5,W=1.9;
 g.add(tbox(2.8,4.4,1.5,.8,.8,m.stoneBlock,0,.3,0));
 [-1,1].forEach(s=>{
  g.add(tbox(3.6,4.2,2.4,.85,.85,m.stoneBlock,0,.4,s*(L/2+.9)));
  g.add(box(2.3,.3,6.4,m.asphalt,0,Y-.92,s*(L/2+5),[s*.26,0,0]));g.add(tbox(3.4,2,6.4,.7,1,m.grassD,0,.7,s*(L/2+5.2)));
 });
 g.add(box(W,.2,L+.4,m.steel,0,Y,0));
 [-.22,.22].forEach(x=>g.add(box(.05,.05,L+10,m.steelL,x,Y+.13,0)));
 [-1,1].forEach(sx=>{
  const x=sx*W/2;g.add(box(.12,.14,L,m.steel,x,Y+.05,0));
  [-1,1].forEach(sz=>{
   const z0=sz*.35,z1=sz*(L/2-.2),n=5,dz=(z1-z0)/n,h=1.9;
   g.add(box(.12,.14,Math.abs(z1-z0)-Math.abs(dz)*1.2,m.steel,x,Y+h,(z0+z1)/2));
   for(let i=0;i<=n;i++){const z=z0+dz*i,end=i===0||i===n;if(!end)g.add(box(.08,h,.08,m.steel,x,Y+h/2,z));
    if(i<n){const up=(i%2===0),zc=z+dz/2,len=Math.hypot(dz,h),ang=Math.atan2(Math.abs(dz),h)*(up?1:-1)*sz;g.add(box(.08,len,.08,m.steel,x,Y+h/2,zc,[ang,0,0]))}}
  });
 });
 for(let i=-4;i<=4;i++)if(i)g.add(box(W,.07,.07,m.steel,0,Y+1.9,i*1.55));
 /* núi Rồng bên bờ bắc, núi Ngọc bên bờ nam */
 [[-13,-9,3.6,1],[-9.5,-9.5,4.4,2],[-5.5,-9.2,3.4,3],[-16.5,-8,2.6,4],[-2.6,-10,2.2,5]].forEach(c=>g.add(rock(c[2],m.grassD,c[0],.4,c[1],[1.15,.8,.9],c[3])));
 g.add(rock(2.6,m.leaf,-8.5,.5,9.5,[1,.9,1],9));g.add(rock(1.5,m.rock,-11,.3,7.6,[1,.7,1],4));
 const tm=new T.MeshBasicMaterial({map:textTex('QUYẾT THẮNG','#fffdf2'),transparent:true,depthWrite:false});tm.userData.noShadow=true;
 g.add(mesh(new T.PlaneGeometry(7.4,1.4),tm,-9.3,3.1,-5.55,[-.5,.42,0]));
 for(let i=0;i<5;i++)g.add(tree(m,-15+i*3.1,-6.2+hash(i,1,1,1),.9+hash(i,2,2,2)*.5,i%2?'round':'pine'));
 g.add(tree(m,5.5,10,1.3,'round'));g.add(tree(m,7.5,-10.5,1.2,'round'));g.add(tree(m,-4.5,11,1.1,'pine'));
 /* đoàn tàu */
 const tr=dyn(new T.Group());
 tr.add(box(.62,.6,1.5,m.cGreen,0,.42,0));tr.add(box(.56,.34,.6,m.cGreen,0,.86,-.38));tr.add(cyl(.12,.14,.4,m.black,0,.9,.4,8));tr.add(box(.66,.12,1.6,m.cYellow,0,.14,0));
 [-1.75,-3.4].forEach((z,i)=>{tr.add(box(.6,.62,1.45,i?m.cRed:m.cBlue,0,.45,z));tr.add(box(.64,.08,1.5,m.ivory,0,.8,z))});
 tr.position.y=Y+.12;g.add(tr);
 const obj=bake(g);
 return{obj,H:5.2,R:9.5,spot:[5.2,10.2],face:.95,pads:[{x:0,z:13,r:5.5,h:.75},{x:0,z:-13,r:5.5,h:.75},{x:-10,z:-9,r:8,h:.5}],
  tick(t){const z=-17+((t*2.1)%46);tr.position.z=z;tr.visible=z>-13&&z<16}};
};

/* 3. Thành nhà Hồ: cổng Nam ba vòm cuốn bằng đá khối */
build.thanhho=function(){
 const m=mats(),g=new T.Group(),ticks=[],Wd=19,H=5.4,D=4.2;
 const sh=new T.Shape();sh.moveTo(-Wd/2,0);sh.lineTo(-Wd/2+.35,H);sh.lineTo(Wd/2-.35,H);sh.lineTo(Wd/2,0);
 [[5.2,2.9,3.7],[0,3.5,4.4],[-5.2,2.9,3.7]].forEach(([cx,w,h])=>{sh.lineTo(cx+w/2,0);sh.lineTo(cx+w/2,h-w/2);sh.absarc(cx,h-w/2,w/2,0,PI,false);sh.lineTo(cx-w/2,0)});
 sh.closePath();
 const wg=new T.ExtrudeGeometry(sh,{depth:D,bevelEnabled:false,curveSegments:7});wg.translate(0,0,-D/2);g.add(mesh(wg,m.stoneBlock));
 g.add(box(Wd-1.2,.14,D-.5,m.grass,0,H+.07,0));
 [[-7,.5,.9],[-3.2,.36,.7],[1.6,.55,1.1],[5.6,.4,.8],[8.2,.5,.7],[-8.6,.34,.6]].forEach((b,i)=>g.add(box(b[2]*1.5,b[1],1.1,m.stone,b[0],H+b[1]/2,(i%2?-1:1)*1.2)));
 [-1,1].forEach(s=>{g.add(tbox(9,3.6,6.4,.86,.6,m.grassD,s*(Wd/2+4.2),1.8,0));g.add(tbox(7,2.2,5.6,.8,.55,m.grass,s*(Wd/2+11.5),1.1,0))});
 g.add(box(3.2,.08,17,m.pave,0,.04,4.5));g.add(box(2.6,.08,4.4,m.pave,5.2,.04,.3));g.add(box(2.6,.08,4.4,m.pave,-5.2,.04,.3));
 [[-7.5,7.5,6.4,5,m.rice],[7.6,7.2,6,4.6,m.riceY],[-7.2,12.6,5.6,4,m.riceY],[7.8,12.4,6.2,4.4,m.rice]].forEach(p=>{g.add(box(p[2],.07,p[3],p[4],p[0],.04,p[1]));g.add(box(p[2]+.3,.05,p[3]+.3,m.riceD,p[0],.02,p[1]))});
 [-1,1].forEach(s=>{const f=flag(m,'hoi',3.6,1,1,ticks);f.position.set(s*2.4,0,3.4);g.add(f);g.add(rock(.5,m.stone,s*3.1,.2,9.5,[1.3,.6,1],s+3))});
 const fv=flag(m,'vn',2.6,1.35,.9,ticks);fv.position.set(0,H,0);g.add(fv);
 g.add(tree(m,-12.5,3.4,1.3,'round'));g.add(tree(m,12.8,3,1.4,'round'));g.add(tree(m,-11,-4.5,1.2,'round'));g.add(tree(m,11.4,-4.6,1.3,'round'));g.add(tree(m,2.8,H*.999,.7,'round'));
 g.children[g.children.length-1].position.set(6.8,H,-.6);
 const obj=bake(g);
 return{obj,H:8.3,R:11.5,spot:[3.3,7.2],face:.3,tick(t){ticks.forEach(f=>f(t))}};
};

/* 4. Lam Kinh: chính điện hai tầng mái, Ngọ môn, nhà bia Vĩnh Lăng, cây đa cổ */
build.lamkinh=function(){
 const m=mats(),g=new T.Group(),ticks=[];
 g.add(tbox(15,.9,10.6,.96,.95,m.stone,0,.45,-1));g.add(box(13.6,.1,9.4,m.pave,0,.92,-1));
 [0,1,2].forEach(i=>g.add(box(4.2,.3,.5,m.stoneD,0,.75-i*.3,4.45+i*.45)));
 [-1,1].forEach(s=>g.add(box(.3,.5,1.7,m.stone,s*2.3,.6,4.9,[.55,0,0])));
 const h=hall(12,7.6,2.5,m,{nx:6,nz:3,tier:true,roofH:1.9,doors:5});h.position.set(0,.95,-1.2);g.add(h);
 g.add(box(12,.1,6.4,m.pave,0,.05,8.6));
 g.add(tbox(7.4,.36,3.2,.97,.94,m.stone,0,.18,13));
 const gate=hall(6.6,2.6,1.9,m,{nx:3,nz:1,roofH:1.25,open:true});gate.position.set(0,.36,13);g.add(gate);
 [-1,1].forEach(s=>{g.add(box(4.6,1.5,.5,m.stone,s*6,.75,13));g.add(box(4.9,.2,.8,m.tileD,s*6,1.6,13))});
 /* nhà bia */
 const bx=-9.6,bz=7.4;g.add(tbox(3.6,.5,3.6,.94,.94,m.stone,bx,.25,bz));
 [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>g.add(cyl(.14,.16,1.9,m.woodR,bx+a*1.25,1.45,bz+b*1.25,8)));
 const r1=roof(4.6,4.6,1.1,m,{ridge:.5});r1.position.set(bx,2.4,bz);g.add(r1);
 g.add(sph(.5,m.stoneD,bx,.72,bz,[1.1,.5,1.5],8,6));g.add(box(.9,1.5,.24,m.stoneD,bx,1.6,bz));
 g.add(tree(m,-11.5,-1.5,1.8,'banyan'));
 g.add(tree(m,-10.5,-7.5,1.4,'pine'));g.add(tree(m,10.6,-4,1.5,'pine'));g.add(tree(m,-7,-8.6,1.2,'pine'));g.add(tree(m,8.4,-6.8,1.3,'pine'));g.add(tree(m,0,-8,1.6,'pine'));g.add(tree(m,-11,13,1.2,'round'));g.add(tree(m,11,12.6,1.2,'round'));
 [-1,1].forEach(s=>{const f=flag(m,'hoi',3.8,1.05,1.05,ticks);f.position.set(s*7,0,4.4);g.add(f)});
 /* giếng Ngọc */
 g.add(cyl(1.5,1.6,.3,m.stone,9.4,.15,13.8,14));g.add(mesh(new T.CircleGeometry(1.25,14),m.water,9.4,.32,13.8,[-PI/2,0,0]));
 const obj=bake(g);
 return{obj,H:8.2,R:13,c:[0,4.5],spot:[4.6,7.6],face:.42,tick(t){ticks.forEach(f=>f(t))}};
};

/* 5. Đền Bà Triệu: nghi môn tứ trụ, tượng Bà Triệu cưỡi voi thếp vàng, hồ bán nguyệt, đền chính */
build.batrieu=function(){
 const m=mats(),g=new T.Group(),ticks=[];
 g.add(tbox(11.5,.7,7,.95,.93,m.stone,0,.35,-6.2));
 const h=hall(9.6,5,2.3,m,{nx:4,nz:2,roofH:2,doors:3});h.position.set(0,.7,-6.2);g.add(h);
 [0,1].forEach(i=>g.add(box(3.6,.3,.5,m.stoneD,0,.5-i*.3,-2.4+i*.45)));
 g.add(box(9,.08,6,m.pave,0,.04,1));
 /* tượng trên bệ */
 g.add(tbox(4.2,1.7,5.2,.86,.88,m.stoneBlock,0,.85,.6));g.add(box(3.9,.2,4.9,m.stoneD,0,1.78,.6));
 const st=voi({mat:m.gold});st.scale.setScalar(1.55);st.position.set(0,1.88,.3);st.userData.tick(0,0);g.add(st);
 const rd=new T.Group();rd.position.set(0,1.88+1.54*1.55,.15);rd.scale.setScalar(1.3);
 rd.add(box(.8,.14,1,m.gold,0,.02,0));rd.add(cone(.34,.9,m.gold,0,.5,0,8));rd.add(sph(.2,m.gold,0,1.08,0,null,8,6));rd.add(sph(.11,m.gold,0,1.28,-.04,null,6,5));
 rd.add(cyl(.05,.06,.75,m.gold,.36,.98,.12,6,[0,0,-.75]));rd.add(box(.05,1.15,.1,m.gold,.66,1.78,.12));rd.add(box(.26,.05,.14,m.gold,.66,1.22,.12));
 rd.add(cyl(.05,.06,.6,m.gold,-.28,.72,.26,6,[1.1,0,.3]));g.add(rd);
 /* nghi môn tứ trụ */
 [[-4.6,3.4],[-1.9,4.6],[1.9,4.6],[4.6,3.4]].forEach(([x,hh])=>{
  g.add(tbox(.8,.5,.8,.9,.9,m.stoneD,x,.25,6.6));g.add(box(.56,hh,.56,m.ivory,x,hh/2+.4,6.6));g.add(box(.44,hh*.55,.06,m.red,x,hh*.5+.4,6.9));
  g.add(box(.8,.22,.8,m.stoneD,x,hh+.5,6.6));g.add(box(.5,.5,.5,m.red,x,hh+.86,6.6));g.add(cone(.42,.5,m.gold,x,hh+1.36,6.6,4,[0,PI/4,0]));
 });
 g.add(box(3.8,.3,.3,m.ivory,0,4.05,6.6));
 /* hồ bán nguyệt */
 g.add(mesh(new T.CylinderGeometry(3.3,3.4,.3,18,1,false,-PI/2,PI),m.stone,0,.15,8.2));
 g.add(mesh(new T.CircleGeometry(2.9,18,PI,PI),m.water,0,.31,8.3,[-PI/2,0,0]));
 [[-1,10],[.9,9.4],[1.8,10.2],[-1.9,9.2]].forEach(([x,z],i)=>{g.add(mesh(new T.CircleGeometry(.3,7),m.leaf,x,.33,z,[-PI/2,0,i]));if(i%2===0)g.add(cone(.1,.24,m.cRed,x+.1,.44,z,6))});
 [-1,1].forEach(s=>{const f=flag(m,'hoi',4,1.1,1.1,ticks);f.position.set(s*6.4,0,3.4);g.add(f)});
 /* núi Gai phía sau */
 [[-5,-11.5,3.6,1],[1,-12.5,4.6,2],[6.4,-11,3.2,3]].forEach(c=>g.add(rock(c[2],m.grassD,c[0],.2,c[1],[1.2,.85,.9],c[3])));
 g.add(tree(m,-7.6,-4.6,1.4,'round'));g.add(tree(m,7.8,-4.4,1.5,'round'));g.add(tree(m,-7.4,7,1.2,'pine'));g.add(tree(m,10,-2.6,1.3,'pine'));g.add(tree(m,-9,0,1.2,'round'));g.add(tree(m,9.2,.6,1.1,'round'));
 const obj=bake(g);
 return{obj,H:7.6,R:10.5,spot:[4.4,4.2],face:.35,tick(t){ticks.forEach(f=>f(t))}};
};

/* 6. Sầm Sơn: hòn Trống Mái trên núi Trường Lệ, bãi cát, ô che nắng, bè mảng buồm nâu (hướng +x là biển) */
build.samson=function(o){
 const m=mats(),g=new T.Group(),wl=(o&&o.wl)||-.7,boats=[];
 g.add(mesh(new T.CylinderGeometry(7.4,8.4,.5,22),m.sand,-1,-.2,.4,null,[1,1,1.25]));
 /* núi Trường Lệ và hòn Trống Mái */
 [[-5.2,-6.4,3.4,1],[-1.6,-7.4,2.8,2],[-8.2,-4.4,2.4,3]].forEach(c=>g.add(rock(c[2],c[3]===2?m.rock:m.grassD,c[0],.1,c[1],[1.2,.8,1],c[3])));
 g.add(rock(1.5,m.rock,-4.4,2.9,-6,[1.5,.42,1.2],5));g.add(rock(1.15,m.rockD,-4.3,3.9,-6,[1.25,.8,.9],6));g.add(rock(.75,m.rock,-2.9,3.6,-5.6,[.7,1.15,.7],7));
 /* đền Độc Cước nhỏ trên sườn núi */
 const dc=hall(2.6,1.8,.9,m,{nx:2,nz:1,roofH:.8});dc.position.set(-7.6,1.9,-3.6);g.add(dc);g.add(box(3.2,.3,2.4,m.stone,-7.6,1.75,-3.6));
 /* ô, ghế */
 const cols=[m.cRed,m.cYellow,m.cBlue,m.cOrange,m.ivory,m.cGreen];
 [[.6,-1.6],[1.6,1.2],[.2,3.6],[1.5,5.6],[-.9,7],[2.4,-3.6]].forEach(([x,z],i)=>{g.add(cyl(.04,.04,1.3,m.steelL,x,.65,z,5));g.add(cone(.95,.42,cols[i],x,1.42,z,8));g.add(box(.5,.1,1,m.ivory,x+.7,.16,z+.2,[0,.3,0]))});
 [[-3.4,2.2,1.5],[-4.6,5.2,1.7],[-2.6,7.4,1.4],[-5.6,-.4,1.6],[-6.4,3.4,1.3]].forEach(c=>g.add(tree(m,c[0],c[1],c[2],'palm')));
 /* thuyền mảng buồm nâu */
 [[6.8,-1.5,.3],[9.6,4.6,-.4],[12.5,-4.5,.7]].forEach(([x,z,ry],i)=>{
  const b=dyn(new T.Group());
  for(let k=-2;k<=2;k++)b.add(cyl(.12,.12,2.6,m.bamboo,k*.25,.1,0,6,[PI/2,0,0]));
  b.add(box(1.4,.08,.12,m.wood,0,.24,.9));b.add(box(1.4,.08,.12,m.wood,0,.24,-.9));b.add(cyl(.045,.055,2.5,m.wood,0,1.35,.2,5));
  const sg=new T.BufferGeometry();sg.setAttribute('position',new T.Float32BufferAttribute([0,.5,.25,0,2.6,.25,0,.6,-1.5, 0,.5,.25,0,.6,-1.5,0,2.6,.25],3));sg.computeVertexNormals();
  b.add(new T.Mesh(sg,i===1?m.ivory:m.wood));b.position.set(x,wl,z);b.rotation.y=ry;g.add(b);boats.push(b);
 });
 const obj=bake(g);
 return{obj,H:6,R:10.5,spot:[-1.4,4.6],face:.75,
  tick(t){boats.forEach((b,i)=>{b.position.y=wl+Math.sin(t*1.3+i*2)*.07;b.rotation.z=Math.sin(t*1.1+i)*.05;b.rotation.x=Math.sin(t*.9+i*1.7)*.04})}};
};

/* 7. Pù Luông: ruộng bậc thang, nhà sàn người Thái, cọn nước quay bên suối */
build.puluong=function(){
 const m=mats(),g=new T.Group();
 /* ruộng bậc thang */
 const lv=[m.riceD,m.rice,m.riceY,m.rice,m.riceD,m.riceY,m.rice];
 for(let k=0;k<7;k++){const r=7.4-k*.95,ge=new T.CylinderGeometry(r,r+.18,.55,13),p=ge.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),a=Math.atan2(z,x),n=1+.14*Math.sin(a*3+k*1.3)+.07*Math.sin(a*5+k);p.setX(i,x*n);p.setZ(i,z*n)}ge.computeVertexNormals();
  g.add(mesh(ge,lv[k],-3.2-k*.42,.27+k*.55,-3.6-k*.5));
  g.add(mesh(ge.clone(),m.thatch,-3.2-k*.42,.2+k*.55,-3.6-k*.5,null,[1.025,.82,1.025]));}
 g.add(tree(m,-6.3,-7.3,1.2,'round'));g.children[g.children.length-1].position.y=3.9;
 /* nhà sàn */
 const hs=new T.Group();hs.position.set(5,0,1.6);hs.rotation.y=-.35;
 for(let i=0;i<4;i++)for(let j=0;j<3;j++)hs.add(cyl(.09,.1,1.3,m.wood,-1.8+i*1.2,.65,-1.1+j*1.1,6));
 hs.add(box(4.2,.16,2.8,m.bamboo,0,1.36,0));hs.add(box(3.9,1.25,2.5,m.bamboo,0,2.05,0));hs.add(box(.7,.9,.06,m.woodD,-.6,1.95,1.27));hs.add(box(.6,.5,.06,m.woodD,1,2.2,1.27));
 hs.add(box(1.5,.1,.9,m.bamboo,-2.75,1.36,.5));
 const pr=new T.Shape();pr.moveTo(-2,0);pr.lineTo(0,1.65);pr.lineTo(2,0);pr.closePath();
 const rg=new T.ExtrudeGeometry(pr,{depth:5.2,bevelEnabled:false});rg.translate(0,0,-2.6);hs.add(mesh(rg,m.thatch,0,2.62,0,[0,PI/2,0]));
 hs.add(box(.5,.08,2.1,m.wood,-2.75,.68,1.6,[.68,0,0]));
 g.add(hs);
 /* suối và cọn nước */
 const sp=new T.Shape();sp.moveTo(-9,5.6);sp.bezierCurveTo(-4,4.2,-2,7.4,3,6.6);sp.bezierCurveTo(6,6.1,8,7.6,10,7.2);sp.lineTo(10,8.9);sp.bezierCurveTo(7,9.4,6,7.9,3,8.4);sp.bezierCurveTo(-2,9.2,-4,6.2,-9,7.4);sp.closePath();
 g.add(flat(sp,m.water,.07));
 [[-6,5.4,.5],[-2.6,7.8,.42],[1.2,5.9,.4],[6.4,8.9,.5],[8.4,6.5,.36]].forEach((c,i)=>g.add(rock(c[2],m.rock,c[0],.12,c[1],[1.2,.7,1],i+2)));
 const wh=dyn(new T.Group()),R=1.55;
 [-.28,.28].forEach(z=>wh.add(mesh(new T.TorusGeometry(R,.05,5,20),m.bamboo,0,0,z)));
 for(let i=0;i<10;i++){const a=i*PI/5;wh.add(box(.05,R*2,.05,m.bamboo,0,0,0,[0,0,a]));wh.add(box(.34,.06,.6,m.wood,Math.cos(a)*R,Math.sin(a)*R,0,[0,0,a]));
  wh.add(cyl(.07,.07,.42,m.bamboo,Math.cos(a+.3)*R,Math.sin(a+.3)*R,.36,6,[0,0,a+.3]))}
 wh.add(cyl(.09,.09,1.1,m.wood,0,0,0,6,[PI/2,0,0]));wh.position.set(-.6,1.5,7.3);g.add(wh);
 [-1,1].forEach(s=>{g.add(box(.1,2,.1,m.wood,-.6-.5,.9,7.3+s*.52,[0,0,-.22]));g.add(box(.1,2,.1,m.wood,-.6+.5,.9,7.3+s*.52,[0,0,.22]))});
 g.add(box(.12,.1,3.4,m.bamboo,-.6+1.5,2.7,5.9,[.12,0,0]));g.add(box(.08,2.6,.08,m.wood,.9,1.3,4.3));
 /* trâu */
 const tr=new T.Group();tr.add(box(1.3,.62,.62,m.black,0,.62,0));tr.add(box(.46,.44,.44,m.black,.8,.86,0));[[-.45,-.2],[-.45,.2],[.45,-.2],[.45,.2]].forEach(([x,z])=>tr.add(box(.16,.4,.16,m.black,x,.2,z)));
 tr.add(mesh(new T.TorusGeometry(.26,.04,5,10,PI),m.ivory,.86,1.08,0,[0,PI/2,0]));tr.position.set(2.6,0,10.6);tr.rotation.y=.5;g.add(tr);
 g.add(tree(m,8.6,-1.8,1.5,'palm'));g.add(tree(m,2.2,-5.4,1.5,'pine'));g.add(tree(m,7.4,-4.6,1.6,'pine'));g.add(tree(m,9.6,3.4,1.2,'round'));g.add(tree(m,-9.4,2.6,1.3,'pine'));g.add(tree(m,-8,9.4,1.2,'round'));g.add(tree(m,6.6,10.6,1.3,'palm'));
 const obj=bake(g);
 return{obj,H:6.8,R:11,spot:[2.4,4.2],face:.3,tick(t){wh.rotation.z=-t*.8}};
};

/* 8. Cẩm Lương: suối cá thần chảy ra từ hang đá, cầu tre, nhà sàn người Mường */
build.camluong=function(){
 const m=mats(),g=new T.Group(),fish=[];
 /* núi đá và cửa hang */
 [[-4.6,-7.4,4.2,1],[1.6,-8.4,5,2],[6.6,-6.6,3.4,3],[-8.6,-5,2.8,4]].forEach(c=>g.add(rock(c[2],c[3]%2?m.rock:m.rockD,c[0],.6,c[1],[1.1,1.05,.85],c[3])));
 g.add(mesh(new T.CircleGeometry(1.5,10,0,PI),m.black,-1.2,.1,-4.72,[0,.12,0],[1,1.25,1]));
 g.add(rock(1.5,m.leafD,-5.4,4.2,-7,[1.2,.6,1],8));g.add(rock(1.7,m.leaf,2.4,5,-8,[1.3,.55,1],9));
 /* dòng suối */
 const sp=new T.Shape();sp.moveTo(-2.4,-4.6);sp.bezierCurveTo(-3.6,-1.6,1.6,-.4,.6,2.6);sp.bezierCurveTo(-.2,5.2,4.4,6.4,5.4,10.4);sp.lineTo(8.6,9.6);sp.bezierCurveTo(7.6,5.2,3.4,4.6,4,2.2);sp.bezierCurveTo(5,-1.6,-.4,-2,.2,-4.6);sp.closePath();
 g.add(flat(sp,m.water,.09,10));
 const sb=new T.Shape();sb.moveTo(-3.2,-4.8);sb.bezierCurveTo(-4.6,-1.4,.8,-.2,-.2,2.6);sb.bezierCurveTo(-1,5.4,3.6,6.8,4.6,10.8);sb.lineTo(9.4,9.6);sb.bezierCurveTo(8.4,4.8,4.2,4.4,4.8,2.2);sb.bezierCurveTo(5.8,-1.8,.4,-2.2,1,-4.8);sb.closePath();
 g.add(flat(sb,m.sand,.04,10));
 [[-3.4,-1.6,.7],[4.6,-1,.6],[-1.6,3.6,.55],[5.6,3.8,.6],[2.4,8.4,.5],[9.2,7,.7],[-2.6,-3.6,.6],[1.8,-3.2,.5]].forEach((c,i)=>g.add(rock(c[2],i%2?m.rock:m.stoneD,c[0],.16,c[1],[1.2,.7,1],i+11)));
 /* đàn cá */
 const path=new T.CatmullRomCurve3([new T.Vector3(-1.1,0,-3.6),new T.Vector3(.2,0,-1.2),new T.Vector3(2.4,0,1),new T.Vector3(2.2,0,3.6),new T.Vector3(4.8,0,6.4),new T.Vector3(6.6,0,9),new T.Vector3(5.2,0,6.2),new T.Vector3(2.9,0,3.2),new T.Vector3(1.4,0,.6),new T.Vector3(-.6,0,-2)],true);
 const fg=new T.SphereGeometry(.2,8,6),tg=new T.ConeGeometry(.16,.3,4),fm=[m.black,m.gold,m.cOrange,m.rockD];
 for(let i=0;i<16;i++){const f=dyn(new T.Group());f.add(mesh(fg,fm[i%4],0,0,0,null,[.42,.5,1.25]));f.add(mesh(tg,fm[i%4],0,0,-.36,[-PI/2,0,0],[.25,1,1]));f.scale.setScalar(.8+hash(i,3,1,1)*.9);g.add(f);fish.push({o:f,u:i/16,sp:.03+hash(i,1,1,1)*.025,off:(hash(i,2,2,2)-.5)*.9,jump:i%5===0})}
 /* cầu tre */
 for(let i=-3;i<=3;i++)g.add(box(1.05,.1,.7,m.bamboo,2.2+i*.86,1.15-Math.abs(i)*Math.abs(i)*.085,2.9,[0,.12,-i*.17]));
 [-1,1].forEach(s=>{g.add(box(.1,1.4,.1,m.wood,2.2+s*2.6,.5,2.9-.3));g.add(box(.1,1.4,.1,m.wood,2.2+s*2.6,.5,2.9+.3))});
 /* nhà sàn */
 const hs=new T.Group();hs.position.set(-6,0,4.8);hs.rotation.y=.5;
 for(let i=0;i<3;i++)for(let j=0;j<2;j++)hs.add(cyl(.09,.1,1.1,m.wood,-1.3+i*1.3,.55,-.8+j*1.6,6));
 hs.add(box(3.4,.14,2.4,m.bamboo,0,1.16,0));hs.add(box(3.1,1.1,2.1,m.bamboo,0,1.78,0));hs.add(box(.6,.8,.06,m.woodD,0,1.7,1.07));
 const pr=new T.Shape();pr.moveTo(-1.7,0);pr.lineTo(0,1.4);pr.lineTo(1.7,0);pr.closePath();const rg=new T.ExtrudeGeometry(pr,{depth:4.2,bevelEnabled:false});rg.translate(0,0,-2.1);hs.add(mesh(rg,m.thatch,0,2.3,0,[0,PI/2,0]));
 g.add(hs);
 g.add(tree(m,-8.6,.6,1.5,'round'));g.add(tree(m,8.6,-2.4,1.4,'pine'));g.add(tree(m,-7.4,9,1.3,'palm'));g.add(tree(m,9.6,2.6,1.3,'round'));g.add(tree(m,-3.6,9.6,1.2,'round'));g.add(tree(m,-9.6,-2.4,1.4,'pine'));g.add(tree(m,10,-5,1.2,'pine'));
 const obj=bake(g),v=new T.Vector3(),v2=new T.Vector3();
 return{obj,H:6.6,R:10.5,spot:[-2.6,6.6],face:.2,
  tick(t){fish.forEach((f,i)=>{const u=(f.u+t*f.sp)%1;path.getPointAt(u,v);path.getPointAt((u+.01)%1,v2);const dx=v2.x-v.x,dz=v2.z-v.z,l=Math.hypot(dx,dz)||1;
   let y=.02;if(f.jump){const k=(t*.45+i*.37)%1;if(k<.22)y=.02+Math.sin(k/.22*PI)*.75}
   f.o.position.set(v.x-dz/l*f.off,y,v.z+dx/l*f.off);f.o.rotation.y=Math.atan2(dx,dz)+Math.sin(t*9+i)*.18;f.o.rotation.x=y>.05?-Math.cos(((t*.45+i*.37)%1)/.22*PI)*.8:0})}};
};

/* 9. Nghi Sơn: cảng nước sâu với cần trục, tàu hàng, bãi công-ten-nơ, nhà máy lọc hóa dầu (hướng +x là biển) */
build.nghison=function(o){
 const m=mats(),g=new T.Group(),wl=(o&&o.wl)||-.7,cc=[m.cRed,m.cBlue,m.cGreen,m.cYellow,m.cOrange,m.ivory];
 g.add(box(8.6,2.6,17,m.concrete,1.4,-.86,0));g.add(box(.4,.24,17,m.cYellow,5.5,.5,0));
 for(let i=0;i<8;i++)g.add(cyl(.16,.16,.4,m.black,5.66,-.05,-7+i*2,6,[0,0,PI/2]));
 /* cần trục bờ */
 const cr=[];
 [-4.2,3.6].forEach((z,ci)=>{
  const c=new T.Group();c.position.set(3.6,.45,z);
  [[-1.4,-.9],[-1.4,.9],[1.4,-.9],[1.4,.9]].forEach(([x,zz])=>c.add(box(.22,5.2,.22,m.cRed,x,2.6,zz)));
  c.add(box(3.1,.24,.24,m.cRed,0,2.4,-.9));c.add(box(3.1,.24,.24,m.cRed,0,2.4,.9));c.add(box(.24,.24,2,m.cRed,-1.4,5.2,0));c.add(box(.24,.24,2,m.cRed,1.4,5.2,0));
  c.add(box(11.5,.34,.5,m.cRed,2.6,5.5,0));c.add(box(.26,2.4,.26,m.cRed,-.4,6.7,0));
  c.add(box(.1,5.2,.1,m.steelL,2.5,6.72,0,[0,0,1.165]));c.add(box(.1,2.6,.1,m.steelL,-1.7,6.72,0,[0,0,-.92]));
  c.add(box(1.5,.9,1.2,m.white,-1.6,5.95,0));c.add(box(.7,.5,.8,m.glass,1.2,5.05,0));
  const tro=dyn(new T.Group());tro.add(box(.6,.2,.7,m.steel,0,5.22,0));tro.add(box(.03,1,.03,m.black,0,0,0));tro.add(box(1.4,.6,.6,cc[ci+1],0,0,0));c.add(tro);cr.push(tro);
  g.add(c);
 });
 /* bãi công-ten-nơ */
 for(let i=0;i<5;i++)for(let j=0;j<3;j++){const hh=1+Math.floor(hash(i,j,3,9)*3);for(let k=0;k<hh;k++)g.add(box(1.45,.62,.64,cc[(i*3+j*5+k*7)%6],-1.6+j*.02-((i%2)*.05),.76+k*.64,-6.6+i*.74+(j-1)*4.6+(j===1?.3:0)))}
 /* tàu hàng */
 const sh=dyn(new T.Group());
 const hs=new T.Shape();hs.moveTo(-1.5,-6.5);hs.lineTo(1.5,-6.5);hs.lineTo(1.5,4.6);hs.lineTo(0,7.4);hs.lineTo(-1.5,4.6);hs.closePath();
 const hg=new T.ExtrudeGeometry(hs,{depth:1.7,bevelEnabled:false});hg.rotateX(PI/2);sh.add(mesh(hg,m.hull,0,1.25,0));
 const hg2=new T.ExtrudeGeometry(hs,{depth:.5,bevelEnabled:false});hg2.rotateX(PI/2);sh.add(mesh(hg2,m.hullR,0,-.2,0,null,[.985,1,.99]));
 sh.add(box(2.6,1.8,1.7,m.white,0,2.15,-5.3));sh.add(box(2.9,.5,1.2,m.glass,0,3.2,-5.2));sh.add(cyl(.34,.4,1,m.cRed,0,3.8,-5.7,8));
 for(let i=0;i<5;i++)for(let j=0;j<2;j++){const hh=1+Math.floor(hash(i,j,5,4)*2.6);for(let k=0;k<hh;k++)sh.add(box(1.2,.62,1.5,cc[(i*2+j*3+k)%6],(j-.5)*1.32,1.58+k*.64,-3.6+i*1.62))}
 sh.position.set(7.6,wl,-.6);g.add(sh);
 /* nhà máy lọc hóa dầu */
 [[-6.2,-6.4,1.7,1.8],[-6.6,-2.6,1.4,2.2],[-9.4,-5,1.3,1.6]].forEach(([x,z,r,h])=>{g.add(cyl(r,r,h,m.white,x,h/2,z,16));g.add(cyl(r*.2,r,.4,m.steelL,x,h+.2,z,16))});
 g.add(box(3.6,1.4,2.2,m.concrete,-6.4,.7,2.8));g.add(box(3.2,.1,.1,m.steelL,-6.4,2,1.2));g.add(box(.1,.1,6,m.steelL,-4.8,2,-1.6));g.add(box(.1,2,.1,m.steelL,-4.8,1,-4.5));g.add(box(.1,2,.1,m.steelL,-4.8,1,1.2));
 [[-8.4,1,6.4],[-9.4,3.2,5.2],[-7.4,5,7.2]].forEach(([x,z,h],i)=>{g.add(cyl(.2,.3,h,m.concrete,x,h/2,z,8));g.add(cyl(.215,.25,h*.14,m.cRed,x,h*.9,z,8));g.add(cyl(.24,.28,h*.14,m.cRed,x,h*.62,z,8))});
 const fl=dyn(mesh(new T.ConeGeometry(.3,.9,6),m.fire,-7.4,7.7,5));g.add(fl);
 g.add(tree(m,-3.4,7.6,1.3,'palm'));g.add(tree(m,-4.4,-8.6,1.3,'palm'));g.add(tree(m,-10.4,7.4,1.3,'round'));
 const obj=bake(g);
 return{obj,H:8.2,R:11.5,spot:[-2.2,5.4],face:.85,
  tick(t){sh.position.y=wl+Math.sin(t*.8)*.05;sh.rotation.z=Math.sin(t*.6)*.012;fl.scale.set(1+Math.sin(t*13)*.18,1+Math.sin(t*17+1)*.28,1+Math.sin(t*11)*.18);
   cr.forEach((tr,i)=>{const k=(Math.sin(t*.35+i*2.2)+1)/2;tr.position.x=.8+k*4.6;tr.children[1].scale.y=1+k*1.6;tr.children[1].position.y=5.1-.5*(1+k*1.6);tr.children[2].position.y=4.8-(1+k*1.6)})}};
};

/* 10. Hạc Thành: tượng hạc đứng trên lưng rùa thếp vàng, nhà nghị trường treo quốc kỳ, phố phường */
build.hacthanh=function(){
 const m=mats(),g=new T.Group(),ticks=[];
 g.add(cyl(8.4,8.7,.3,m.pave,0,.15,1,30));g.add(cyl(3,3.2,.3,m.stone,0,.45,3.6,20));
 /* nhà nghị trường */
 g.add(tbox(14,.9,6.6,.97,.95,m.stone,0,.45,-5.6));[0,1,2].forEach(i=>g.add(box(8,.3,.5,m.stoneD,0,.75-i*.3,-2.1+i*.45)));
 g.add(box(12.6,3.6,5,m.ivory,0,2.7,-5.9));
 for(let i=0;i<8;i++)g.add(cyl(.24,.27,3.3,m.white,-5.25+i*1.5,2.55,-3,10));
 g.add(box(13.4,.5,6.2,m.stone,0,4.45,-5.6));
 const pd=new T.Shape();pd.moveTo(-6.4,0);pd.lineTo(0,1.5);pd.lineTo(6.4,0);pd.closePath();const pg=new T.ExtrudeGeometry(pd,{depth:5.8,bevelEnabled:false});pg.translate(0,0,-2.9);g.add(mesh(pg,m.tile,0,4.7,-5.6));
 g.add(mesh(new T.CircleGeometry(.62,20),m.drumFace,0,5.22,-2.68));
 for(let i=0;i<5;i++)g.add(box(1,1.9,.08,m.woodD,-3+i*1.5,2,-3.38));
 const fv=flag(m,'vn',3.4,1.8,1.2,ticks);fv.position.set(0,6.2,-5.6);g.add(fv);
 /* hạc trên lưng rùa */
 const s=new T.Group(),G=m.gold;s.position.set(0,.6,3.6);
 s.add(cyl(1.5,1.7,.5,m.stoneBlock,0,.25,0,12));for(let i=0;i<12;i++){const a=i*PI/6;s.add(mesh(new T.SphereGeometry(.34,6,5),m.cRed,Math.cos(a)*1.45,.6,Math.sin(a)*1.45,null,[.8,.9,.5]));s.children[s.children.length-1].rotation.y=-a+PI/2}
 s.add(sph(.95,G,0,1.02,0,[1.05,.5,1.3],12,8));s.add(sph(.26,G,0,.98,1.42,[.9,.8,1.2],8,6));s.add(cyl(.14,.18,.4,G,0,.95,1.12,6,[PI/2,0,0]));
 [[-.85,.75],[.85,.75],[-.85,-.75],[.85,-.75]].forEach(([x,z])=>s.add(sph(.25,G,x,.74,z,[1.2,.55,1],6,5)));s.add(cone(.12,.4,G,0,.86,-1.36,5,[-1.9,0,0]));
 [-.14,.14].forEach(x=>s.add(cyl(.035,.04,1.5,G,x,2.2,-.05,5)));
 s.add(sph(.44,G,0,3.2,-.05,[.72,.8,1.3],10,8));s.add(mesh(new T.ConeGeometry(.2,.9,5),G,0,2.86,-.86,[-2.1,0,0],[1,1,.35]));
 [-1,1].forEach(k=>s.add(sph(.4,G,k*.3,3.24,-.14,[.2,.62,1.25],8,6)));
 s.add(mesh(new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(0,3.4,.42),new T.Vector3(0,3.9,.74),new T.Vector3(0,4.4,.6),new T.Vector3(0,4.78,.72)]),10,.075,7,false),G));
 s.add(sph(.15,G,0,4.84,.78,[.9,.9,1.15],8,6));s.add(mesh(new T.ConeGeometry(.055,.62,6),G,0,4.76,1.2,[1.72,0,0]));s.add(sph(.07,m.cRed,0,4.97,.72,null,6,5));
 g.add(s);
 /* phố phường */
 [[-10.6,-3,2.2,5.4,2.2,m.glass],[-10.2,1.2,2,3.6,2,m.ivory],[10.4,-3.2,2.4,6.6,2.2,m.glass],[10.6,1,2,4.2,2.2,m.concrete],[-12.6,-.6,1.6,2.6,1.8,m.cOrange],[12.8,-.4,1.6,3,1.8,m.ivory]].forEach(([x,z,w,h,d,mm])=>{
  g.add(box(w,h,d,mm,x,h/2,z));g.add(box(w+.16,.14,d+.16,m.stoneD,x,h+.07,z));for(let k=1;k<h/1.1;k++)g.add(box(w+.04,.06,d+.04,m.steelL,x,k*1.1,z))});
 [-1,1].forEach(k=>{const f=flag(m,'hoi',3.8,1.05,1.05,ticks);f.position.set(k*5.6,.3,5.4);g.add(f);g.add(tree(m,k*7.2,3,1.4,'round'));g.add(tree(m,k*8.2,-6.6,1.5,'round'));g.add(tree(m,k*7.6,6.4,1.1,'palm'))});
 [-3.4,3.4].forEach(x=>{g.add(cyl(.05,.06,2.2,m.steel,x,1.4,6.6,5));g.add(sph(.18,m.lamp,x,2.6,6.6,null,8,6))});
 const obj=bake(g);
 return{obj,H:9.4,R:12,spot:[4.2,5.6],face:.3,tick(t){ticks.forEach(f=>f(t))}};
};

window.NTS_MODELS={mats,drum,voi,build,bake,tree,rock,rockGeo,flag,box,cyl,sph,cone,mesh,roof,drumCanvas,hash};
})();
