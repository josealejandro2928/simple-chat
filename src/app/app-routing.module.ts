import { IsAccountCreatedGuard } from './is-account-created.guard';
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'tabs', pathMatch: 'full' },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule),
    canActivate: [AuthGuard, IsAccountCreatedGuard],
    canLoad: [AuthGuard, IsAccountCreatedGuard],
  },
  { path: 'signup', loadChildren: () => import('./signup/signup.module').then(m => m.SignupPageModule) },
  {
    path: 'enter-code',
    loadChildren: () => import('./enter-code/enter-code.module').then(m => m.EnterCodePageModule),
    canActivate: [IsAccountCreatedGuard],
    canLoad: [IsAccountCreatedGuard],
  },
  {
    path: 'conversation',
    loadChildren: () => import('./conversation/conversation.module').then(m => m.ConversationPageModule),
    canActivate: [AuthGuard, IsAccountCreatedGuard],
    canLoad: [AuthGuard, IsAccountCreatedGuard],
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, relativeLinkResolution: 'legacy' }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
