import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService, AppRecord } from '@ali-labs/runtime';
import { MICRO_APP_BY_SLUG } from '@ali-labs/contracts';

@Component({selector:'ali-public',standalone:true,imports:[CommonModule,RouterLink],template:`
<main><a routerLink="/">← Super App</a>@if(app){<header><small>PUBLIC VIEW</small><h1>{{app.title}}</h1><p>{{app.pitch}}</p></header>}
@if(error()){<div class="error">{{error()}}</div>}<section class="grid">@for(r of records();track r.id){<article><h2>{{title(r)}}</h2><p>{{details(r)}}</p>@if(contact(r);as c){<a [href]="safeLink(c)" target="_blank" rel="noopener">Contact / open ↗</a>}@if(media(r);as u){<a [href]="safeLink(u)" target="_blank" rel="noopener">Open media ↗</a>}</article>}@empty{<p>No public records yet.</p>}</section></main>
`,styles:[`:host{display:block;min-height:100vh;background:#080a0f;color:#f6f7fb;font:15px system-ui}main{max-width:1100px;margin:auto;padding:30px 18px}a{color:#9eb0ff}header{padding:35px 0}small{color:#8ea7ff}h1{font-size:clamp(42px,8vw,82px);letter-spacing:-.05em;margin:8px 0}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px}article{border:1px solid #2a3140;background:#11151d;border-radius:18px;padding:16px}article p{color:#a9b1bf;white-space:pre-wrap}.error{color:#ff9aa7}`]})
export class PublicComponent{
 private route=inject(ActivatedRoute); private api=inject(ApiService); slug=this.route.snapshot.paramMap.get('slug')||''; app=MICRO_APP_BY_SLUG.get(this.slug);records=signal<AppRecord[]>([]);error=signal('');
 constructor(){this.api.publicRecords(this.slug).then(x=>this.records.set(x)).catch(e=>this.error.set(e.message));}
 title(r:AppRecord){const d:any=r.data;return String(d.product||d.item||d.artist||d.need||d.restaurant||d.venue||d.book||d.film||d.name||d.message||'Public item');}
 details(r:AppRecord){return Object.entries(r.data).filter(([k])=>!['contact','url','audioUrl'].includes(k)).map(([k,v])=>`${k}: ${String(v)}`).join(' · ');}
 contact(r:AppRecord){const d:any=r.data;return d.contact||'';} media(r:AppRecord){const d:any=r.data;return d.url||d.audioUrl||'';}
 safeLink(v:string){const s=String(v||'').trim();return /^(https?:|mailto:|tel:)/i.test(s)?s:`https://${s}`;}
}
