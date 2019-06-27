import {Injectable} from '@angular/core'
import {
	ActivatedRouteSnapshot,
	CanActivate,
	RouterStateSnapshot
}                   from '@angular/router'
import {Observable} from 'rxjs'
import {ApiService} from '../api.service'

@Injectable()
export class DashboardCanActivate implements CanActivate {
	constructor(private api: ApiService) {}

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	): Observable<boolean> {
		return this.api.getTokenValidity()
	}
}
