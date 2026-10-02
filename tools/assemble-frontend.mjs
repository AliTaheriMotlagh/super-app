import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd(), out=path.join(root,'dist','deploy');
fs.rmSync(out,{recursive:true,force:true}); fs.mkdirSync(out,{recursive:true});
const source=(name)=>{const p=path.join(root,'dist','apps',name);for(const candidate of [path.join(p,'browser'),p]){if(fs.existsSync(path.join(candidate,'index.html'))||fs.existsSync(path.join(candidate,'remoteEntry.json')))return candidate;}throw new Error(`Cannot find build output for ${name}`);};
const copy=(src,dst)=>fs.cpSync(src,dst,{recursive:true});
copy(source('super-shell'),out);
for(const name of ['mfe-commerce','mfe-finance','mfe-games','mfe-impact','mfe-life','mfe-local','mfe-media','mfe-social','mfe-utilities']){const dst=path.join(out,'remotes',name);fs.mkdirSync(dst,{recursive:true});copy(source(name),dst);}
console.log('Frontend deployment assembled:',out);
