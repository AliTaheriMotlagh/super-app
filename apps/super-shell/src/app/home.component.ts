import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MICRO_APPS } from '@ali-labs/contracts';
@Component({selector:'ali-home',standalone:true,imports:[FormsModule,RouterLink],template:`
<main><header><span>ALI SUPER APP</span><h1>44 tiny products.<br>One platform.</h1><p>Angular micro-frontends + NestJS domain microservices.</p></header>
<div class="toolbar"><input [(ngModel)]="query" placeholder="Search micro-apps…"></div>
<section class="grid">@for (p of filtered(); track p.slug) {<article><small>{{p.domain}} · {{p.service}}</small><h2>{{p.title}}</h2><p>{{p.pitch}}</p><a [routerLink]="['/apps',p.domain,p.slug]">Open MVP →</a></article>}</section></main>`,styles:[`
:host{display:block;min-height:100vh;background:radial-gradient(circle at 20% 0,#18203a,transparent 35%),#080a0f;color:#f7f8fc;font-family:Inter,system-ui,sans-serif}main{max-width:1320px;margin:auto;padding:34px 18px 80px}header{padding:35px 0}header span,small{color:#8ea6ff;font-weight:700}h1{font-size:clamp(48px,8vw,100px);letter-spacing:-.065em;line-height:.88;margin:10px 0 24px}header p{color:#9aa5b7;font-size:18px}.toolbar{position:sticky;top:0;padding:12px 0;background:#080a0fee;z-index:3}input{width:100%;padding:14px 16px;border:1px solid #293143;border-radius:15px;background:#0e121a;color:#fff}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px}article{border:1px solid #262d3b;border-radius:20px;padding:18px;background:linear-gradient(#151a24,#10141c);min-height:210px;display:flex;flex-direction:column}h2{font-size:22px;margin:12px 0 7px}article p{color:#9fa8b7;margin:0 0 16px}article a{margin-top:auto;color:#fff;text-decoration:none;font-weight:800}`]})
export class HomeComponent { query=''; filtered(){const q=this.query.toLowerCase();return MICRO_APPS.filter(p=>!q||(p.title+' '+p.pitch+' '+p.domain).toLowerCase().includes(q));}}
