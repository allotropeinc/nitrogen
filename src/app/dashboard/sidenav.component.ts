import {Component}           from '@angular/core'
import {MatSidenav}          from '@angular/material'
import {Router, RouterEvent} from '@angular/router'
import {filter}              from 'rxjs/operators'
import {DashboardData}       from './data'

@Component({
	selector   : 'app-dashboard-sidenav',
	templateUrl: './sidenav.component.html',
	styleUrls  : ['./sidenav.component.css']
})
export class DashboardSidenavComponent {
	public sidebarData = DashboardData.sidebarData

	constructor(public router: Router, public sidenav: MatSidenav) {
		router.events
			.pipe(filter(event => event instanceof RouterEvent))
			.subscribe(() => {
				if (sidenav.mode !== 'side') {
					sidenav.close()
				}
			})
	}
}
