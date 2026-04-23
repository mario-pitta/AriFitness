import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  NavigationStart,
  Router,
} from '@angular/router';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';
import { AuthService } from 'src/core/services/auth/auth.service';
import { OverlayControllerService } from 'src/core/services/overlay-controller.service';
import { PageSizeService } from 'src/core/services/page-size/page-size.service';
import { PagetitleService } from 'src/core/services/pagetitle.service';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { environment } from 'src/environments/environment';


import pck from '../../package.json';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: environment.apiKey,
  authDomain: environment.authDomain,
  projectId: environment.projectId,
  storageBucket: environment.storageBucket,
  messagingSenderId: environment.messagingSenderId,
  appId: environment.appId,
  measurementId: environment.measurementId
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  route: string = '';

  showToastr: any;
  user: any;
  pageTitle: string = 'MvK Gym App';
  showOptions: boolean = false;
  isDarkMode: boolean = false;
  isPublicRoute: boolean = false;

  // Update Notification State
  showUpdateNotify: boolean = false; // true;
  newVersion: string = '1.19.0';
  currentVersion: string = pck.version;

  isMobile = false;
  screenSize = 0;

  constructor(
    private titleService: PagetitleService,
    private overlayService: OverlayControllerService,
    private aRoute: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private pageSizeService: PageSizeService,
    private swUpdate: SwUpdate
  ) {
    this.pageSizeService.screenSizeChange$.subscribe((size) => {
      console.log('size: ', size);
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenSize = window.innerWidth;
    this.pageSizeService.setSize(this.screenSize);
  }

  pendingRedirect: boolean = false;
  redirectUrl: string = '';
  redirectQueryParams: any;

  ngOnInit() {
    this.initializeTheme();

    if (window.require) {
      try {
        const { ipcRenderer } = window.require('electron');
        ipcRenderer.send('app-ready');
      } catch (e) { /* Not running in Electron */ }
    }

    this.router.events.subscribe(async (ev: any) => {

      console.log('ev = ', ev)

      if (ev instanceof NavigationStart) {

        if (ev.url.includes('redirect')) {
          this.pendingRedirect = true;
          this.redirectUrl = ev.url;

          // this.overlayService.closeAll(ev);
          await this.redirect();
          console.log('teem redirect: ' + ev.url);
          return;
        }

        if (ev.navigationTrigger == 'popstate') {
          this.overlayService.closeAll(ev);
        }
      }
      if (ev instanceof NavigationEnd) {
        this.route = ev.url;
        console.log('this.route = ', this.route)
        console.log('this.pendingRedirect = ', this.pendingRedirect)


        if (this.pendingRedirect) {
          this.pendingRedirect = false;
          await this.redirect();
          return;
        }

        this.isPublicRoute = this.isPublicPage(ev.url);
      }
    });

    this.authService.userValue.subscribe({
      next: (user) => {
        this.user = user;
      },
    });

    this.titleService.title.asObservable().subscribe({
      next: (title) => {
        this.pageTitle = title;
      },
    });

    this.checkUpdate();
  }



  async redirect() {
    console.log('this.redirectUrl = ', this.redirectUrl)

    const base = `${window.location.protocol}//${window.location.host}`;
    const url = new URL(this.redirectUrl, base);   // interpreta corretamente a queryconsole.log('url = ', url)

    const redirect = url.searchParams.get('redirect');
    const empresaId = url.searchParams.get('empresa_id');
    console.log('redirect = ', redirect)
    console.log('empresaId = ', empresaId)

    if (redirect) {
      const query = empresaId ? { empresa_id: empresaId } : undefined;
      // Navega de forma assíncrona para não bloquear a renderização inicial
      setTimeout(() => {
        this.router.navigate([`/${redirect}`], { queryParams: query });
      }, 80);
    }


  }

  checkUpdate() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates
        .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
        .subscribe(() => {
          this.showUpdateNotify = true;
        });

      this.swUpdate.checkForUpdate();
    }
  }

  reloadApp() {
    window.location.reload();
  }

  initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isDarkMode = savedTheme === 'dark';
    } else {
      this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    this.applyTheme();
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  private applyTheme() {
    document.body.classList.toggle('dark', this.isDarkMode);
  }

  openUserMenu(e: Event) {
    this.showOptions = true;
  }

  logout() {
    this.authService.logout();
  }

  navigateBack() {
    history.back();
  }

  isPublicPage(url: string): boolean {
    const publicRoutes = ['/catalogo/', '/login', '/register', '/forgot-password', '/check-in'];
    return publicRoutes.some(route => url.includes(route));
  }

  ngOnDestroy() {
    // Note: In a real app, you should unsubscribe from all subscriptions here
  }
}
