import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import 'prismjs';
import 'prismjs/components/prism-typescript.min.js';
import 'prismjs/plugins/line-numbers/prism-line-numbers.js';
import 'prismjs/plugins/line-highlight/prism-line-highlight.js';
import { inject } from '@vercel/analytics';
// Robust Electron detection: requires BOTH the file:// protocol AND window.require
// (window.require is injected by Electron when nodeIntegration:true, never present in browsers)
const isElectronRuntime = window.location.protocol === 'file:' && typeof (window as any).require === 'function';

if (environment.production) {
  // Vercel Analytics: web only
  if (!isElectronRuntime) {
    inject();
  }
  enableProdMode();
}

// Unregister old SWs ONLY inside Electron to fix 504 errors on file:// protocol
// On the web this block must never run so existing push subscriptions are preserved
if (isElectronRuntime && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => registration.unregister());
  });
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
