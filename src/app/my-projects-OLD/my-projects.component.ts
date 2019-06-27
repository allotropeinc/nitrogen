import {Component, OnInit} from '@angular/core'
import {MatDialog}         from '@angular/material/dialog'
import {Router}            from '@angular/router'
import {ApiService}        from '../api.service'

/**
 * This variable prevents the maintenance dialog from showing up every time you
 * load My Projects, as opposed to only when you first load the page.
 *
 * You can always choose not to show the dialog by clicking the "Don't show
 * again" button.
 *
 * @type {boolean}
 */
let hasLoaded = true // false

@Component({
	selector   : 'app-dashboard',
	templateUrl: './my-projects.component.html',
	styleUrls  : ['./my-projects.component.css']
})
export class MyProjectsComponent implements OnInit {
	working = true
	admin = false

	constructor(
		public api: ApiService,
		private router: Router,
		private dialog: MatDialog
	) {}

	ngOnInit() {
		this.api.getTokenValidity().subscribe(
			valid => {
				if (valid) {
					this.api.getAdminStatus().subscribe(
						admin => {
							this.admin = admin

							this.working = false

							if (localStorage.hasShownMaintenanceDialog !==
							    'true' && !hasLoaded) {
								hasLoaded = true

								this.dialog.open(MaintenanceDialogComponent)
									.afterClosed()
									.subscribe((dontShowAgain) => {
										localStorage.hasShownMaintenanceDialog =
											dontShowAgain
									})
							}
						}
					)
				} else {
					this.router.navigate(['/signin'])
				}
			})
	}

	logout() {
		this.working = true

		this.api.logout().subscribe(
			success => {
				if (success) {
					this.router.navigate(['/signin'])
				} else {
					this.working = false
				}
			})
	}
}

@Component({
	selector   : 'app-maintenance-dialog',
	templateUrl: './dialogs/maintenance-dialog.component.html'
})
export class MaintenanceDialogComponent {
	constructor() {}
}