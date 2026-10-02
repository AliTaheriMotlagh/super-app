import { initFederation } from '@angular-architects/native-federation';
const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
initFederation(isLocal ? '/federation.manifest.dev.json' : '/federation.manifest.json')
  .then(() => import('./bootstrap'))
  .catch((error) => { console.error('Federation bootstrap failed', error); document.body.innerHTML = '<pre style="padding:2rem;color:#fff;background:#090b10">Failed to load Super App remotes. Check federation manifest and deployment paths.</pre>'; });
