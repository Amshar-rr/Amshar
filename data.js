(function(){
var C=window.B4_CONFIG||{},U=C.url,K=C.key,live=!!(U&&K),DAY=2*864e5;
var token=sessionStorage.getItem('b4tok'),rtok=sessionStorage.getItem('b4rtok');
var DEF={announcement:"Welcome to B4Thinkin' — a free, student-made study space.",examName:"A/L Examination",examDate:"2028-08-12",
question:{q:"Which organelle produces most of a cell's ATP?",options:["Nucleus","Mitochondrion","Ribosome","Golgi body"],answer:1,explain:"Mitochondria carry out aerobic respiration, which makes most of the cell's ATP."},
quotes:["Indeed, with hardship will be ease. (Quran 94:6)","Small steps every day add up."],
about:"Hi! Ask me any study doubt. I reply when I am online, so your answer may take a little while."};
function merge(v){return Object.assign({},DEF,v||{})}
function hd(x){var h={apikey:K,"Content-Type":"application/json",Authorization:"Bearer "+(token||K)};if(x)for(var k in x)h[k]=x[k];return h}
function setTok(a,b){token=a;rtok=b;sessionStorage.setItem('b4tok',a);if(b)sessionStorage.setItem('b4rtok',b)}
async function refresh(){try{var r=await fetch(U+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:K,"Content-Type":"application/json"},body:JSON.stringify({refresh_token:rtok})});var j=await r.json();if(!j.access_token)return false;setTok(j.access_token,j.refresh_token);return true}catch(e){return false}}
async function rq(path,method,body,extra){
  var go=function(){return fetch(U+path,{method:method||'GET',headers:hd(extra),body:body?JSON.stringify(body):undefined})};
  var r=await go();if(r.status===401&&rtok&&token&&await refresh())r=await go();return r}
async function load(){
  if(!live){var s=localStorage.getItem('b4_site');return merge(s&&JSON.parse(s))}
  try{var r=await rq('/rest/v1/site_content?key=eq.site&select=value');var j=await r.json();return merge(j[0]&&j[0].value)}catch(e){return null}
}
async function save(v){
  if(!live){localStorage.setItem('b4_site',JSON.stringify(v));return true}
  var r=await rq('/rest/v1/site_content','POST',{key:'site',value:v,updated_at:new Date().toISOString()},{Prefer:'resolution=merge-duplicates,return=minimal'});if(!r.ok){alert('Error '+r.status+': '+await r.text())}return r.ok}
async function login(email,pw){
  if(!live){if(pw==='demo'){token='demo';sessionStorage.setItem('b4tok','demo');return true}return false}
  var r=await fetch(U+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:K,"Content-Type":"application/json"},body:JSON.stringify({email:email,password:pw})});
  var j=await r.json();if(!j.access_token)return false;setTok(j.access_token,j.refresh_token);return true}
function logout(){token=rtok=null;sessionStorage.removeItem('b4tok');sessionStorage.removeItem('b4rtok')}
function watch(cb){
  var last='';function run(){load().then(function(v){if(!v)return;var s=JSON.stringify(v);if(s!==last){last=s;cb(v)}})}
  run();setInterval(run,8000);window.addEventListener('storage',run);document.addEventListener('visibilitychange',function(){if(!document.hidden)run()});
}
/* ---- live chat: temporary (2 days), text for students, text/photo/voice for admin ---- */
function lc(){return JSON.parse(localStorage.getItem('b4_chat')||'[]').filter(function(m){return Date.now()-m.id<DAY})}
async function chatGet(sid,after){after=after||0;
  if(!live)return lc().filter(function(m){return m.session===sid&&m.id>after});
  try{var r=await rq('/rest/v1/chat_messages?session=eq.'+encodeURIComponent(sid)+'&id=gt.'+after+'&select=id,sender,body,media_type,media&order=id.asc','GET',null,{'x-session':sid});var j=await r.json();return Array.isArray(j)?j:[]}catch(e){return[]}}
async function chatAll(after){after=after||0;
  if(!live)return lc().filter(function(m){return m.id>after});
  try{var c=encodeURIComponent(new Date(Date.now()-DAY).toISOString());var r=await rq('/rest/v1/chat_messages?id=gt.'+after+'&created_at=gt.'+c+'&select=id,session,sender,body,media_type,media&order=id.asc');var j=await r.json();return Array.isArray(j)?j:[]}catch(e){return[]}}
async function chatSend(sid,sender,body,mt,media){
  if(!live){var a=lc();a.push({id:a.length?Math.max(Date.now(),a[a.length-1].id+1):Date.now(),session:sid,sender:sender,body:body||'',media_type:mt||null,media:media||null});localStorage.setItem('b4_chat',JSON.stringify(a));return true}
  var r=await rq('/rest/v1/chat_messages','POST',{session:sid,sender:sender,body:body||'',media_type:mt||null,media:media||null},{'x-session':sid,Prefer:'return=minimal'});return r.ok}
async function chatPurge(){
  if(!live){localStorage.setItem('b4_chat','[]');return true}
  var r=await rq('/rest/v1/chat_messages?id=gt.0','DELETE');return r.ok}
window.B4={live:live,DEF:DEF,load:load,save:save,login:login,logout:logout,watch:watch,loggedIn:function(){return !!token},chatGet:chatGet,chatAll:chatAll,chatSend:chatSend,chatPurge:chatPurge};
})();
