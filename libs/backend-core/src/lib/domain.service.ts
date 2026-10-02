import { Inject, Injectable } from '@nestjs/common';
import { MICRO_APPS } from '@ali-labs/contracts';
import { DbService } from './db.service';
import { AppActionRequest, RecordCreateRequest, RecordDeleteRequest, RecordListRequest, RecordUpdateRequest } from './types';

@Injectable()
export class DomainService {
  constructor(private readonly db: DbService, @Inject('DOMAIN_SERVICE_NAME') readonly serviceName: string) {}

  health() { return { service: this.serviceName, ok: true, timestamp: new Date().toISOString() }; }
  projects() { return MICRO_APPS.filter((x) => x.service === this.serviceName).map(({ slug, title, pitch, kind }) => ({ slug, title, pitch, kind })); }
  list(p: RecordListRequest) { return this.db.list(this.serviceName, p.appSlug, p.userId, !!p.publicOnly); }
  create(p: RecordCreateRequest) { return this.db.create(this.serviceName, p.appSlug, p.userId, p.data, !!p.isPublic); }
  update(p: RecordUpdateRequest) { return this.db.update(this.serviceName, p.appSlug, p.userId, p.id, p.data, p.isPublic); }
  remove(p: RecordDeleteRequest) { return this.db.remove(this.serviceName, p.appSlug, p.userId, p.id); }

  async action(p: AppActionRequest) {
    const input = p.input || {};
    switch (`${p.appSlug}:${p.action}`) {
      case 'ghorekeshi:pick': {
        const raw = String(input['participants'] || '');
        const names = raw.split(/\n|,/).map((x) => x.trim()).filter(Boolean);
        return { winner: names.length ? names[Math.floor(Math.random() * names.length)] : null, count: names.length };
      }
      case 'mahale-gharar:midpoint': {
        const lat1=Number(input['lat1']), lng1=Number(input['lng1']), lat2=Number(input['lat2']), lng2=Number(input['lng2']);
        return { lat: (lat1+lat2)/2, lng: (lng1+lng2)/2 };
      }
      case 'tweet-playlist:parse': {
        const text = String(input['text'] || '');
        const tracks = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line, index) => {
          const [artist, ...rest] = line.split(/\s+-\s+/);
          const title=rest.length ? rest.join(' - ') : line; const artistName=rest.length ? artist : ''; const q=[artistName,title].filter(Boolean).join(' ');
          return { index, artist: artistName, title, spotifySearchUrl:`https://open.spotify.com/search/${encodeURIComponent(q)}`, youtubeSearchUrl:`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}` };
        });
        return { tracks };
      }
      case 'shared-investment:allocation': {
        const rows = await this.db.list(this.serviceName, p.appSlug, p.userId, false);
        const pledges = rows.map((r:any) => ({ person: String(r.data?.person || r.data?.description || 'Member'), amount: Number(r.data?.amount || 0) })).filter((x:any)=>x.amount>0);
        const total = pledges.reduce((sum:number,x:any)=>sum+x.amount,0);
        return { total, members: pledges.map((x:any)=>({ ...x, percentage: total ? +(x.amount/total*100).toFixed(2) : 0 })) };
      }
      case 'hesabdari:summary': {
        const rows = await this.db.list(this.serviceName, p.appSlug, p.userId, false);
        let income=0, expense=0;
        for (const r of rows as any[]) { const amount=Number(r.data?.amount||0); if(String(r.data?.type).toLowerCase()==='expense') expense+=amount; else income+=amount; }
        return { income, expense, balance: income-expense };
      }
      case 'building:summary': {
        const rows = await this.db.list(this.serviceName, p.appSlug, p.userId, false);
        const total=(rows as any[]).reduce((s,r)=>s+Number(r.data?.charge||0),0);
        const paid=(rows as any[]).filter(r=>String(r.data?.status).toLowerCase()==='paid').reduce((s,r)=>s+Number(r.data?.charge||0),0);
        return { total, paid, outstanding: total-paid, units: rows.length };
      }
      case 'birthday-social:upcoming': {
        const rows = await this.db.list(this.serviceName, p.appSlug, p.userId, false);
        const now = new Date();
        const upcoming=(rows as any[]).map((r)=>{
          const d=new Date(String(r.data?.date||''));
          if(Number.isNaN(d.getTime())) return null;
          let next=new Date(now.getFullYear(), d.getMonth(), d.getDate()); if(next<now) next=new Date(now.getFullYear()+1,d.getMonth(),d.getDate());
          return { id:r.id, person:r.data?.person, date:next.toISOString(), days:Math.ceil((next.getTime()-now.getTime())/86400000) };
        }).filter(Boolean).sort((a:any,b:any)=>a.days-b.days);
        return { upcoming };
      }
      case 'mantoraham:matches': {
        const rows = await this.db.query<any>('select user_id,data from app_records where service=$1 and app_slug=$2',[this.serviceName,p.appSlug]);
        const pairs=rows.map(r=>({userId:String(r.user_id),from:String(r.data?.from||'').trim().toLowerCase(),to:String(r.data?.to||'').trim().toLowerCase()}));
        const mine=pairs.filter(x=>x.userId===p.userId);
        const matches=mine.filter(a=>pairs.some(b=>b.userId!==p.userId&&a.from&&a.to&&a.from===b.to&&a.to===b.from));
        return { matches: [...new Set(matches.map(x=>[x.from,x.to].sort().join(' ↔ ')))] };
      }
      case 'gtavaghei:mission': {
        const missions=['Walk 500m and photograph something red','Find a public mural and check in','Visit a park and take a skyline photo','Walk to a place you have never entered before','Find three street signs with the same first letter'];
        return { mission: missions[Math.floor(Math.random()*missions.length)], xp: 100 };
      }
      case 'class-to-rahi:lesson': {
        const topic=String(input['topic']||'TypeScript'), minutes=Math.max(5,Math.min(60,Number(input['minutes']||15)));
        return { topic, minutes, plan:[`2 min: recall what you know about ${topic}`,`${Math.max(3,minutes-7)} min: learn one focused concept`,`3 min: solve one tiny exercise`,`2 min: write a one-sentence summary`] };
      }
      case 'diet-order:meal': {
        const target=Number(input['calories']||600);
        const meals=[{name:'Chicken rice bowl',calories:620,protein:42},{name:'Salmon salad',calories:510,protein:35},{name:'Veggie burrito bowl',calories:680,protein:24},{name:'Greek chicken wrap',calories:560,protein:38},{name:'Egg & avocado sandwich',calories:470,protein:22}];
        return meals.sort((a,b)=>Math.abs(a.calories-target)-Math.abs(b.calories-target))[0];
      }
      case 'tree-donate:trees': {
        const amount=Math.max(0,Number(input['amount']||0)); const price=Math.max(1,Number(process.env.TREE_PRICE||10));
        return { amount, treePrice: price, trees: Math.floor(amount/price) };
      }
      case 'dozdgir:risk': {
        const real=String(input['realProfile']||'').toLowerCase(), suspect=String(input['suspectProfile']||'').toLowerCase(), evidence=String(input['evidence']||'').toLowerCase();
        let score=0; if(real&&suspect&&real!==suspect) score+=20; if(/copy|stolen|imperson|fake|دزد|فیک/.test(evidence)) score+=35; if(/money|payment|crypto|card|پول|کارت/.test(evidence)) score+=25; if(/dm|message|پیام/.test(evidence)) score+=10;
        return { score: Math.min(score,100), level: score>=60?'high':score>=30?'medium':'low', note:'This is an evidence checklist, not an identity determination.' };
      }

