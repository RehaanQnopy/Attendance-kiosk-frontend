import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { LoginPage } from './Login/component/Login.component';

const routes: Routes = [
  { path: '', component: LoginPage }
];

@NgModule({
  declarations: [LoginPage],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class AuthModule {}