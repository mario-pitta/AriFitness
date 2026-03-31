import { Component, HostListener, OnInit } from '@angular/core';
import {
  NavigationEnd,
  NavigationStart,
  Router,
  RouterEvent,
} from '@angular/router';
import { Subject } from 'rxjs';
import { AuthService } from 'src/core/services/auth/auth.service';
import { OverlayControllerService } from 'src/core/services/overlay-controller.service';
import { PageSizeService } from 'src/core/services/page-size/page-size.service';
import { PagetitleService } from 'src/core/services/pagetitle.service';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { environment } from 'src/environments/environment';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
export class AppComponent implements OnInit {
  route: string = '';
  showToastr: any;
  user: any;
  pageTitle: string = 'MvK Gym App';
  showOptions: boolean = false;
  isDarkMode: boolean = false;

  constructor(
    private titleService: PagetitleService,
    private overlayService: OverlayControllerService,
    private router: Router,
    private authService: AuthService,
    private pageSizeService: PageSizeService
  ) {
    this.pageSizeService.screenSizeChange$.subscribe((size) => {
      console.log('size: ', size);
    });
  }

  isMobile = false;
  screenSize = 0;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    console.log(event);
    this.screenSize = window.innerWidth;
    this.pageSizeService.setSize(this.screenSize);
  }

  ngOnInit() {
    this.initializeTheme();

    // Signal Electron that Angular has fully bootstrapped and is ready to show the window
    // This precise timing prevents the blank screen on startup
    if (window.require) {
      try {
        const { ipcRenderer } = window.require('electron');
        ipcRenderer.send('app-ready');
      } catch (e) { /* Not running in Electron */ }
    }

    this.router.events.subscribe((ev: any) => {
      if (ev instanceof NavigationStart) {
        if (ev.navigationTrigger == 'popstate') {
          this.overlayService.closeAll(ev);
        }
      }
      if (ev instanceof NavigationEnd) {
        this.route = ev.url;
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

  ngOnDestroy() {
    this.authService.userValue.unsubscribe();
  }
}
