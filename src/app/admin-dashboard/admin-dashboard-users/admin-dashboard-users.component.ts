import { Component, OnInit }       from '@angular/core'
import { AdminDashboardComponent } from '../admin-dashboard.component'
import { ApiService }              from '../../api.service'

@Component ( {
	selector    : 'app-admin-dashboard-users',
	templateUrl : './admin-dashboard-users.component.html',
	styleUrls   : [ './admin-dashboard-users.component.css' ]
} )
export class AdminDashboardUsersComponent implements OnInit {
	working = true
	users : string[]

	constructor (
		private parent : AdminDashboardComponent,
		private api : ApiService
	) { }

	ngOnInit () {
		this.parent.activeRoute = 'users'

		this.refresh ()
	}

	refresh () {
		this.working = true
		this.users = null

		this.api.getUsers ().subscribe (
			( users : string[] ) => {
				if ( users ) {
					this.users = users
				}

				this.working = false
			}
		)
	}
}
