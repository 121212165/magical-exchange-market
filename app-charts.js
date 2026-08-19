/* ===== SVG 工具 ===== */
function axes(w,h,xl){
  let g='<line x1="50" y1="'+(h-40)+'" x2="'+(w-20)+'" y2="'+(h-40)+'" stroke="rgba(255,255,255,.15)"/>';
  g+='<line x1="50" y1="14" x2="50" y2="'+(h-40)+'" stroke="rgba(255,255,255,.15)"/>';
  for(let i=0;i<4;i++){const y=14+(h-40-14)*i/4;g+='<line x1="50" y1="'+y.toFixed(0)+'" x2="'+(w-20)+'" y2="'+y.toFixed(0)+'" stroke="rgba(255,255,255,.05)"/>';}
  xl.forEach((t,i)=>{const x=50+(w-20-50)*i/(xl.length-1);g+='<text x="'+x.toFixed(0)+'" y="'+(h-18)+'" fill="rgba(255,255,255,.45)" font-size="11" text-anchor="middle" font-family="var(--mono)">'+t+'</text>';});
  return g;
}
function sx(v,w,pad){return pad+v*(w-2*pad);}
function sy(v,h,pad){return h-pad-v*(h-2*pad);}
function pt(pts,w,h,pad){
  if(pts.length<2)return '';
  let d='M'+sx(pts[0][0],w,pad).toFixed(1)+','+sy(pts[0][1],h,pad).toFixed(1);
  for(let i=1;i<pts.length;i++)d+=' L'+sx(pts[i][0],w,pad).toFixed(1)+','+sy(pts[i][1],h,pad).toFixed(1);
  return d;
}
function ar(pts,w,h,pad){
  let d=pt(pts,w,h,pad);
  d+=' L'+sx(pts[pts.length-1][0],w,pad).toFixed(1)+','+(h-pad).toFixed(1)+' L'+sx(pts[0][0],w,pad).toFixed(1)+','+(h-pad).toFixed(1)+' Z';
  return d;
}

/* ===== 过拟合 A/B 切换 ===== */
(function(){
  const A={name:'区间A·完美',prices:[23,30,38,45,52,60,68,75,80,85,90,92],end:85,avg:54,inv:11000,mv:19141.44,ret:74.01};
  const B={name:'区间B·阴跌',prices:[92,80,72,65,58,52,47,43,40,38,36,36],end:36,avg:51.7,inv:11000,mv:7659,ret:-30.4};
  const seg=document.getElementById('overfitSeg');
  function draw(v){
    const d=v==='good'?A:B;
    const el=document.getElementById('overfitChart');
    const W=1000,H=330,pad=52;
    const min=Math.min(...d.prices)*.85,max=Math.max(...d.prices)*1.1;
    const pts=d.prices.map((p,i)=>[i/(d.prices.length-1),(p-min)/(max-min)]);
    const col=v==='good'?'#37e0a0':'#ff6d8e';
    const endY=sy((d.end-min)/(max-min),H,pad);
    el.innerHTML='<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;height:auto">'
      +axes(W,H,['第1月','第3月','第5月','第7月','第9月','第11月'])
      +'<path d="'+ar(pts,W,H,pad)+'" fill="'+col+'" opacity="0.10"/>'
      +'<path d="'+pt(pts,W,H,pad)+'" fill="none" stroke="'+col+'" stroke-width="3" stroke-linecap="round"/>'
      +'<line x1="50" y1="'+endY.toFixed(1)+'" x2="'+(W-20)+'" y2="'+endY.toFixed(1)+'" stroke="'+col+'" stroke-width="1.2" stroke-dasharray="5 5" opacity=".7"/>'
      +'<text x="'+(W-40)+'" y="'+(endY-8).toFixed(1)+'" fill="'+col+'" font-size="12" text-anchor="end" font-family="var(--mono)">期末 $'+d.end+'</text>'
      +'</svg>';
    document.getElementById('ov-price').textContent='$'+d.avg;
    document.getElementById('ov-end').textContent='$'+d.end;
    document.getElementById('ov-inv').textContent='$'+d.inv.toLocaleString();
    const r=document.getElementById('ov-ret');
    r.textContent=(d.ret>=0?'+':'')+d.ret+'%';
    r.style.color=d.ret>=0?'var(--green)':'var(--red)';
  }
  seg.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    seg.querySelectorAll('button').forEach(x=>x.classList.remove('on'));b.classList.add('on');
    draw(b.dataset.v);
  });
  draw('good');
})();

