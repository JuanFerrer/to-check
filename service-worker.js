/* eslint-disable no-console */
/* globals importScripts */

const APP_PREFIX = "ToCheck";
// const APP_VERSION = "v1.27"; //eslint-disable-line no-unused-vars
const CACHE_NAME = APP_PREFIX;
const URLS = [
    "./",
    "./index.html?homescreen=1",
    "./index.html",
    "./styles/style.css",
    "./styles/toastify.min.css",
    "https://fonts.googleapis.com/css?family=Open+Sans",
    "https://fonts.googleapis.com/icon?family=Material+Icons",
    "https://apis.google.com/js/api.js",
    "./js/index.js",
    "./js/googleApi.js",
    "./js/cache-polyfill.js",
    "./3rd-party/gdad.js",
    "./3rd-party/jquery.min.js",
    "./3rd-party/toastify.js",
    "./3rd-party/underscore-min.js",
    "./16x16.png",
    "./32x32.png",
    "./96x96.png",
    "./150x150.png",
    "./180x180.png",
    "./192x192.png",
    "./384x384.png",
    "./512x512.png",
    "./safari-pinned-tab.svg",
    "./favicon.ico",
];

importScripts("js/cache-polyfill.js");
const offlineFallbackPage = "index.html";

// Cache resources
self.addEventListener("install", function (e) {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            cache.add(offlineFallbackPage);
            return cache.addAll(URLS);
        })
    );
});

self.addEventListener("activate", function (e) {
    e.waitUntil(self.clients.claim());
});

// If any fetch fails, it will look for the request in the cache and serve it from there first
self.addEventListener("fetch", function (e) {
    if (e.request.method !== "GET") return;
    console.log("[PWA] About to add " + e.request);
    // If request was success, add or update it in the cache
    e.respondWith(fetch(e.request)
        .then(function (response) {
            console.log("[PWA] add page to offline cache: " + response.url);
            e.waitUntil(updateCache(e.request, response.clone()));
            return response;
        }).catch(function (error) {
            console.log("[PWA] " + error);
            return fromCache(e.request);
        })
    );
});

function fromCache(request) {
    // Check to see if you have it in the cache
    // Return response
    // If not in the cache, then return error page
    return caches.open(CACHE_NAME).then(function (cache) {
        return cache.match(request).then(function (response) {
            return response || fetch(request).then(function (response) {
                cache.put(request, response.clone());
            });
        });
    });
}

function updateCache(request, response) {
    return caches.open(CACHE_NAME).then(function (cache) {
        if (!request.url.includes("chrome-extension://")) {
            return cache.put(request, response);
        }

    });
}
