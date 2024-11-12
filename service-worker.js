const cacheNaam = 'app-static-cache-v1';
const dynamicCacheNaam = 'app-dynamic-cache-v1';

// Statische assets die altijd gecachet moeten worden
const assets = [
    '/',
    './index.html',
    './style.css',
    './js/main.js',
    './js/schilderijen-worker.js',
    './js/sound.js',
    './sound/Fredagain.._BoilerRoom_London.mp3',
    './cornflower/js/lottieFile.js',
    './cornflower/js/main.js',
    './cornflower/index.html',
    './cornflower/style.css',
];

// Installatie van de service worker en vooraf cachen van essentiële assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cacheNaam).then(cache => {
            console.log('Caching essential assets');
            return cache.addAll(assets);
        })
    );
});

self.addEventListener('install',event =>{
    event.waitUntil(
        caches.open(cachNaam).then(cache =>{
            console.log('bestanden gecached');
            return cache.addAll(assets);
        })
    )
})

self.addEventListener('active', event =>{
    event.waitUntil(
        caches.keys().then(keys => {
            console.log(keys);
            return Promise.all(keys
                .filter(key=>key !=cachNaam && key != dynamicCacheNaam)
                .map(key => caches.delete(key))
            )
        })
    )
})

self.addEventListener('fetch',event => {
    if(!(event.request.url.startsWith('http'))){
        return;
    }

    event.respondWith(
        caches.match(event.request).then(cacheRes =>{
            return cacheRes || fecth(event.request).then(fetchRes =>{
                return caches.open(dynamicCacheNaam).then(cache => {
                    cache.put(event.request.url,fetchRes.clone());
                    return fetchRes;
                })
            })
        }).catch()
    )
})