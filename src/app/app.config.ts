import {ApplicationConfig, provideZoneChangeDetection, isDevMode, importProvidersFrom} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideServiceWorker } from '@angular/service-worker';
import {provideHttpClient} from '@angular/common/http';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {GoogleLoginProvider, SocialAuthServiceConfig, SocialLoginModule} from '@abacritt/angularx-social-login';
import {SocketIoModule} from 'ngx-socket-io';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    {provide: MAT_DIALOG_DATA, useValue: {hasBackdrop: false}},
    {provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider("794055474370-nj8dfh004epum0h6ne1chq903dr4rofe.apps.googleusercontent.com"),
          }
        ],
      } as SocialAuthServiceConfig
    },

    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),
    provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          })
  ]
};
