// Hotspots: [x, y, w, h, target] in source-image pixels. target null => "Preview only" toast.
var P={
 home:{w:1440,h:830,f:'home.jpg',s:[
  [430,10,50,34,'home'],[500,10,90,34,'browse'],[610,10,100,34,null],[730,10,90,34,null],[838,10,50,34,null],
  [1160,8,100,36,null],[1272,8,110,36,null],[85,5,200,50,'home'],
  [1157,390,200,50,'browse'],[1276,590,110,24,'browse'],
  [250,330,170,40,'dashboard'],[420,330,190,40,'bookings'],
  [55,652,320,178,'detail'],[395,652,310,178,'detail'],[730,652,320,178,'detail'],[1072,652,310,178,'detail']]},
 browse:{w:1440,h:920,f:'browse.jpg',s:[
  [380,0,60,30,'home'],[640,0,90,30,'detail'],[1200,0,200,40,'dashboard'],[50,0,200,40,'home'],
  [1172,213,180,45,'browse'],
  [433,553,110,34,'detail'],[725,553,110,34,'detail'],[1017,553,110,34,'detail'],[1310,553,100,34,'detail'],
  [433,802,110,34,'detail'],[725,802,110,34,'detail'],[1023,802,100,34,'detail'],[1320,802,100,34,'detail'],
  [280,358,270,140,'detail'],[570,358,270,140,'detail'],[862,358,275,140,'detail'],[1155,358,265,140,'detail']]},
 detail:{w:1440,h:900,f:'detail.jpg',s:[
  [370,10,50,34,'home'],[450,10,100,34,'browse'],[60,66,100,24,'browse'],[10,66,40,24,'home'],[60,10,200,40,'home'],
  [1235,8,180,40,'dashboard'],[1152,505,273,48,'bookings'],
  [0,780,210,100,'browse'],[220,780,220,100,'browse'],[450,780,220,100,'browse'],[680,780,220,100,'browse'],[905,780,220,100,'browse'],
  [985,405,125,38,null],[1010,110,1010,0,null]]},
 bookings:{w:1440,h:870,f:'bookings.jpg',s:[
  [30,15,210,50,'home'],[8,95,200,36,'home'],[8,142,200,36,'browse'],[8,190,200,44,'bookings'],
  [8,240,200,40,null],[8,288,200,40,null],[8,335,200,40,null],[8,382,200,40,null],[8,430,200,40,null],[8,478,200,40,null],
  [20,790,170,44,'browse'],[963,93,146,40,'browse'],[1230,10,200,60,'dashboard'],
  [265,225,275,225,'detail'],[935,405,92,40,null],[1030,405,70,40,null],[1155,495,260,44,null]]},
 dashboard:{w:1440,h:880,f:'dashboard.jpg',s:[
  [25,15,180,50,'home'],[8,100,200,44,'dashboard'],[8,150,200,40,'browse'],[8,195,200,40,'bookings'],
  [8,240,200,40,null],[8,285,200,40,null],[8,330,200,40,null],[8,375,200,40,null],[8,420,200,40,null],[8,468,200,40,null],[8,513,200,40,null],
  [1028,97,125,42,null],[18,770,165,44,null],[1190,800,150,40,null],
  [255,335,210,215,'detail'],[483,335,210,215,'detail'],[703,335,210,215,'detail'],[928,335,210,215,'detail'],
  [1065,585,75,20,'bookings']]}
};
var shot=document.getElementById('shot'),spots=document.getElementById('spots'),toast=document.getElementById('toast'),tt;
function say(){toast.classList.add('on');clearTimeout(tt);tt=setTimeout(function(){toast.classList.remove('on')},1400)}
function show(id){
 var p=P[id]||P.home; if(!P[id])id='home';
 shot.src=p.f; spots.innerHTML='';
 p.s.forEach(function(r){
  if(!r[2]||!r[3])return;
  var a=document.createElement('a');
  a.style.left=(r[0]/p.w*100)+'%';a.style.top=(r[1]/p.h*100)+'%';a.style.width=(r[2]/p.w*100)+'%';a.style.height=(r[3]/p.h*100)+'%';
  a.onclick=function(e){e.preventDefault(); if(r[4]&&r[4]!==id){location.hash=r[4]} else if(!r[4]){say()}};
  spots.appendChild(a);
 });
 document.title='DriveShare Preview - '+id; window.scrollTo(0,0);
}
window.addEventListener('hashchange',function(){show(location.hash.slice(1))});
show(location.hash.slice(1));
