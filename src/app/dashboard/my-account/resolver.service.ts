import {Injectable}  from '@angular/core'
import {
	ActivatedRouteSnapshot,
	Resolve,
	RouterStateSnapshot
}                    from '@angular/router'
import {Observable}  from 'rxjs'
import {delay}       from 'rxjs/operators'
import {EmailStatus} from '../../../../backend/src/types/database'
import {ApiService}  from '../../api.service'

@Injectable()
export class MyAccountResolver implements Resolve<EmailStatus> {
	constructor(private api: ApiService) {}

	resolve(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	): Observable<EmailStatus> {
		return this.api.getEmailStatus().pipe(delay(1000))
	}
}
