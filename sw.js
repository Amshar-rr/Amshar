var CACHE='b4thinkin-v5';
var CORE=['./','./index.html','./Fav.jpeg','./manifest.webmanifest','./data.js','./config.js','./admin.html','./study.html'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(CORE);}).then(function(){return self.skipWaiting();}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
  }).then(function(){return self.clients.claim();}));
});
self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET')return;
  e.respondWith(
    fetch(e.request).then(function(r){
      var copy=r.clone();
      caches.open(CACHE).then(function(c){c.put(e.request,copy);});
      return r;
    }).catch(function(){return caches.match(e.request).then(function(m){return m||caches.match('./index.html');});})
  );
});
