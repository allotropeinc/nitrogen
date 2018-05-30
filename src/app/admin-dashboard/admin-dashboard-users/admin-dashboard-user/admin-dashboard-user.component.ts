import { Component, OnInit }                    from '@angular/core'
import { ActivatedRoute, Router }               from '@angular/router'
import { ApiService }                           from '../../../api.service'
import { MatDialog, MatDialogRef, MatSnackBar } from '@angular/material'
import { Account }                              from '../../../../../backend/types'

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
		private snackbar : MatSnackBar,
		private dialog : MatDialog,
		private router : Router
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

	deleteAccount () {
		this.working = true

		this.dialog.open (
			UserDeleteAccountDialogComponent,
			{
				width : '300px'
			}
		).afterClosed ().subscribe (
			( del : boolean ) => {
				if ( del ) {
					this.api.deleteOtherAccount ( this.username ).subscribe (
						( success : boolean ) => {
							if ( !success ) {
								this.snackbar.open (
									'The account could not be deleted.',
									'Close'
								)

								this.working = false
							} else {
								this.router.navigateByUrl ( '/admin/users' )
							}
						}
					)
				} else {
					this.working = false
				}
			}
		)
	}
}

@Component ( {
	selector    : 'app-user-delete-account-dialog',
	templateUrl : './dialogs/user-delete-account-dialog.component.html'
} )
export class UserDeleteAccountDialogComponent {
	constructor (
		public dialogRef : MatDialogRef<UserDeleteAccountDialogComponent>
	) {}
}