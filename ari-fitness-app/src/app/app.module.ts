
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { LOCALE_ID, NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // Import here

import { RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { MaskitoDirective } from '@maskito/angular';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { AuthInterceptor } from 'src/core/interceptors/http.interceptor';
import { ErrorInterceptor } from 'src/core/interceptors/error.interceptor';

import { ExercicioFormModule } from './adm-page/exercicios/exercicio-form/exercicio-form.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { register } from 'swiper/element/bundle';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { PageSizeService } from 'src/core/services/page-size/page-size.service';
import { provideMarkdown } from 'ngx-markdown';

import ptBr from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';

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
    ExercicioFormModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode() && window.location.protocol !== 'file:',
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
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    // ************************************
    { provide: LOCALE_ID, useValue: 'pt' },
    // ************************************
    PageSizeService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
