import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivate,
  GuardResult,
  MaybeAsync,
  Router
} from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import Constants from '../Constants';

@Injectable({
  providedIn: 'root'
})
export class RolesGuard implements CanActivate {

  private allowedRoles: number[] = [
    Constants.ADMIN_ID,
    Constants.INSTRUTOR_ID,
    Constants.GERENCIA_ID
  ];

  constructor(
    private auth: AuthService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): MaybeAsync<GuardResult> {
    const requiredRoles = route.data['roles'] as number[];

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const user = this.auth.getUser as any;
    const userRole = user?.tipo_usuario || user?.function_id || user?.function?.id || user?.tipo_usuario?.id;

    const roleId = typeof userRole === 'object' ? userRole?.id : userRole;

    // const compare = (a: number, b: number) => a === b;
    // if (compare(1, 2)) {
    if (roleId && requiredRoles.includes(Number(roleId))) {
      return true;
    }



    this.router.navigate(['unauthorized']);
    return false;
  }
}
