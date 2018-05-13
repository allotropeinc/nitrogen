import { Component, OnInit } from '@angular/core'
import { ActivatedRoute }    from '@angular/router'
import { Account }           from '../../../account'
import { ApiService }        from '../../../api.service'
import { MatSnackBar }       from '@angular/material'

@Component ( {
	selector    : 'app-admin-dashboard-user',
	templateUrl : './admin-dashboard-user.component.html',
	styleUrls   : [ './admin-dashboard-user.component.css' ]
} )
export class AdminDashboardUserComponent implements OnInit {
	username : string = this.route.snapshot.paramMap.get ( 'username' )
	account : Account
	working = true

	constructor (
		private route : ActivatedRoute,
		private api : ApiService,
		private snackbar : MatSnackBar
	) {}

	ngOnInit () {
		this.refresh ()
	}

	refresh () {
		this.working = true
		this.account = null

		this.api.getAccount (
			this.username
		).subscribe (
			( account : Account ) => {
				this.account = account
				this.working = false
			}
		)
	}

	getEditorSettings () {
		return JSON.stringify (
			this.account.editorOptions,
			undefined,
			'\t'
		)
	}

	saveChanges () {
		this.working = true

		this.api.changeAccount (
			this.username,
			this.account
		).subscribe (
			( success ) => {
				if ( !success ) {
					this.snackbar.open (
						'The account could not be saved.',
						'Close'
					)
				}

				this.working = false
			}
		)
	}
}
