import {Injectable}  from '@angular/core'
import {
	ActivatedRouteSnapshot,
	Resolve,
	RouterStateSnapshot
}                    from '@angular/router'
import {Observable}  from 'rxjs'
import {ProjectData} from '../../../../backend/src/types/datatypes'
import {ApiService}  from '../../api.service'

@Injectable()
export class MyProjectsResolver implements Resolve<ProjectData[]> {
	constructor(private api: ApiService) {}

	resolve(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	): Observable<ProjectData[]> {
		return this.api.getProjectsData()
	}
}
