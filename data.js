(function(){
var C=window.B4_CONFIG||{},U=C.url,K=C.key,live=!!(U&&K),token=sessionStorage.getItem('b4tok');
var DEF={announcement:"Welcome to B4Thinkin' — a free, student-made study space.",examName:"A/L Examination",examDate:"2028-08-12",
question:{q:"Which organelle produces most of a cell's ATP?",options:["Nucleus","Mitochondrion","Ribosome","Golgi body"],answer:1,explain:"Mitochondria carry out aerobic respiration, which makes most of the cell's ATP."},
quotes:["Indeed, with hardship will be ease. (Quran 94:6)","Small steps every day add up."],
about:"Hi! Ask me any study doubt. I reply when I am online, so your answer may take a little while."};
function merge(v){return Object.assign({},DEF,v||{})}
function hd(){return{apikey:K,"Content-Type":"application/json",Authorization:"Bearer "+(token||K)}}
async function load(){
  if(!live){var s=localStorage.getItem('b4_site');return merge(s&&JSON.parse(s))}
  try{var r=await fetch(U+'/rest/v1/site_content?key=eq.site&select=value',{headers:hd()});var j=await r.json();return merge(j[0]&&j[0].value)}catch(e){return null}
}
async function save(v){
  if(!live){localStorage.setItem('b4_site',JSON.stringify(v));return true}
  var h=hd();h.Prefer='resolution=merge-duplicates,return=minimal';
  var r=await fetch(U+'/rest/v1/site_content',{method:'POST',headers:h,body:JSON.stringify({key:'site',value:v,updated_at:new Date().toISOString()})});
  return r.ok;
}
async function login(email,pw){
  if(!live){if(pw==='demo'){sessionStorage.setItem('b4tok','demo');token='demo';return true}return false}
  var r=await fetch(U+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:K,"Content-Type":"application/json"},body:JSON.stringify({email:email,password:pw})});
  var j=await r.json();if(!j.access_token)return false;token=j.access_token;sessionStorage.setItem('b4tok',token);return true;
}
function logout(){token=null;sessionStorage.removeItem('b4tok')}
function watch(cb){
  var last='';function run(){load().then(function(v){if(!v)return;var s=JSON.stringify(v);if(s!==last){last=s;cb(v)}})}
  run();setInterval(run,8000);
  window.addEventListener('storage',run);document.addEventListener('visibilitychange',function(){if(!document.hidden)run()});
}

var DAY=2*864e5;
function sh(sid){var h=hd();h['x-session']=sid;return h}
async function chatGet(sid){
  if(!live)return JSON.parse(localStorage.getItem('b4_chat')||'[]').filter(function(m){return m.session===sid&&Date.now()-m.t<DAY});
  try{var r=await fetch(U+'/rest/v1/chat_messages?session=eq.'+encodeURIComponent(sid)+'&select=sender,body,created_at&order=created_at.asc',{headers:sh(sid)});var j=await r.json();
  return Array.isArray(j)?j.map(function(m){return{sender:m.sender,body:m.body,t:Date.parse(m.created_at)}}):[]}catch(e){return[]}
}
async function chatSend(sid,sender,body){
  if(!live){var a=JSON.parse(localStorage.getItem('b4_chat')||'[]').filter(function(m){return Date.now()-m.t<DAY});a.push({session:sid,sender:sender,body:body,t:Date.now()});localStorage.setItem('b4_chat',JSON.stringify(a));return true}
  var h=sh(sid);h.Prefer='return=minimal';
  var r=await fetch(U+'/rest/v1/chat_messages',{method:'POST',headers:h,body:JSON.stringify({session:sid,sender:sender,body:body})});return r.ok;
}
async function chatAll(){
  if(!live)return JSON.parse(localStorage.getItem('b4_chat')||'[]').filter(function(m){return Date.now()-m.t<DAY});
  try{var c=encodeURIComponent(new Date(Date.now()-DAY).toISOString());
  var r=await fetch(U+'/rest/v1/chat_messages?created_at=gt.'+c+'&select=session,sender,body,created_at&order=created_at.asc',{headers:hd()});var j=await r.json();
  return Array.isArray(j)?j.map(function(m){return{session:m.session,sender:m.sender,body:m.body,t:Date.parse(m.created_at)}}):[]}catch(e){return[]}
}
async function chatPurge(){
  if(!live){localStorage.setItem('b4_chat','[]');return true}
  var r=await fetch(U+'/rest/v1/chat_messages?created_at=lt.'+encodeURIComponent(new Date().toISOString()),{method:'DELETE',headers:hd()});return r.ok;
}

window.B4={chatGet:chatGet,chatSend:chatSend,chatAll:chatAll,chatPurge:chatPurge,live:live,DEF:DEF,load:load,save:save,login:login,logout:logout,watch:watch,loggedIn:function(){return !!token}};
})();
