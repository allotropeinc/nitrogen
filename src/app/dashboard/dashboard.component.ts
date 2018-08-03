import { Component, OnInit } from '@angular/core'
import { MatDialog }         from '@angular/material'
import { Router }            from '@angular/router'
import { ApiService }        from '../api.service'

/**
 * This variable prevents the maintenance dialog from showing up every time you
 * load the dashboard, as opposed to only when you first load the page.
 *
 * You can always choose not to show the dialog by clicking the "Don't show
 * again" button.
 *
 * @type {boolean}
 */
let hasLoaded = false

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
		private router : Router,
		private dialog : MatDialog
	) {}

	ngOnInit () {
		this.api.getTokenValidity ().subscribe (
			valid => {
				if ( valid ) {
					this.api.getAdminStatus ().subscribe (
						admin => {
							this.admin = admin

							this.working = false

							if ( localStorage.hasShownMaintenanceDialog !== 'true' && !hasLoaded ) {
								hasLoaded = true

								this.dialog.open (
									MaintenanceDialogComponent,
									{ width : '400px' }
								).afterClosed ().subscribe ( ( dontShowAgain ) => {
									localStorage.hasShownMaintenanceDialog = dontShowAgain
								} )
							}
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

@Component ( {
	selector    : 'app-maintenance-dialog',
	templateUrl : './dialogs/maintenance-dialog.component.html'
} )
export class MaintenanceDialogComponent {
	constructor () {}
}