/* ===== 定投模拟器 ===== */
(function(){
  const amt=document.getElementById('sAmt'),yr=document.getElementById('sYr'),rr=document.getElementById('sR'),dd=document.getElementById('sD');
  const oA=document.getElementById('oAmt'),oY=document.getElementById('oYr'),oR=document.getElementById('oR'),oD=document.getElementById('oD');
  const chart=document.getElementById('simChart');
  function draw(){
    const P=+amt.value,years=+yr.value,r=+rr.value,delay=+dd.value;
    oA.textContent='¥'+P.toLocaleString();oY.textContent=years+' 年';oR.textContent=r+'%';oD.textContent=delay+' 年';
    document.getElementById('simDLab').textContent='晚 '+delay+' 年开始';
    const n=years*12,rm=Math.pow(1+r/100,1/12)-1;
    let dcaV=0;const dcaPts=[[0,0]];
    for(let m=1;m<=n;m++){dcaV=(dcaV+P)*Math.pow(1+rm,1);if(m%Math.max(1,Math.round(n/24))===0||m===n)dcaPts.push([m/n,dcaV]);}
    dcaPts[dcaPts.length-1]=[1,dcaV];
    const startMonth=Math.min(delay*12,n);
    let lateV=0;const latePts=[[0,0]];
    for(let m=1;m<=n;m++){
      if(m>startMonth)lateV=(lateV+P)*Math.pow(1+rm,1);
      if(m%Math.max(1,Math.round(n/24))===0||m===n)latePts.push([m/n,lateV]);
    }
    latePts[latePts.length-1]=[1,lateV];
    const inv=P*n;
    const W=1000,H=360,pad=52;
    const mx=Math.max(dcaV,lateV,inv)*1.15;
    const p1=dcaPts.map(([x,y])=>[x,y/mx]);
    const p2=latePts.map(([x,y])=>[x,y/mx]);
    const invLine=[[0,0],[1,inv/mx]];
    chart.innerHTML='<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;height:auto">'
      +axes(W,H,['第0年','第'+Math.round(years/3)+'年','第'+Math.round(years*2/3)+'年','第'+years+'年'])
      +'<path d="'+ar(p1,W,H,pad)+'" fill="#f6c453" opacity="0.10"/>'
      +'<path d="'+pt(p1,W,H,pad)+'" fill="none" stroke="#f6c453" stroke-width="3" stroke-linecap="round"/>'
      +'<path d="'+pt(p2,W,H,pad)+'" fill="none" stroke="#4cc9ff" stroke-width="2.4" stroke-dasharray="7 6" stroke-linecap="round"/>'
      +'<path d="'+pt(invLine,W,H,pad)+'" fill="none" stroke="rgba(255,255,255,.28)" stroke-width="1.6" stroke-dasharray="3 5"/>'
      +'<text x="'+(W-20)+'" y="30" fill="#f6c453" font-size="13" text-anchor="end" font-family="var(--font)">现在就开始 · ¥'+Math.round(dcaV).toLocaleString()+'</text>'
      +'<text x="'+(W-20)+'" y="50" fill="#4cc9ff" font-size="13" text-anchor="end" font-family="var(--font)">晚 '+delay+' 年开始 · ¥'+Math.round(lateV).toLocaleString()+'</text>'
      +'<text x="'+(W-20)+'" y="70" fill="rgba(255,255,255,.5)" font-size="12" text-anchor="end" font-family="var(--font)">累计投入 · ¥'+Math.round(inv).toLocaleString()+'</text>'
      +'</svg>';
    document.getElementById('simInv').textContent='¥'+inv.toLocaleString();
    document.getElementById('simDca').textContent='¥'+Math.round(dcaV).toLocaleString();
    document.getElementById('simLump').textContent='¥'+Math.round(lateV).toLocaleString();
    const edge=document.getElementById('simEdge');
    const e=dcaV-lateV;
    edge.textContent=lateV>0?'¥'+Math.round(e).toLocaleString()+' ('+(e/lateV*100).toFixed(0)+'%)':'¥'+Math.round(e).toLocaleString();
    edge.style.color='var(--green)';
  }
  [amt,yr,rr,dd].forEach(el=>el.addEventListener('input',draw));
  draw();
})();

