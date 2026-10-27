import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/auth-guard';

//app-routing module acts as the Lookup table if urlBar has X show Y
const routes: Routes = [
  //{pathMatch:'full'} by default, every route even the mentioned ones start with ' ' an empty path
    //and angular does the path reading from left->right {prefix mode}, so it thinks every path call should be routed
    //to login and thus nothing gets viewed, therefore we change the pathMatch to full mode, so it re-directs ot login only 
    //and only when the whoel urlPath is empty ' ';
  { path: '', redirectTo: 'login', pathMatch: 'full'},
  {
    path: 'login',
    //loadChildren is an in-built function used for lazy-loading
    loadChildren: () =>
      import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'attendance',
    canActivate: [AuthGuard],
    /*
        () => ...	A function. The router calls it only when someone visits that URL.

        import('./features/auth/auth.module')	
        A dynamic import. 
        It downloads that module’s code as a separate JavaScript file on demand. 
        It isn’t bundled into the first load.

        .then(m => m.AuthModule)	When the file arrives, pick the AuthModule class out of it
    
    */
    loadChildren: () =>
      import('./features/attendance/attendance.module').then(m => m.AttendanceModule)
  },
  { path: 'manager', 
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/attendance/Manager/attendance.manager.modules').then(m=>m.ManagerModule)
  },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: 
  [
    RouterModule.forRoot(routes)
  ],
  exports: 
  [
    RouterModule
  ]
})
export class AppRoutingModule {}