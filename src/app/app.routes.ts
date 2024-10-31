import { Routes } from '@angular/router';
import {FaqsComponent} from './faqs/faqs.component';
import {AboutComponent} from './about/about.component';

import {AdminComponent} from "./admin/admin.component";
import {LoginComponent} from "./login/login.component";


export const routes: Routes = [
  { path: 'faqs', component: FaqsComponent},
  { path: 'admin', component: AdminComponent},
  { path: 'about', component: AboutComponent},
  { path: 'login', component: LoginComponent},
]