/* ===== BOX 七年回测 ===== */
(function(){
  const BTC=[10500,9600,8300,9200,7500,7200,9300,8600,6400,8600,9500,9100,
    11300,11600,10800,13800,19700,29000,33100,45100,58800,57700,37300,35000,
    41500,47100,43800,61300,57000,46300,38200,43200,45500,37700,31700,20000,
    23400,20000,19400,20500,16300,16500,23100,23100,28100,29300,27200,30500,
    29200,25900,27000,34600,37700,42200,42600,61300,71300,60700,67400,62700,
    64600,58900,63400,70300,96500,93700];
  const EOS=[6.0,5.5,4.5,3.6,3.0,2.6,4.2,3.8,2.0,2.4,2.5,2.5,
    2.6,3.0,2.6,2.6,3.0,2.9,3.4,4.2,5.5,5.0,3.7,3.7,
    3.7,4.6,4.5,4.7,4.5,3.6,3.2,3.2,3.3,3.0,2.2,1.3,
    1.5,1.4,1.3,1.2,1.0,1.0,1.3,1.3,1.1,1.2,1.0,0.8,
    0.7,0.6,0.6,0.9,0.8,1.0,1.0,1.3,1.3,1.2,1.1,0.9,
    0.9,0.9,0.9,0.9,0.9,0.8];
  const XIN=120.0,N=BTC.length;
  const SCEN={
    box:{w:{b:.65,e:.25,x:.10},label:'官方 BOX 65/25/10',col:'#f6c453'},
    btc:{w:{b:1,e:0,x:0},label:'全 BTC',col:'#4cc9ff'},
    eos:{w:{b:0,e:1,x:0},label:'全 EOS',col:'#ff6d8e'}
  };
  const seg=document.getElementById('boxSeg');
  function dca(w){
    const sh={b:0,e:0,x:0};const series=[];
    for(let i=0;i<N;i++){
      sh.b+=1000*w.b/BTC[i];sh.e+=1000*w.e/EOS[i];sh.x+=1000*w.x/XIN;
      const mv=sh.b*BTC[i]+sh.e*EOS[i]+sh.x*XIN;
      if(i%3===0||i===N-1)series.push([i/(N-1),mv]);
    }
    let sh41={b:0,e:0,x:0};
    for(let i=0;i<41;i++){sh41.b+=1000*w.b/BTC[i];sh41.e+=1000*w.e/EOS[i];sh41.x+=1000*w.x/XIN;}
    const mv41=sh41.b*BTC[40]+sh41.e*EOS[40]+sh41.x*XIN;
    const endMv=sh.b*BTC[N-1]+sh.e*EOS[N-1]+sh.x*XIN;
    return {series,endMv,low41:mv41,contrib:{b:sh.b*BTC[N-1],e:sh.e*EOS[N-1],x:sh.x*XIN}};
  }
  function draw(v){
    const S=SCEN[v],r=dca(S.w);
    const W=1000,H=340,pad=52;
    const mx=Math.max(...r.series.map(p=>p[1]))*1.15;
    const pts=r.series.map(([x,y])=>[x,y/mx]);
    const chart=document.getElementById('boxChart');
    chart.innerHTML='<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;height:auto">'
      +axes(W,H,['2019-07','2020-06','2021-07','2022-11','2023-12','2024-12'])
      +'<path d="'+ar(pts,W,H,pad)+'" fill="'+S.col+'" opacity="0.10"/>'
      +'<path d="'+pt(pts,W,H,pad)+'" fill="none" stroke="'+S.col+'" stroke-width="3" stroke-linecap="round"/>'
      +'<text x="'+(W-20)+'" y="30" fill="'+S.col+'" font-size="13" text-anchor="end" font-family="var(--font)">'+S.label+'</text>'
      +'<text x="'+(W-20)+'" y="50" fill="rgba(255,255,255,.5)" font-size="12" text-anchor="end" font-family="var(--font)">期末市值 $'+Math.round(r.endMv).toLocaleString()+'</text>'
      +'</svg>';
    document.getElementById('bx-mv').textContent='$'+Math.round(r.endMv).toLocaleString();
    const ret=document.getElementById('bx-ret');
    const rr=(r.endMv/66000-1)*100;
    ret.textContent=(rr>=0?'+':'')+rr.toFixed(1)+'%';
    ret.style.color=rr>=0?'var(--green)':'var(--red)';
    const lr=(r.low41/41000-1)*100;
    const low=document.getElementById('bx-low');
    low.textContent=(lr>=0?'+':'')+lr.toFixed(1)+'%';
    low.style.color=lr>=0?'var(--green)':'var(--cyan)';
    const c=r.contrib,tot=Object.values(c).reduce((a,b)=>a+b,0);
    const names=[['b','BTC',S.col],['e','EOS','#ff6d8e'],['x','XIN','#9d8cff']];
    let h='<div style="font-size:12px;color:var(--faint);margin-bottom:8px">期末市值贡献分解(BTC 一个人扛起了大部分收益)</div>';
    names.forEach(([k,nm,col])=>{
      const pct=c[k]/tot*100;
      h+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:7px">'
        +'<span style="width:44px;font-size:12.5px;color:var(--dim)">'+nm+'</span>'
        +'<div style="flex:1;height:15px;background:rgba(255,255,255,.06);border-radius:8px;overflow:hidden">'
        +'<div style="width:'+pct.toFixed(1)+'%;height:100%;background:'+col+';opacity:.85"></div></div>'
        +'<span style="width:76px;text-align:right;font-family:var(--mono);font-size:12.5px;color:var(--ink)">'+pct.toFixed(1)+'%</span></div>';
    });
    document.getElementById('boxContrib').innerHTML=h;
  }
  seg.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    seg.querySelectorAll('button').forEach(x=>x.classList.remove('on'));b.classList.add('on');
    draw(b.dataset.v);
  });
  draw('box');
})();

