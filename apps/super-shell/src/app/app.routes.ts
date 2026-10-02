import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { HomeComponent } from './home.component';
import { PublicComponent } from './public.component';
import { TimedFileComponent } from './timed-file.component';
export const appRoutes: Routes = [
  { path:'', component: HomeComponent },
  { path:'public/:slug', component: PublicComponent },
  { path:'file/:id', component: TimedFileComponent },
  { path: 'apps/commerce', loadChildren: () => loadRemoteModule('mfe-commerce', './Routes').then((m) => m.remoteRoutes) },
  { path: 'apps/finance', loadChildren: () => loadRemoteModule('mfe-finance', './Routes').then((m) => m.remoteRoutes) },
  { path: 'apps/games', loadChildren: () => loadRemoteModule('mfe-games', './Routes').then((m) => m.remoteRoutes) },
  { path: 'apps/impact', loadChildren: () => loadRemoteModule('mfe-impact', './Routes').then((m) => m.remoteRoutes) },
  { path: 'apps/life', loadChildren: () => loadRemoteModule('mfe-life', './Routes').then((m) => m.remoteRoutes) },
  { path: 'apps/local', loadChildren: () => loadRemoteModule('mfe-local', './Routes').then((m) => m.remoteRoutes) },
  { path: 'apps/media', loadChildren: () => loadRemoteModule('mfe-media', './Routes').then((m) => m.remoteRoutes) },
  { path: 'apps/social', loadChildren: () => loadRemoteModule('mfe-social', './Routes').then((m) => m.remoteRoutes) },
  { path: 'apps/utilities', loadChildren: () => loadRemoteModule('mfe-utilities', './Routes').then((m) => m.remoteRoutes) },
  { path:'**', redirectTo:'' }
];
