import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import Constants from 'src/core/Constants';
import { Usuario } from 'src/core/models/Usuario';
import { AuthService } from 'src/core/services/auth/auth.service';
import { PageSizeService } from 'src/core/services/page-size/page-size.service';
import { PagetitleService } from 'src/core/services/pagetitle.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
})
export class TabsPage implements OnInit, OnDestroy {
  user: any;
  route: string = '/home'
  Constants = Constants;
  pageTitle = 'Home';
  isMobile = false;
  subs$: Subscription = new Subscription();
  constructor(
    private titleService: PagetitleService,
    private auth: AuthService,
    private router: Router,
    private pageSizeService: PageSizeService
  ) {
    this.subs$.add(

      this.titleService.title.asObservable().subscribe({
        next: (title) => {
          this.pageTitle = title;
          // this.route = this.aRoute.snapshot.url
        },
      }),
    )
    this.subs$.add(

      this.pageSizeService.screenSizeChange$.subscribe((size) => {
        this.isMobile = size.isMobile;
      })
    )
  }

  ngOnInit() {
    this.isMobile = this.pageSizeService.getSize().isMobile
    this.router.events.subscribe(ev => {
      if (ev instanceof NavigationEnd) {
        console.log('selected: ', ev);
        this.route = ev.url
      }
    })
    this.user = this.auth.getUser;
    console.log('this.user: ', this.user);

    if (this.user) {
      // this.updateLoggedUserData();
    } else {
      this.router.navigate(['login']);
    }
  }

  updateLoggedUserData() {
    this.auth.login(this.user.cpf, this.user.data_nascimento).subscribe({
      next: (user) => {
        // console.log('user: ', user);
      },
    });
  }

  navigate(path: string, whitParams: boolean = true, params?: any) {
    setTimeout(() => {
      this.router.navigate([path], whitParams ? { queryParams: { userId: this.user.id } } : {});
    }, 80);
  }

  ngOnDestroy() {
    console.log('destroying tabs page');
    this.subs$.unsubscribe();
  }
}
