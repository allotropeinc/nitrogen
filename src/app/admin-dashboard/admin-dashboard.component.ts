import { Component, OnInit }      from '@angular/core'
import { ApiService }             from '../api.service'
import { ActivatedRoute, Router } from '@angular/router'

@Component ( {
	selector    : 'app-admin-dashboard',
	templateUrl : './admin-dashboard.component.html',
	styleUrls   : [ './admin-dashboard.component.css' ]
} )
export class AdminDashboardComponent implements OnInit {
	working = true
	activeRoute = 'users'

	constructor (
		private api : ApiService,
		private router : Router,
		private route : ActivatedRoute
	) {}

	ngOnInit () {
		this.api.getAdminStatus ().subscribe (
			( isAdmin : boolean ) => {
				if ( isAdmin ) {
					this.working = false
				} else {
					this.router.navigate ( [ '/dashboard' ] )
				}
			}
		)
	}
}
