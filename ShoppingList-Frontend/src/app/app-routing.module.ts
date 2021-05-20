import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { CreateListComponent } from './create-list/create-list.component';
import { HomeComponent } from './home/home.component';
import { ListShareComponent } from './list-share/list-share.component';
import { ListComponent } from './list/list.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';

const routes: Routes = [
  {path:'',redirectTo:'/list',pathMatch:'full'},
  //{path:'',redirectTo:'/list',component:HomeComponent},
  {path:'list',component:ListComponent,canActivate:[AuthGuard]},
  {path:'login',component:LoginComponent},
  {path:'signup',component:SignupComponent},
  {path:'sharelist',component:ListShareComponent},
  {path:'createlist',component:CreateListComponent}
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
