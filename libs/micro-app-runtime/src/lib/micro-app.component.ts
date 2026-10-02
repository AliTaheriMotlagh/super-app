import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, DestroyRef, ElementRef, ViewChild, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MICRO_APP_BY_SLUG, MicroAppDefinition } from '@ali-labs/contracts';
import { ApiService, AppRecord } from './api.service';

@Component({
  selector: 'ali-micro-app', standalone: true, imports: [CommonModule, FormsModule, RouterLink],
  template: `
  @if (app(); as p) {
    <article class="page">
      <nav class="topbar">
        <a routerLink="/" class="back">← Super App</a>
        <div class="authmini">
          @if (api.user(); as u) { <span>{{u.displayName}}</span><button class="ghost" (click)="api.logout()">Log out</button> }
        </div>
      </nav>
      <header><span>{{p.domain}} · {{p.service}}</span><h1>{{p.title}}</h1><p>{{p.pitch}}</p></header>

      @if (!api.authenticated && p.kind !== 'shipped') {
        <section class="workbench authbox">
          <h2>{{ authMode() === 'login' ? 'Sign in' : 'Create account' }}</h2>
          <p class="meta">Your records are stored in PostgreSQL through the NestJS API. Sign in to use this app.</p>
          @if (authMode() === 'register') { <input [(ngModel)]="displayName" placeholder="Display name"> }
          <input [(ngModel)]="email" type="email" placeholder="Email">
          <input [(ngModel)]="password" type="password" placeholder="Password (8+ characters)">
          <div class="row compact"><button (click)="submitAuth()" [disabled]="busy()">{{authMode()==='login'?'Sign in':'Register'}}</button><button class="secondary" (click)="authMode.set(authMode()==='login'?'register':'login')">{{authMode()==='login'?'Create account':'I have an account'}}</button></div>
          @if (error()) { <div class="error">{{error()}}</div> }
        </section>
      } @else {
        <section class="workbench">
          @switch (p.kind) {
            @case ('wheel') {
              <textarea [(ngModel)]="scratch" placeholder="Names, one per line"></textarea>
              <button (click)="runAction('pick',{participants:scratch})" [disabled]="busy()">Spin securely</button>
              @if (actionResult()?.winner) { <div class="result">🎯 {{actionResult().winner}}</div> }
            }
            @case ('converter') {
              <div class="fields three"><input type="number" [(ngModel)]="amount" placeholder="Amount"><input [(ngModel)]="fromCurrency" placeholder="From e.g. USD"><input [(ngModel)]="toCurrency" placeholder="To e.g. EUR"></div>
              <button (click)="convertCurrency()" [disabled]="busy()">Get live rate</button>
              @if (actionResult()?.result !== undefined) { <div class="result">{{amount}} {{fromCurrency.toUpperCase()}} → {{actionResult().result | number:'1.0-2'}} {{toCurrency.toUpperCase()}}</div><div class="meta">Rate date: {{actionResult().date || 'live provider'}}</div> }
            }
            @case ('writer') {
              @if (p.slug === 'wiki-fa') {
                <input [(ngModel)]="form['title']" placeholder="English Wikipedia article title e.g. Alan Turing"><button (click)="translateWiki()">Fetch + translate to Persian</button>
                @if (actionResult()?.source) { <h3>{{actionResult().title}}</h3><p class="sourceText">{{actionResult().source}}</p>@if(actionResult().translation){<div class="translation" dir="rtl">{{actionResult().translation}}</div>}@else{<p class="meta">Translation provider is not configured. Set TRANSLATE_URL (LibreTranslate-compatible) in production.</p>} }
              } @else {
                <textarea class="writer" [(ngModel)]="scratch" placeholder="Start writing…"></textarea>
                <div class="row compact"><button (click)="saveWriter()" [disabled]="busy()">Save document</button><span class="meta">{{wordCount()}} words</span></div>
                <ng-container *ngTemplateOutlet="recordsTpl" />
              }
            }
            @case ('dog') {
              <div class="dogtrack"><span class="dog" [style.left.%]="dogPos()">🐕</span><span class="spot">🌳</span></div>
              <div class="row compact"><button (click)="moveDog()">Move dog</button><button class="secondary" (click)="resetDog()">Reset</button></div>
              <div class="meta">Reach the tree. Position {{dogPos()}}%</div>
              @if (dogWon()) { <div class="result">Found the spot! 🐕💨</div> }
            }
            @case ('score') {
              <div class="flight"><div class="horizon" [style.transform]="'translateY('+(50-landingScore/2)+'px)'"></div><div class="plane">✈️</div></div>
              <label>Landing quality <input type="range" min="0" max="100" [(ngModel)]="landingScore"></label>
              <div class="result">{{landingScore}} / 100</div><button (click)="saveScore()">Save flight</button>
              <ng-container *ngTemplateOutlet="recordsTpl" />
            }
            @case ('audio') {
              <input type="file" accept="audio/*" (change)="loadAudio($event)">
              @if (audioUrl()) {
                <audio #audio [src]="audioUrl()" controls crossorigin="anonymous"></audio>
                <div class="fields"><label>High-pass Hz<input type="range" min="20" max="500" [(ngModel)]="highpass"></label><label>Low-pass Hz<input type="range" min="3000" max="18000" [(ngModel)]="lowpass"></label></div>
                <button (click)="enableAudioCleanup()">Apply live cleanup</button><p class="meta">Runs a real Web Audio high-pass + low-pass + compressor chain in the browser.</p>
              }
            }
            @case ('midpoint') {
              <div class="fields four"><input type="number" [(ngModel)]="lat1" placeholder="lat 1"><input type="number" [(ngModel)]="lng1" placeholder="lng 1"><input type="number" [(ngModel)]="lat2" placeholder="lat 2"><input type="number" [(ngModel)]="lng2" placeholder="lng 2"></div>
              <button (click)="runAction('midpoint',{lat1,lng1,lat2,lng2})">Calculate midpoint</button>
              @if (actionResult()?.lat !== undefined) { <div class="result">{{actionResult().lat | number:'1.5-5'}}, {{actionResult().lng | number:'1.5-5'}}</div><a class="buttonLink secondary" target="_blank" [href]="mapUrl(actionResult().lat,actionResult().lng)">Open on map ↗</a> }
            }
            @case ('countdown') {
              <input type="file" (change)="pickTimedFile($event)"><input type="datetime-local" [(ngModel)]="unlockAt"><button (click)="uploadTimed()" [disabled]="busy() || !timedFile">Upload locked file</button>
              @if (timedUpload()) { <div class="result">🔐 File uploaded</div><p class="meta">Share ID: <code>{{timedUpload().id}}</code> · unlock {{timedUpload().unlockAt | date:'medium'}}</p><a class="buttonLink secondary" [routerLink]="['/file',timedUpload().id]">Open share page</a> }
            }
            @case ('grid') {
              <div class="fields"><input type="number" min="1" max="12" [(ngModel)]="cols"><input type="number" min="1" max="12" [(ngModel)]="rows"></div>
              <div class="cameraWrap"><video #cameraVideo autoplay muted playsinline></video><div class="gridOverlay" [style.--cols]="cols" [style.--rows]="rows"></div></div>
              <canvas #cameraCanvas hidden></canvas>
              <div class="row compact"><button (click)="startCamera()">Start camera</button><button (click)="capturePhoto()">Capture</button><button class="secondary" (click)="stopCamera()">Stop</button></div>
              @if (captureUrl()) { <img class="capture" [src]="captureUrl()" alt="Captured frame"> }
            }
            @case ('counter') {
              <input type="number" [(ngModel)]="amount" placeholder="Donation pledge"><button (click)="calculateTrees()">Calculate trees</button>
              @if (actionResult()?.trees !== undefined) { <div class="result">🌳 {{actionResult().trees}} trees</div><button class="secondary" (click)="saveTreePledge()">Save pledge</button> }
              <ng-container *ngTemplateOutlet="recordsTpl" />
            }
            @case ('playlist') {
              <textarea [(ngModel)]="scratch" placeholder="Artist - Song, one per line"></textarea><button (click)="generatePlaylist()">Generate playlist</button>
              @if (actionResult()?.tracks; as tracks) { <div class="items">@for (t of tracks; track t.index) { <div class="item"><div><b>{{t.title}}</b><span>{{t.artist}}</span></div><div class="row compact"><a class="buttonLink secondary" target="_blank" [href]="t.spotifySearchUrl">Spotify</a><a class="buttonLink secondary" target="_blank" [href]="t.youtubeSearchUrl">YouTube</a></div></div> }</div> }
            }
            @case ('shipped') {
              <div class="result">Shipped project ✓</div>@if (p.repoUrl) { <a class="buttonLink" [href]="p.repoUrl" target="_blank">Open GitHub ↗</a> } @else { <p class="meta">This shipped item is catalogued here; attach its repository URL when available.</p> }
            }
            @default {
              @if (p.slug === 'gtavaghei') { <button (click)="runAction('mission',{})">Generate real-world mission</button>@if(actionResult()?.mission){<div class="result">🎮 {{actionResult().mission}}</div><p class="meta">Reward {{actionResult().xp}} XP</p>} }
              @if (p.slug === 'class-to-rahi') { <div class="fields"><input [(ngModel)]="form['topic']" placeholder="Topic"><input type="number" [(ngModel)]="form['minutes']" placeholder="Commute minutes"></div><button (click)="runAction('lesson',form)">Build commute lesson</button>@if(actionResult()?.plan){<div class="items">@for(step of actionResult().plan;track step){<div class="item"><span>{{step}}</span></div>}</div>} }
              @if (p.slug === 'diet-order') { <input type="number" [(ngModel)]="form['calories']" placeholder="Target calories"><button (click)="runAction('meal',form)">Find closest meal</button>@if(actionResult()?.name){<div class="result">{{actionResult().name}}</div><p class="meta">{{actionResult().calories}} kcal · {{actionResult().protein}}g protein</p>} }
              @if (p.slug === 'dozdgir') { <button class="secondary" (click)="runAction('risk',form)">Analyze evidence checklist</button>@if(actionResult()?.level){<div class="result">Risk checklist: {{actionResult().level}} ({{actionResult().score}}/100)</div><p class="meta">{{actionResult().note}}</p>} }
              @if (p.slug === 'shared-investment') { <button class="secondary" (click)="runAction('allocation',{})">Calculate ownership</button>@if(actionResult()?.members){<div class="items">@for(m of actionResult().members;track m.person){<div class="item"><b>{{m.person}}</b><span>{{m.amount}} · {{m.percentage}}%</span></div>}</div>} }
              @if (p.slug === 'hesabdari') { <button class="secondary" (click)="runAction('summary',{})">Refresh account summary</button>@if(actionResult()?.balance !== undefined){<div class="stats"><b>Income {{actionResult().income}}</b><b>Expense {{actionResult().expense}}</b><b>Balance {{actionResult().balance}}</b></div>} }
              @if (p.slug === 'building') { <button class="secondary" (click)="runAction('summary',{})">Building summary</button>@if(actionResult()?.units !== undefined){<div class="stats"><b>{{actionResult().units}} units</b><b>Paid {{actionResult().paid}}</b><b>Outstanding {{actionResult().outstanding}}</b></div>} }
              @if (p.slug === 'birthday-social') { <button class="secondary" (click)="runAction('upcoming',{})">Upcoming birthdays</button>@if(actionResult()?.upcoming){<div class="items">@for(x of actionResult().upcoming;track x.id){<div class="item"><b>{{x.person}}</b><span>{{x.days}} days</span></div>}</div>} }
              @if (p.slug === 'mantoraham') { <button class="secondary" (click)="runAction('matches',{})">Reveal mutual matches</button>@if(actionResult()?.matches){<div class="result">{{actionResult().matches.length}} mutual match(es)</div><div class="meta">{{actionResult().matches.join(', ')}}</div>} }
              @if (p.slug === 'jaa' || p.slug === 'restaurant-explorer') { <button class="secondary" (click)="findNearbyRestaurants()">Use my location · find restaurants</button>@if(actionResult()?.restaurants){<div class="items">@for(r of actionResult().restaurants;track r.id){<div class="item"><div><b>{{r.name}}</b><span>{{r.cuisine || r.address || 'Restaurant'}}</span></div><a class="buttonLink secondary" target="_blank" [href]="mapUrl(r.lat,r.lng)">Map</a></div>}</div>} }
              @if (p.slug === 'msg-location') { <button class="secondary" (click)="checkLocationMessages()">Check messages near me</button>@if(actionResult()?.nearby){<div class="items">@for(m of actionResult().nearby;track m.id){<div class="item"><b>{{m.message}}</b><span>{{m.distance | number:'1.0-0'}} m away</span></div>}</div>} }
              @if (p.slug === 'food-on-time') { <button class="secondary" (click)="armFoodReminder()">Arm browser reminder for this order</button> }
              @if (p.slug === 'silent-zang-khor') { <p class="meta">The web app manages silent-mode rules. Actual phone call silencing requires the Android native companion because browsers cannot change OS call interruption policy.</p> }

              @if (p.slug !== 'class-to-rahi' && p.slug !== 'diet-order') {
                <div class="fields" [class.three]="p.fields.length===3" [class.four]="p.fields.length>=4">
                  @for (field of p.fields; track field) {
                    <label>{{label(field)}}<input [type]="fieldType(field)" [(ngModel)]="form[field]" [placeholder]="label(field)"></label>
                  }
                </div>
              }
              <div class="row compact"><button (click)="saveGeneric()" [disabled]="busy()">{{p.kind==='habit'?'Add / check in':'Save'}}</button>@if(canPublic(p)){<label class="check"><input type="checkbox" [(ngModel)]="isPublic"> public</label><a class="buttonLink secondary" [routerLink]="['/public',p.slug]">Public page</a>}</div>
              <ng-container *ngTemplateOutlet="recordsTpl" />
            }
          }
          @if (busy()) { <div class="meta">Working…</div> }
          @if (error()) { <div class="error">{{error()}}</div> }
        </section>
      }

      <ng-template #recordsTpl>
        <div class="items">@for (item of records(); track item.id) { <div class="item record"><div><b>{{recordTitle(item)}}</b><span>{{recordDetails(item)}}</span><small>{{item.createdAt | date:'short'}}</small></div><button class="ghost" (click)="remove(item.id)">×</button></div>}</div>
      </ng-template>
    </article>
  } @else { <div class="missing">Unknown micro-app.</div> }
  `,
  styles: [`
  :host{display:block;min-height:100vh;background:#080a0f;color:#f6f7fb;font-family:Inter,system-ui,sans-serif}.page{max-width:980px;margin:auto;padding:22px 18px 70px}.topbar{display:flex;justify-content:space-between;align-items:center}.back{color:#98a5ff;text-decoration:none}.authmini{display:flex;align-items:center;gap:10px;color:#aab2c0}header{padding:40px 0 22px}header>span,.meta,small{color:#8f98aa;font-size:13px}h1{font-size:clamp(40px,8vw,82px);line-height:.95;letter-spacing:-.055em;margin:8px 0 14px}header p{color:#a8b0bf;font-size:18px;max-width:680px}.workbench{background:#11151d;border:1px solid #252b37;border-radius:24px;padding:20px}.authbox{max-width:560px}.fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.fields.three{grid-template-columns:repeat(3,minmax(0,1fr))}.fields.four{grid-template-columns:repeat(4,minmax(0,1fr))}label{display:grid;gap:4px;color:#aeb6c4;font-size:12px}input,textarea,select{width:100%;background:#090c12;color:#fff;border:1px solid #2b3342;border-radius:13px;padding:13px;margin:6px 0}input[type=checkbox]{width:auto}textarea{min-height:120px;resize:vertical}.writer{min-height:360px;direction:auto}button,.buttonLink{display:inline-block;background:#91a8ff;color:#09101d;border:0;border-radius:13px;padding:12px 15px;font-weight:800;text-decoration:none;margin:6px 0;cursor:pointer}.secondary{background:#20283a;color:#f4f6fb;border:1px solid #313a4e}.ghost{background:transparent;color:#ff9ba6;border:1px solid #422b31;padding:7px 10px}.row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.compact>*{flex:0 0 auto}.result{font-size:26px;font-weight:800;margin:18px 0}.items{display:grid;gap:8px;margin-top:16px}.item{display:flex;justify-content:space-between;gap:12px;align-items:center;border:1px solid #242b37;background:#0c1017;border-radius:14px;padding:12px}.item>div{display:grid;gap:3px}.item span{color:#9ca6b7}.record small{color:#697386}.error{margin-top:12px;color:#ff9ba6;background:#35171d;border:1px solid #67303a;border-radius:12px;padding:10px}.dogtrack{height:90px;border:1px solid #283141;border-radius:18px;position:relative;overflow:hidden;margin:14px 0}.dog{position:absolute;top:22px;font-size:38px;transition:left .2s}.spot{position:absolute;right:12px;top:22px;font-size:38px}.cameraWrap{position:relative;aspect-ratio:4/3;overflow:hidden;border-radius:18px;background:#05070a;border:1px solid #303747}.cameraWrap video{width:100%;height:100%;object-fit:cover}.gridOverlay{pointer-events:none;position:absolute;inset:0;background-image:linear-gradient(to right,#ffffff88 1px,transparent 1px),linear-gradient(to bottom,#ffffff88 1px,transparent 1px);background-size:calc(100% / var(--cols)) 100%,100% calc(100% / var(--rows))}.capture{width:100%;margin-top:14px;border-radius:16px}audio{width:100%;margin:14px 0}.flight{height:220px;position:relative;overflow:hidden;background:linear-gradient(#356ca7 0 50%,#3c422f 50%);border-radius:18px;border:1px solid #31405a}.plane{position:absolute;left:50%;top:45%;font-size:42px;transform:translate(-50%,-50%)}.horizon{position:absolute;left:0;right:0;top:50%;height:5px;background:#fff8;transition:.2s}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0}.sourceText{color:#c3cad6;line-height:1.8}.translation{font-size:18px;line-height:2;background:#0b0f16;border:1px solid #293142;border-radius:15px;padding:16px;margin-top:12px}.stats b{background:#0b0f16;border:1px solid #252d3b;border-radius:12px;padding:12px}.check{display:flex;align-items:center;gap:6px}.missing{padding:60px}code{user-select:all}@media(max-width:700px){.fields,.fields.three,.fields.four,.stats{grid-template-columns:1fr}.item{align-items:flex-start}.topbar{gap:8px}.authmini span{display:none}}
  `]
})
export class MicroAppComponent implements AfterViewInit {
  readonly route = inject(ActivatedRoute);
  readonly api = inject(ApiService);
  readonly destroyRef = inject(DestroyRef);
  readonly slug = signal('');
  readonly app = computed(() => MICRO_APP_BY_SLUG.get(this.slug()) ?? null);
  readonly records = signal<AppRecord[]>([]);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly actionResult = signal<any>(null);
  readonly authMode = signal<'login'|'register'>('login');
  readonly dogPos = signal(4);
  readonly dogWon = signal(false);
  readonly audioUrl = signal('');
  readonly timedUpload = signal<any>(null);
  readonly captureUrl = signal('');
  form: Record<string, any> = {};
  scratch=''; email=''; password=''; displayName=''; amount=1; fromCurrency='USD'; toCurrency='EUR'; lat1=0;lng1=0;lat2=0;lng2=0;cols=3;rows=3; landingScore=50; highpass=80; lowpass=12000; unlockAt=''; timedFile:File|null=null; isPublic=false;
  private cameraStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private audioSource: MediaElementAudioSourceNode | null = null;
  private highpassNode: BiquadFilterNode | null = null;
  private lowpassNode: BiquadFilterNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  @ViewChild('cameraVideo') cameraVideo?: ElementRef<HTMLVideoElement>;
  @ViewChild('cameraCanvas') cameraCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('audio') audioElement?: ElementRef<HTMLAudioElement>;

