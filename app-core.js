/* ===== LOADER ===== */
setTimeout(()=>document.getElementById('loader').classList.add('done'),1750);

/* ===== 动态背景:星尘 + 金色脉搏曲线 ===== */
(function(){
  const cv=document.getElementById('bgCanvas'),ctx=cv.getContext('2d');
  let W,H,stars=[],pulse=[];
  function size(){
    W=cv.width=innerWidth;H=cv.height=innerHeight;
    stars=[];const n=Math.min(140,Math.floor(W*H/12000));
    for(let i=0;i<n;i++)stars.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.2+.3,tw:Math.random()*Math.PI*2,sp:Math.random()*.02+.005});
    pulse=Array(Math.floor(W/5)).fill(H*.82);
  }
  function tick(){
    ctx.clearRect(0,0,W,H);
    for(let i=pulse.length-1;i>0;i--)pulse[i]=pulse[i-1]+(Math.random()-.5)*2.2;
    const b=Math.sin(Date.now()/4000)*14;
    pulse[0]=H*.78+b;
    ctx.beginPath();
    for(let i=0;i<pulse.length;i++){const x=i*(W/pulse.length),y=pulse[i];i?ctx.lineTo(x,y):ctx.moveTo(x,y);}
    ctx.strokeStyle='rgba(246,196,83,.13)';ctx.lineWidth=1.6;ctx.stroke();
    ctx.beginPath();
    for(let i=0;i<pulse.length;i++){const x=i*(W/pulse.length),y=pulse[i];i?ctx.lineTo(x,y):ctx.moveTo(x,y);}
    ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();
    ctx.fillStyle='rgba(246,196,83,.025)';ctx.fill();
    for(const p of stars){
      p.tw+=p.sp;
      const a=.35+Math.sin(p.tw)*.25;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);
      ctx.fillStyle='rgba(190,215,255,'+a+')';ctx.fill();
    }
    requestAnimationFrame(tick);
  }
  addEventListener('resize',size);
  size();tick();
})();

/* ===== 光标跟随光晕 ===== */
(function(){
  const g=document.getElementById('cursorGlow');
  let tx=-999,ty=-999,x=-999,y=-999;
  addEventListener('mousemove',e=>{tx=e.clientX;ty=e.clientY;g.style.opacity=1;});
  (function loop(){
    x+=(tx-x)*.12;y+=(ty-y)*.12;
    g.style.left=x+'px';g.style.top=y+'px';
    requestAnimationFrame(loop);
  })();
  document.addEventListener('mouseleave',()=>g.style.opacity=0);
})();

/* ===== 滚动:进度条 + 导航高亮 + reveal + 数字滚动 + 3D tilt ===== */
(function(){
  const prog=document.getElementById('progress'),nav=document.querySelector('nav');
  const links=[...document.querySelectorAll('nav a')];
  const secs=links.map(a=>document.querySelector(a.getAttribute('href')));
  function onScroll(){
    const h=document.documentElement;
    const p=h.scrollTop/(h.scrollHeight-h.clientHeight);
    prog.style.width=(p*100)+'%';
    nav.classList.toggle('sc',h.scrollTop>40);
    let cur='';
    secs.forEach(s=>{if(s&&s.getBoundingClientRect().top<h.clientHeight*.55)cur='#'+s.id;});
    links.forEach(a=>a.classList.toggle('on',a.getAttribute('href')===cur));
  }
  addEventListener('scroll',onScroll,{passive:true});onScroll();
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
  const io2=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){
      const el=e.target,to=parseFloat(el.dataset.count),dec=+(el.dataset.dec||0),pre=el.dataset.prefix||'',suf=el.dataset.suffix||'';
      const t0=performance.now(),dur=1600;
      (function step(t){
        const k=Math.min(1,(t-t0)/dur),ease=1-Math.pow(1-k,3);
        el.textContent=pre+(to*ease).toFixed(dec)+suf;
        if(k<1)requestAnimationFrame(step);
      })(t0);
      io2.unobserve(el);
    }
  }),{threshold:.6});
  document.querySelectorAll('.num[data-c]').forEach(el=>io2.observe(el));
  if(matchMedia('(pointer:fine)').matches){
    document.querySelectorAll('.tilt').forEach(card=>{
      card.addEventListener('mousemove',e=>{
        const r=card.getBoundingClientRect();
        const rx=((e.clientY-r.top)/r.height-.5)*-7,ry=((e.clientX-r.left)/r.width-.5)*7;
        card.style.transform='perspective(800px) rotateX('+rx.toFixed(2)+'deg) rotateY('+ry.toFixed(2)+'deg) translateY(-2px)';
      });
      card.addEventListener('mouseleave',()=>{card.style.transform='';});
    });
  }
})();

/* ===== Hero 逐字动画 ===== */
(function(){
  const rows=document.querySelectorAll('#heroTitle .row');
  let idx=0;
  rows.forEach(row=>{
    const text=row.textContent;row.textContent='';
    [...text].forEach(ch=>{
      const s=document.createElement('span');
      s.className='ch';s.textContent=ch;
      s.style.setProperty('--d',(0.45+idx*0.035)+'s');
      row.appendChild(s);idx++;
    });
  });
})();
