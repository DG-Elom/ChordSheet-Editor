/// <reference lib="webworker" />
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, NetworkFirst, StaleWhileRevalidate } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope & typeof globalThis;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/"),
      handler: new NetworkFirst({
        cacheName: "api-cache",
        networkTimeoutSeconds: 10,
      }),
    },
    {
      matcher: ({ url }) =>
        url.pathname.match(/\.(?:js|css|woff2?|ttf|otf|eot|ico|png|jpg|jpeg|gif|svg|webp)$/) !==
        null,
      handler: new StaleWhileRevalidate({
        cacheName: "static-assets",
      }),
    },
  ],
});

serwist.addEventListeners();
