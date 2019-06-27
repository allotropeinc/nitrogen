import {Component, OnInit}       from '@angular/core'
import {MinimalAccount}          from '../../../../backend/src/types/datatypes'
import {ApiService}              from '../../api.service'
import {AdminDashboardComponent} from '../admin-dashboard.component'

@Component({
	selector   : 'app-admin-dashboard-users',
	templateUrl: './admin-dashboard-users.component.html',
	styleUrls  : ['./admin-dashboard-users.component.css']
})
export class AdminDashboardUsersComponent implements OnInit {
	working = true
	users: MinimalAccount[]

	constructor(
		private parent: AdminDashboardComponent,
		private api: ApiService
	) { }

	ngOnInit() {
		this.parent.activeRoute = 'users'

		this.refresh()
	}

	refresh() {
		this.working = true
		this.users = null

		this.api.getUsers().subscribe(
			(users: MinimalAccount[]) => {
				if (users) {
					this.users = users
				}

				this.working = false
			}
		)
	}
}
