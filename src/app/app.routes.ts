import { Routes } from '@angular/router';
import {FaqsComponent} from './faqs/faqs.component';
import {AboutComponent} from './about/about.component';

import {AdminComponent} from "./admin/admin.component";
import {LoginComponent} from "./login/login.component";
import {TestComponent} from './test/test.component';
import {MapComponent} from './map/map.component';
import {DropComponent} from './drop/drop.component';
import {SettingsComponent} from './settings/settings.component';
import {CaptureComponent} from './capture/capture.component';
import {BuildComponent} from './build/build.component';
import {AirdropComponent} from './airdrop/airdrop.component';
import {CreateWorldComponent} from './create-world/create-world.component';
import {GamesComponent} from './games/games.component';


export const routes: Routes = [
  { path: 'faqs', component: FaqsComponent},
  { path: 'admin', component: AdminComponent},
  { path: 'about', component: AboutComponent},
  { path: 'login', component: LoginComponent},
  { path: 'build', component: BuildComponent},
  { path: 'test', component: TestComponent},
  { path: 'drop', component: DropComponent},
  { path: 'games', component: GamesComponent},
  { path: 'airdrop', component: AirdropComponent},
  { path: 'create', component: CreateWorldComponent},
  { path: 'capture', component: CaptureComponent},
  { path: 'map', component: MapComponent},
  { path: 'settings', component: SettingsComponent},
  { path: '', component: MapComponent},
]
