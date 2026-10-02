import { Routes } from '@angular/router'; import { MicroAppComponent } from '@ali-labs/runtime'; import { MICRO_APP_BY_SLUG } from '@ali-labs/contracts';
export const remoteRoutes: Routes = [{path:':slug',component:MicroAppComponent},{path:'',component:MicroAppComponent,data:{slug:"rapkhone"}}];
