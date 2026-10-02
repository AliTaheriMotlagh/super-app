import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const required=[
  'apps/api-gateway/src/app/auth.service.ts','apps/api-gateway/src/app/auth.guard.ts','libs/backend-core/src/lib/db.service.ts',
  'libs/backend-core/src/lib/domain.service.ts','libs/micro-app-runtime/src/lib/api.service.ts','Dockerfile.frontend','Dockerfile.backend','nginx.conf',
  'extensions/siktir-extension/manifest.json','extensions/tabdile-pool-extension/manifest.json'
];
for(const p of required){ if(!fs.existsSync(path.join(root,p))) throw new Error(`Missing ${p}`); }
const catalog=fs.readFileSync(path.join(root,'libs/contracts/src/lib/projects.ts'),'utf8');
const services=[...catalog.matchAll(/"service": "([^"]+)"/g)].map(x=>x[1]);
for(const service of new Set(services)){ if(!fs.existsSync(path.join(root,'apps',service,'src','main.ts'))) throw new Error(`Catalog references missing service: ${service}`); }
const domains=[...catalog.matchAll(/"domain": "([^"]+)"/g)].map(x=>x[1]);
for(const domain of new Set(domains)){ if(!fs.existsSync(path.join(root,'apps',`mfe-${domain}`,'federation.config.mjs'))) throw new Error(`Catalog references missing MFE: ${domain}`); }
const manifest=JSON.parse(fs.readFileSync(path.join(root,'apps/super-shell/public/federation.manifest.json'),'utf8'));
if(Object.keys(manifest).length!==new Set(domains).size) throw new Error('Production federation manifest does not cover every domain');
console.log(`Production structure OK: ${new Set(domains).size} MFEs, ${new Set(services).size} services, extensions present`);
