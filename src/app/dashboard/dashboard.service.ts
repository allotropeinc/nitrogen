import {Injectable}                          from '@angular/core'
import {ActivatedRoute, Router, RouterEvent} from '@angular/router'
import {filter}                              from 'rxjs/operators'
import {DashboardData}                       from './data'

@Injectable()
export class DashboardService {
	public componentData: DashboardData.ComponentData

	constructor(
		public activatedRoute: ActivatedRoute,
		public router: Router
	) {
		this.updateData()

		router.events
			.pipe(filter(event => event instanceof RouterEvent))
			.subscribe(() => {
				this.updateData()
			})
	}

	private updateData() {
		const groupRoute = this.activatedRoute.firstChild
		const componentRoute = groupRoute.firstChild

		this.componentData =
			DashboardData.componentDataLookup
				[groupRoute.routeConfig.path]
				[componentRoute.routeConfig.path]
	}
}
