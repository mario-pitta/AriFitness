import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';

export interface CanComponentDeactivate {
    canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable({
    providedIn: 'root'
})
export class PendingChangesGuard implements CanDeactivate<CanComponentDeactivate> {
    canDeactivate(component: CanComponentDeactivate): Observable<boolean> | Promise<boolean> | boolean {
        console.log('PendingChangesGuard called for component:', component?.constructor?.name);
        if (component && component.canDeactivate) {
            return component.canDeactivate();
        }
        return true;
    }
}
