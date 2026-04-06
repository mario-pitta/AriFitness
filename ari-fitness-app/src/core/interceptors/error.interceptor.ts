import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from '../services/toastr/toastr.service';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router, private toastr: ToastrService) { }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err) {
          switch (err.status) {
            case 400:
              throwError(() => err.message);
              break;
            case 401:
              this.router.navigate(['/login'])
              localStorage.clear();
              // location.reload();
              throwError(() => err.message);
              break;
            case 423:
              this.router.navigate(['locked'])
              break;
            default:
              throwError(() => err.message);
              break;
          }
          throwError(err);
          this.toastr.error(
            JSON.stringify(err.error.details || err.error.message)
          );
        }
        return throwError(err);
      })
    );
  }
}