  constructor(){
    this.route.paramMap.subscribe((params)=>{const s=params.get('slug') || String(this.route.snapshot.data['slug']||''); this.slug.set(s); this.form={}; this.actionResult.set(null); if(this.api.authenticated) void this.loadRecords();});
    this.destroyRef.onDestroy(()=>{this.stopCamera(); if(this.audioContext) void this.audioContext.close(); if(this.audioUrl()) URL.revokeObjectURL(this.audioUrl());});
  }
  ngAfterViewInit(){}

  async submitAuth(){ await this.run(async()=>{ if(this.authMode()==='register') await this.api.register(this.email,this.password,this.displayName); else await this.api.login(this.email,this.password); await this.loadRecords(); }); }
  async loadRecords(){ if(!this.api.authenticated || !this.slug()) return; await this.run(async()=>this.records.set(await this.api.records(this.slug())),false); }
  async saveGeneric(){ const p=this.app(); if(!p)return; const data={...this.form}; if(p.kind==='habit') data['completedAt']=new Date().toISOString(); await this.run(async()=>{await this.api.create(p.slug,data,this.isPublic); this.form={}; await this.loadRecords();}); }
  async saveWriter(){ if(!this.scratch.trim())return; await this.run(async()=>{await this.api.create(this.slug(),{text:this.scratch,words:this.wordCount()}); await this.loadRecords();}); }
  async saveScore(){ await this.run(async()=>{await this.api.create(this.slug(),{score:Number(this.landingScore),date:new Date().toISOString()});await this.loadRecords();}); }
  async remove(id:string){ await this.run(async()=>{await this.api.remove(this.slug(),id);await this.loadRecords();}); }
  async runAction(action:string,input:Record<string,unknown>){ await this.run(async()=>this.actionResult.set(await this.api.action(this.slug(),action,input))); }
  async convertCurrency(){await this.runAction('convert',{amount:Number(this.amount),from:this.fromCurrency,to:this.toCurrency});}
  async calculateTrees(){await this.runAction('trees',{amount:Number(this.amount)});}

