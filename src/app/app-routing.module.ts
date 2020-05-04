import { IsAccountCreatedGuard } from './is-account-created.guard';
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'tabs', pathMatch: 'full' },
  {
    path: 'tabs',
    loadChildren: './tabs/tabs.module#TabsPageModule',
    canActivate: [AuthGuard, IsAccountCreatedGuard],
    canLoad: [AuthGuard, IsAccountCreatedGuard],
  },
  { path: 'signup', loadChildren: './signup/signup.module#SignupPageModule' },
  {
    path: 'enter-code',
    loadChildren: './enter-code/enter-code.module#EnterCodePageModule',
    canActivate: [IsAccountCreatedGuard],
    canLoad: [IsAccountCreatedGuard],
  },
  {
    path: 'conversation',
    loadChildren: './conversation/conversation.module#ConversationPageModule',
    canActivate: [AuthGuard, IsAccountCreatedGuard],
    canLoad: [AuthGuard, IsAccountCreatedGuard],
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
