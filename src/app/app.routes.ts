import { Routes } from '@angular/router';
import {FaqsComponent} from './faqs/faqs.component';
import {AboutComponent} from './about/about.component';

import {AdminComponent} from "./admin/admin.component";
import {LoginComponent} from "./login/login.component";
import {AppComponent} from './app.component';
import {TestComponent} from './test/test.component';
import {MapComponent} from './map/map.component';
import {DropComponent} from './drop/drop.component';


export const routes: Routes = [
  { path: 'faqs', component: FaqsComponent},
  { path: 'admin', component: AdminComponent},
  { path: 'about', component: AboutComponent},
  { path: 'login', component: LoginComponent},
  { path: 'test', component: TestComponent},
  { path: 'drop', component: DropComponent},
  { path: 'map', component: MapComponent},
  { path: '', component: MapComponent},
]