/* ===== 比特币发行曲线 ===== */
(function(){
  const chart=document.getElementById('btcChart');
  const W=1000,H=360,pad=52;
  const years=131,x0=2009;
  const pts=[];
  for(let i=0;i<=240;i++){const t=i*131/240;const supp=1-Math.pow(2,-t/4);pts.push([t/131,supp]);}
  const marks=[[2012,.5,'2012 · 已挖 50%'],[2035,.99,'~2035 · 99%'],[2140,1,'2140 · 100%']];
  let d='M'+sx(pts[0][0],W,pad).toFixed(1)+','+sy(pts[0][1],H,pad).toFixed(1);
  for(let i=1;i<pts.length;i++)d+=' L'+sx(pts[i][0],W,pad).toFixed(1)+','+sy(pts[i][1],H,pad).toFixed(1);
  let html='<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;height:auto">'
    +'<line x1="'+sx(0,W,pad)+'" y1="'+sy(1,H,pad)+'" x2="'+sx(1,W,pad)+'" y2="'+sy(1,H,pad)+'" stroke="rgba(255,255,255,.18)" stroke-dasharray="6 5"/>'
    +'<text x="'+(sx(1,W,pad)+6)+'" y="'+(sy(1,H,pad)+4)+'" fill="rgba(255,255,255,.5)" font-size="11.5" font-family="var(--font)">2100万枚上限</text>';
  for(let i=0;i<5;i++){const y=14+(H-40-14)*i/4;html+='<line x1="50" y1="'+y.toFixed(0)+'" x2="'+(W-20)+'" y2="'+y.toFixed(0)+'" stroke="rgba(255,255,255,.05)"/>';}
  html+='<line x1="50" y1="'+(H-40)+'" x2="'+(W-20)+'" y2="'+(H-40)+'" stroke="rgba(255,255,255,.15)"/>';
  html+='<line x1="50" y1="14" x2="50" y2="'+(H-40)+'" stroke="rgba(255,255,255,.15)"/>';
  ['2009','2020','2035','2080','2120','2140'].forEach((t,i)=>{const x=50+(W-20-50)*i/5;html+='<text x="'+x.toFixed(0)+'" y="'+(H-18)+'" fill="rgba(255,255,255,.45)" font-size="11" text-anchor="middle" font-family="var(--mono)">'+t+'</text>';});
  html+='<path d="'+d+'" fill="none" stroke="#f6c453" stroke-width="3" stroke-linecap="round"/>';
  html+='<path d="'+d+' L'+sx(1,W,pad).toFixed(1)+','+sy(0,H,pad).toFixed(1)+' L'+sx(0,W,pad).toFixed(1)+','+sy(0,H,pad).toFixed(1)+' Z" fill="#f6c453" opacity="0.08"/>';
  marks.forEach(([y,pct,lab])=>{
    const x=sx((y-x0)/131,W,pad),yy=sy(pct,H,pad);
    html+='<circle cx="'+x.toFixed(1)+'" cy="'+yy.toFixed(1)+'" r="4.5" fill="#4cc9ff"/>'
      +'<text x="'+x.toFixed(1)+'" y="'+(yy-10).toFixed(1)+'" fill="#4cc9ff" font-size="12" text-anchor="middle" font-family="var(--font)">'+lab+'</text>';
  });
  html+='</svg>';
  chart.innerHTML=html;
})();
