import { Component, OnInit } from '@angular/core'
import { ApiService }        from '../../api.service'
import { MatSnackBar }       from '@angular/material'

@Component ( {
	selector    : 'app-admin-dashboard-users',
	templateUrl : './admin-dashboard-starterCode.component.html',
	styleUrls   : [ './admin-dashboard-starterCode.component.css' ]
} )
export class AdminDashboardStarterCodeComponent implements OnInit {
	htmlCode : string
	htmlWorking = true
	mdCode : string
	mdWorking = true

	constructor (
		private api : ApiService,
		private snackbar : MatSnackBar
	) { }

	ngOnInit () {
		this.htmlRefresh ()
		this.mdRefresh ()
	}

	htmlRefresh () {
		this.htmlWorking = true

		this.api.getStarterCode ( 0 ).subscribe (
			( starterCode ) => {
				this.htmlCode = starterCode
				this.htmlWorking = false
			}
		)
	}

	htmlSave () {
		this.htmlWorking = true

		this.api.setStarterCode (
			0,
			this.htmlCode
		).subscribe (
			( success ) => {
				if ( !success ) {
					this.snackbar.open (
						'The HTML starter code could not be saved.',
						'Close'
					)
				}

				this.htmlWorking = false
			}
		)
	}

	mdRefresh () {
		this.mdWorking = true

		this.api.getStarterCode ( 1 ).subscribe (
			( starterCode ) => {
				this.mdCode = starterCode
				this.mdWorking = false
			}
		)
	}

	mdSave () {
		this.mdWorking = true

		this.api.setStarterCode (
			1,
			this.mdCode
		).subscribe (
			( success ) => {
				if ( !success ) {
					this.snackbar.open (
						'The Markdown starter code could not be saved.',
						'Close'
					)
				}

				this.mdWorking = false
			}
		)
	}
}
