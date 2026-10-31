let landCache;
export async function loadLand(){if(landCache)return landCache;try{const u=new URL('../data/land.json',import.meta.url);const r=await fetch(u);if(!r.ok)throw Error('coastline unavailable');landCache=(await r.json()).polygons||[];return landCache;}catch{return []}}
export function createGlobe(canvas,options={}){
 const ctx=canvas?.getContext('2d');if(!ctx)return {setPoints(){},destroy(){}};
 let polygons=[],points=options.points||[],centerLon=options.lon??-27,centerLat=options.lat??20,zoom=options.zoom??1;
 let stopped=false,drag=null,frame=0,last=0,auto=options.autoRotate!==false&&!matchMedia('(prefers-reduced-motion: reduce)').matches,seenPointer=false;
 let renderQueued=false;
 const project=(lon,lat,cx,cy,r)=>{let a=(lon-centerLon)*Math.PI/180,b=lat*Math.PI/180,p=centerLat*Math.PI/180;let cosc=Math.sin(p)*Math.sin(b)+Math.cos(p)*Math.cos(b)*Math.cos(a);return {x:cx+r*Math.cos(b)*Math.sin(a),y:cy-r*(Math.cos(p)*Math.sin(b)-Math.sin(p)*Math.cos(b)*Math.cos(a)),visible:cosc>0}};
 function render(){if(stopped)return;const rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2),w=Math.max(1,Math.round(rect.width)),h=Math.max(1,Math.round(rect.height));if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr)}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
 const cx=w*(options.compact?.55:.52),cy=h*.49,r=Math.min(w*.44,h*.445)*zoom;
 const halo=ctx.createRadialGradient(cx,cy,r*.7,cx,cy,r*1.24);halo.addColorStop(0,'rgba(18,178,178,.04)');halo.addColorStop(.76,'rgba(50,212,200,.07)');halo.addColorStop(1,'rgba(46,206,199,0)');ctx.fillStyle=halo;ctx.beginPath();ctx.arc(cx,cy,r*1.25,0,2*Math.PI);ctx.fill();
 const ocean=ctx.createRadialGradient(cx-r*.28,cy-r*.38,r*.02,cx+r*.2,cy+r*.1,r*1.32);ocean.addColorStop(0,'#1f6a78');ocean.addColorStop(.45,'#10515e');ocean.addColorStop(.82,'#08323f');ocean.addColorStop(1,'#041723');ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fillStyle=ocean;ctx.fill();ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.clip();
 // Graticule drawn in geodetic coordinates.
 ctx.strokeStyle='rgba(147,210,213,.18)';ctx.lineWidth=.7;
 for(let lon=-180;lon<=180;lon+=20){ctx.beginPath();let drawn=false;for(let lat=-88;lat<=88;lat+=2){const pt=project(lon,lat,cx,cy,r);if(pt.visible){if(!drawn){ctx.moveTo(pt.x,pt.y);drawn=true}else ctx.lineTo(pt.x,pt.y)}else drawn=false}ctx.stroke()}
 for(let lat=-80;lat<=80;lat+=20){ctx.beginPath();let drawn=false;for(let lon=-180;lon<=180;lon+=2){const pt=project(lon,lat,cx,cy,r);if(pt.visible){if(!drawn){ctx.moveTo(pt.x,pt.y);drawn=true}else ctx.lineTo(pt.x,pt.y)}else drawn=false}ctx.stroke()}
 for(const poly of polygons){if(!Array.isArray(poly)||poly.length<3)continue;ctx.beginPath();let started=false,visibleCount=0;const avgVis=poly.reduce((acc,p)=>acc+(project(p[0],p[1],cx,cy,r).visible?1:0),0);if(avgVis<2)continue;for(let j=0;j<poly.length;j++){const p=project(poly[j][0],poly[j][1],cx,cy,r);if(p.visible){visibleCount++;if(!started){ctx.moveTo(p.x,p.y);started=true}else ctx.lineTo(p.x,p.y)}else if(started){started=false}}ctx.fillStyle='rgba(89,161,150,.34)';if(visibleCount/poly.length>.64)ctx.fill();ctx.strokeStyle='rgba(152,223,198,.53)';ctx.lineWidth=.85;ctx.stroke()}
 // Verified occurrence coordinates from GBIF: point records, not range polygons.
 for(const item of points){const lon=Number(item.lon),lat=Number(item.lat);if(!Number.isFinite(lon)||!Number.isFinite(lat))continue;const p=project(lon,lat,cx,cy,r);if(!p.visible)continue;ctx.beginPath();ctx.arc(p.x,p.y,2.2,0,2*Math.PI);ctx.fillStyle='rgba(170,255,207,.85)';ctx.fill()}
 const shade=ctx.createLinearGradient(cx-r,cy-r,cx+r,cy+r);shade.addColorStop(0,'rgba(177,243,238,.1)');shade.addColorStop(.55,'rgba(0,14,24,0)');shade.addColorStop(1,'rgba(0,4,14,.34)');ctx.fillStyle=shade;ctx.fillRect(cx-r,cy-r,2*r,2*r);ctx.restore();ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.strokeStyle='rgba(130,225,212,.45)';ctx.lineWidth=1.3;ctx.stroke();
 if(options.showLabels){ctx.fillStyle='rgba(164,223,220,.8)';ctx.font='10px DM Sans,Arial';ctx.fillText(`${Math.round(centerLon)}° / ${Math.round(centerLat)}°`,21,h-19)}
 }
 const queue=()=>{if(renderQueued)return;renderQueued=true;requestAnimationFrame(()=>{renderQueued=false;render()})};
 const pointerDown=(e)=>{drag={x:e.clientX,y:e.clientY,lon:centerLon,lat:centerLat};auto=false;seenPointer=true;canvas.setPointerCapture(e.pointerId)};
 const pointerMove=(e)=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;centerLon=(drag.lon-dx*.35+540)%360-180;centerLat=Math.max(-80,Math.min(80,drag.lat+dy*.3));queue()};
 const pointerUp=()=>{drag=null};const wheel=(e)=>{e.preventDefault();zoom=Math.max(.72,Math.min(1.16,zoom-e.deltaY*.0005));queue()};
 const key=(e)=>{if(e.key==='ArrowLeft'){centerLon-=8;queue()}if(e.key==='ArrowRight'){centerLon+=8;queue()}if(e.key==='ArrowUp'){centerLat=Math.min(80,centerLat+8);queue()}if(e.key==='ArrowDown'){centerLat=Math.max(-80,centerLat-8);queue()}};
 canvas.tabIndex=0;canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Interactive globe with genuine GBIF observations where available. Drag or use arrow keys to rotate; wheel to zoom.');
 canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointermove',pointerMove);canvas.addEventListener('pointerup',pointerUp);canvas.addEventListener('pointercancel',pointerUp);canvas.addEventListener('wheel',wheel,{passive:false});canvas.addEventListener('keydown',key);
 const resize=typeof ResizeObserver!=='undefined'?new ResizeObserver(queue):null;resize?.observe(canvas);loadLand().then(p=>{polygons=p;queue()});
 const animate=(now)=>{if(stopped)return;frame=requestAnimationFrame(animate);if(auto&&!drag&&now-last>44){centerLon=(centerLon+.11+180)%360-180;queue();last=now}};frame=requestAnimationFrame(animate);queue();
 return {setPoints(next){points=Array.isArray(next)?next:[];queue()},focus(lon,lat){auto=false;centerLon=Number(lon)||0;centerLat=Number(lat)||0;queue()},destroy(){stopped=true;cancelAnimationFrame(frame);resize?.disconnect();canvas.removeEventListener('pointerdown',pointerDown);canvas.removeEventListener('pointermove',pointerMove);canvas.removeEventListener('pointerup',pointerUp);canvas.removeEventListener('pointercancel',pointerUp);canvas.removeEventListener('wheel',wheel);canvas.removeEventListener('keydown',key)}};
}
