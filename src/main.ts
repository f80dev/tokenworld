import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import {environment} from './environments/environment';

declare global { interface Window { elrondWallet: { extensionId: string }; } }
(window as any).global = window;

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

if(environment.production){
  //navigator.serviceWorker.register("")
}
