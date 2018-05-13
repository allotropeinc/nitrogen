import { Component, OnInit } from '@angular/core'
import { ApiService }        from '../api.service'
import { Router }            from '@angular/router'

@Component ( {
	selector    : 'app-dashboard',
	templateUrl : './dashboard.component.html',
	styleUrls   : [ './dashboard.component.css' ]
} )
export class DashboardComponent implements OnInit {
	working = true
	admin = false

	constructor (
		public api : ApiService,
		private router : Router
	) {}

	ngOnInit () {
		this.api.getTokenValidity ().subscribe (
			valid => {
				if ( valid ) {
					this.api.getAdminStatus ().subscribe (
						admin => {
							this.admin = admin

							this.working = false
						}
					)
				} else {
					this.router.navigate ( [ '/signin' ] )
				}
			} )
	}

	logout () {
		this.working = true

		this.api.logout ().subscribe (
			success => {
				if ( success ) {
					this.router.navigate ( [ '/signin' ] )
				} else {
					this.working = false
				}
			} )
	}

}
