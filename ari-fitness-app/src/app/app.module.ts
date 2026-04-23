
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { ErrorHandler, LOCALE_ID, NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // Import here

import { RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { MaskitoDirective } from '@maskito/angular';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { AuthInterceptor } from 'src/core/interceptors/http.interceptor';
import { ErrorInterceptor } from 'src/core/interceptors/error.interceptor';

import { ServiceWorkerModule } from '@angular/service-worker';
import { register } from 'swiper/element/bundle';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { PageSizeService } from 'src/core/services/page-size/page-size.service';
import { provideMarkdown } from 'ngx-markdown';

import ptBr from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';
import { GlobalErrorHandler } from 'src/core/interceptors/global.error.interceptor';

registerLocaleData(ptBr);

register();

const httpProviders = () => provideHttpClient(withInterceptorsFromDi());

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    NgxChartsModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    RouterModule,
    MaskitoDirective,
    ServiceWorkerModule.register('ngsw-worker.js', {
      // Habilitar em produção OU em desenvolvimento local (http://)
      // Desabilitar apenas no Electron (file://)
      enabled: window.location.protocol !== 'file:',
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
    // CalendarModule.forRoot({
    //   provide: DateAdapter,
    //   useFactory: adapterFactory,
    // }),
  ],
  providers: [
    httpProviders(),
    provideMarkdown(),
    { provide: LocationStrategy, useClass: PathLocationStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    // ************************************
    { provide: LOCALE_ID, useValue: 'pt' },
    // ************************************
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    PageSizeService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