      case 'wiki-fa:translate': {
        const title=String(input['title']||input['text']||'').trim(); if(!title) return {title:'',source:'',translation:''};
        const wiki=await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,{headers:{'User-Agent':'AliSuperApp/1.0'},signal:AbortSignal.timeout(10000)}); if(!wiki.ok) throw new Error(`Wikipedia returned ${wiki.status}`);
        const summary:any=await wiki.json(); const source=String(summary.extract||''); let translation=''; let provider='source-only';
        const translateUrl=process.env.TRANSLATE_URL;
        if(translateUrl && source){ const tr=await fetch(translateUrl,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({q:source,source:'en',target:'fa',format:'text'}),signal:AbortSignal.timeout(20000)}); if(tr.ok){const data:any=await tr.json();translation=String(data.translatedText||'');provider='configured-translate-provider';} }
        return {title:summary.title||title,source,translation,provider,wikipediaUrl:summary.content_urls?.desktop?.page||null};
      }
      case 'jaa:nearby':
      case 'restaurant-explorer:nearby': {
        const lat=Number(input['lat']), lng=Number(input['lng']), radius=Math.max(100,Math.min(5000,Number(input['radius']||1500))); if(!Number.isFinite(lat)||!Number.isFinite(lng)) throw new Error('lat/lng required');
        const q=`[out:json][timeout:15];(node["amenity"="restaurant"](around:${radius},${lat},${lng});way["amenity"="restaurant"](around:${radius},${lat},${lng});relation["amenity"="restaurant"](around:${radius},${lat},${lng}););out center tags 40;`;
        const response=await fetch('https://overpass-api.de/api/interpreter',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','User-Agent':'AliSuperApp/1.0'},body:'data='+encodeURIComponent(q),signal:AbortSignal.timeout(20000)}); if(!response.ok) throw new Error(`OpenStreetMap provider returned ${response.status}`);
        const data:any=await response.json(); const restaurants=(data.elements||[]).map((e:any)=>({id:e.type+':'+e.id,name:e.tags?.name||'Unnamed restaurant',cuisine:e.tags?.cuisine||'',lat:e.lat??e.center?.lat,lng:e.lon??e.center?.lon,address:[e.tags?.['addr:street'],e.tags?.['addr:housenumber']].filter(Boolean).join(' ')})).filter((x:any)=>Number.isFinite(x.lat)&&Number.isFinite(x.lng));
        return {restaurants};
      }

      case 'tabdile-pool:convert': {
        const amount=Number(input['amount']||0), from=String(input['from']||'USD').toUpperCase(), to=String(input['to']||'EUR').toUpperCase();
        if(from===to) return { amount, from, to, rate:1, result:amount };
        const url=`https://api.frankfurter.app/latest?amount=${encodeURIComponent(String(amount||1))}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
        const response=await fetch(url,{signal:AbortSignal.timeout(8000)}); if(!response.ok) throw new Error(`FX provider returned ${response.status}`);
        const data:any=await response.json(); return { amount, from, to, result:data.rates?.[to] ?? null, date:data.date };
      }
      default:
        return { ok: true, appSlug: p.appSlug, action: p.action, input };
    }
  }
}
