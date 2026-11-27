# Nhạc nền tổng hợp cho phim giới thiệu: trống hội + đàn dây gảy (Karplus-Strong) trên thang ngũ cung. Giai điệu tự soạn.
import numpy as np, wave, sys
SR=44100; DUR=float(sys.argv[1]) if len(sys.argv)>1 else 46.0
N=int(SR*DUR); out=np.zeros(N+SR*3)
rng=np.random.default_rng(7)
def add(sig,t,g=1.0):
    i=int(t*SR); out[i:i+len(sig)]+=sig[:max(0,len(out)-i)]*g
def drum(f0=95,d=.55,punch=1.0):
    t=np.arange(int(SR*d))/SR
    f=f0*(1+1.6*np.exp(-t*28))
    ph=2*np.pi*np.cumsum(f)/SR
    body=np.sin(ph)*np.exp(-t*7)
    skin=rng.standard_normal(len(t))*np.exp(-t*60)*.25
    return (body+skin)*punch
def rim(d=.09):
    t=np.arange(int(SR*d))/SR
    return (np.sin(2*np.pi*1700*t)+.6*np.sin(2*np.pi*2450*t))*np.exp(-t*70)*.5+rng.standard_normal(len(t))*np.exp(-t*120)*.3
def pluck(f,d=1.6,bright=.5,bend=0.0):
    n=int(SR*d); p=int(SR/f); buf=rng.uniform(-1,1,p)
    # làm mềm xung kích thích
    for _ in range(int(3*(1-bright))+1): buf=(buf+np.roll(buf,1))/2
    y=np.zeros(n); 
    for i in range(n):
        y[i]=buf[i%p]; buf[i%p]=0.996*0.5*(buf[i%p]+buf[(i+1)%p])
    t=np.arange(n)/SR
    if bend:  # luyến nhẹ kiểu đàn tranh: điều chế trễ nhỏ
        vib=np.sin(2*np.pi*5.5*t)*bend*np.minimum(1,t*3)
        idx=np.clip(np.arange(n)+vib*SR/f*0.08,0,n-1); y=np.interp(idx,np.arange(n),y)
    return y*np.exp(-t*1.1)
def pad(f,d,g=.05):
    t=np.arange(int(SR*d))/SR
    env=np.minimum(1,t/1.5)*np.minimum(1,(d-t)/1.5)
    return (np.sin(2*np.pi*f*t)+.5*np.sin(2*np.pi*f*1.5*t+.3)+.3*np.sin(2*np.pi*f*2*t))*env*g
# thang ngũ cung Rê: D E G A B
D3,A3,D4,E4,G4,A4,B4,D5,E5,G5,A5=146.83,220.0,293.66,329.63,392.0,440.0,493.88,587.33,659.25,783.99,880.0
BPM=96; B=60/BPM
# mở đầu: ba hồi trống
for k,t in enumerate([0.15,0.95,1.75]): add(drum(88,.9,1.2),t,.9)
for k in range(6): add(drum(100,.3,.8),2.45+k*.13,.35+.08*k)
add(drum(80,1.2,1.3),3.25,1.0)
# nền
add(pad(D3,DUR-1.5,.045),1.0); add(pad(A3,DUR-6,.03),4.0)
# nhịp trống hội từ giây thứ 4
t0=4.0; bars=int((DUR-t0-5)/(4*B))
for b in range(bars):
    bt=t0+b*4*B
    add(drum(92,.5,1.0),bt,.55); add(drum(92,.4,.8),bt+2*B,.4); add(drum(110,.3,.7),bt+2.5*B,.3)
    for s in (1,1.5,3,3.5): add(rim(),bt+s*B,.22)
    if b%4==3:
        for s in (3,3.25,3.5,3.75): add(drum(120,.2,.7),bt+s*B,.3)
# giai điệu (tự soạn), mỗi câu 2 ô nhịp
phr=[[(D4,0),(A4,1),(B4,1.5),(A4,2),(G4,3),(E4,3.5),(D4,4),(E4,5),(G4,5.5),(A4,6)],
     [(A4,0),(B4,.5),(D5,1),(B4,2),(A4,2.5),(G4,3),(A4,4),(E4,5),(G4,6),(D4,7)],
     [(D5,0),(E5,.5),(D5,1),(B4,1.5),(A4,2),(B4,3),(D5,3.5),(E5,4),(G5,5),(E5,5.5),(D5,6)],
     [(B4,0),(A4,.5),(G4,1),(A4,2),(D5,3),(B4,4),(A4,4.5),(G4,5),(E4,6),(D4,7)]]
i=0; t=t0
while t<DUR-7:
    for f,s in phr[i%4]:
        add(pluck(f,1.8,.55,.6),t+s*B,.34)
        if s in (0,4): add(pluck(f/2,2.2,.3),t+s*B,.22)
    t+=8*B; i+=1
# kết: dồn trống rồi một tiếng lớn
te=DUR-4.2
for k in range(14): add(drum(105,.25,.8),te+k*.11,.25+.04*k)
add(drum(78,1.6,1.4),te+1.6,1.1); add(pluck(D4,3,.6,.5),te+1.6,.4); add(pluck(A4,3,.6,.5),te+1.62,.3); add(pluck(D5,3,.6,.5),te+1.64,.3)
y=out[:N]
# tiếng vang nhẹ
for dl,g in ((.19,.22),(.37,.12)):
    d=int(dl*SR); y[d:]+=y[:-d]*g
y=np.tanh(y*1.1); y/=np.max(np.abs(y))*1.05
fade=int(SR*1.2); y[-fade:]*=np.linspace(1,0,fade)
w=wave.open('music.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y*32000).astype(np.int16).tobytes()); w.close()
print('ok',DUR)