  async translateWiki(){ await this.runAction('translate',{title:String(this.form['title']||'')}); }
  async armFoodReminder(){ const when=String(this.form['time']||''); const meal=String(this.form['meal']||'Your scheduled meal'); if(!when){this.error.set('Choose a time first');return;} if(!('Notification' in window)){this.error.set('Browser notifications are unavailable');return;} const permission=await Notification.requestPermission(); if(permission!=='granted'){this.error.set('Notification permission was not granted');return;} const delay=new Date(when).getTime()-Date.now(); if(delay<=0){new Notification(meal,{body:'Scheduled food order is due now.'});return;} setTimeout(()=>new Notification(meal,{body:'Your scheduled food order is due.'}),Math.min(delay,2147483647)); this.actionResult.set({armed:true,when}); }
  async findNearbyRestaurants(){ await this.run(async()=>{const pos=await this.currentPosition(); this.actionResult.set(await this.api.action(this.slug(),'nearby',{lat:pos.coords.latitude,lng:pos.coords.longitude,radius:1500}));}); }
  async checkLocationMessages(){ await this.run(async()=>{const pos=await this.currentPosition(); const rows=await this.api.publicRecords('msg-location'); const here={lat:pos.coords.latitude,lng:pos.coords.longitude}; const nearby=rows.map((r:any)=>{const raw=String(r.data?.coordinate||''); const [lat,lng]=raw.split(',').map(Number); const distance=this.distanceMeters(here.lat,here.lng,lat,lng); return {id:r.id,message:r.data?.message,distance,radius:Number(r.data?.radius||100)};}).filter((x:any)=>Number.isFinite(x.distance)&&x.distance<=x.radius).sort((a:any,b:any)=>a.distance-b.distance); this.actionResult.set({nearby});}); }
  private currentPosition(){return new Promise<GeolocationPosition>((resolve,reject)=>navigator.geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:true,timeout:10000,maximumAge:30000}));}
  private distanceMeters(lat1:number,lng1:number,lat2:number,lng2:number){const R=6371000,rad=Math.PI/180,dLat=(lat2-lat1)*rad,dLng=(lng2-lng1)*rad;const a=Math.sin(dLat/2)**2+Math.cos(lat1*rad)*Math.cos(lat2*rad)*Math.sin(dLng/2)**2;return 2*R*Math.asin(Math.sqrt(a));}
  async saveTreePledge(){await this.run(async()=>{await this.api.create(this.slug(),{amount:Number(this.amount),trees:this.actionResult()?.trees});await this.loadRecords();});}
  async generatePlaylist(){await this.runAction('parse',{text:this.scratch});}
  wordCount(){return this.scratch.trim()?this.scratch.trim().split(/\s+/).length:0;}
  moveDog(){ if(this.dogWon())return; this.dogPos.update(p=>Math.min(90,p+Math.ceil(Math.random()*18))); if(this.dogPos()>=90){this.dogWon.set(true); if(this.api.authenticated) void this.api.create(this.slug(),{score:100,wonAt:new Date().toISOString()}).then(()=>this.loadRecords());} }
  resetDog(){this.dogPos.set(4);this.dogWon.set(false);}
  mapUrl(lat:number,lng:number){return `https://www.openstreetmap.org/?mlat=${encodeURIComponent(String(lat))}&mlon=${encodeURIComponent(String(lng))}#map=15/${lat}/${lng}`;}
  pickTimedFile(e:Event){this.timedFile=(e.target as HTMLInputElement).files?.[0]||null;}
  async uploadTimed(){if(!this.timedFile||!this.unlockAt)return;await this.run(async()=>this.timedUpload.set(await this.api.uploadTimedFile(this.timedFile!,this.unlockAt)));}
  loadAudio(e:Event){const f=(e.target as HTMLInputElement).files?.[0];if(!f)return;if(this.audioUrl())URL.revokeObjectURL(this.audioUrl());this.audioUrl.set(URL.createObjectURL(f));}
  async enableAudioCleanup(){const el=this.audioElement?.nativeElement;if(!el)return; if(!this.audioContext){this.audioContext=new AudioContext();this.audioSource=this.audioContext.createMediaElementSource(el);this.highpassNode=this.audioContext.createBiquadFilter();this.highpassNode.type='highpass';this.lowpassNode=this.audioContext.createBiquadFilter();this.lowpassNode.type='lowpass';this.compressor=this.audioContext.createDynamicsCompressor();this.audioSource.connect(this.highpassNode).connect(this.lowpassNode).connect(this.compressor).connect(this.audioContext.destination);}this.highpassNode!.frequency.value=Number(this.highpass);this.lowpassNode!.frequency.value=Number(this.lowpass);await this.audioContext.resume();void el.play();}
  async startCamera(){this.stopCamera();try{this.cameraStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'},audio:false});if(this.cameraVideo)this.cameraVideo.nativeElement.srcObject=this.cameraStream;}catch(e:any){this.error.set(e?.message||'Camera permission failed');}}
  capturePhoto(){const v=this.cameraVideo?.nativeElement,c=this.cameraCanvas?.nativeElement;if(!v||!c||!v.videoWidth)return;c.width=v.videoWidth;c.height=v.videoHeight;c.getContext('2d')?.drawImage(v,0,0,c.width,c.height);this.captureUrl.set(c.toDataURL('image/jpeg',.9));}
  stopCamera(){this.cameraStream?.getTracks().forEach(t=>t.stop());this.cameraStream=null;if(this.cameraVideo)this.cameraVideo.nativeElement.srcObject=null;}
  label(field:string){return field.replace(/([A-Z])/g,' $1').replace(/[-_]/g,' ').replace(/^./,x=>x.toUpperCase());}
  fieldType(field:string){const n=new Set(['price','amount','charge','capacity','calories','minutes','radius','lat','lng','lat1','lng1','lat2','lng2','score']);if(n.has(field))return 'number';if(field==='date')return 'date';if(['time','when','deadline','window'].includes(field))return 'datetime-local';return 'text';}
  canPublic(p:MicroAppDefinition){return ['mini-ecommerce','gomshodami','rapkhone','shabmiyaram','jaa','classic-cinema','restaurant-explorer','class-venue','book-social','photocopy-chat','calendar-social','msg-location','snap-maghsoud'].includes(p.slug);}
  recordTitle(item:AppRecord){const d:any=item.data;const keys=Object.keys(d);return String(d.product||d.task||d.item||d.person||d.book||d.restaurant||d.venue||d.title||d.description||d.identity||d.film||d.message||d.entry||d.text||keys[0]&&d[keys[0]]||'Record');}
  recordDetails(item:AppRecord){const d:any=item.data;return Object.entries(d).slice(0,5).map(([k,v])=>`${this.label(k)}: ${String(v)}`).join(' · ');}
  private async run(fn:()=>Promise<void>,showBusy=true){if(showBusy)this.busy.set(true);this.error.set('');try{await fn();}catch(e:any){this.error.set(e?.message||'Something went wrong');}finally{if(showBusy)this.busy.set(false);}}
}
