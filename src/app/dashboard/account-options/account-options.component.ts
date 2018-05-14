import { Component, Input, OnInit }             from '@angular/core'
import { MatDialog, MatDialogRef, MatSnackBar } from '@angular/material'
import { ApiService }                           from '../../api.service'
import { Router }                               from '@angular/router'

@Component ( {
	selector    : 'app-account-options',
	templateUrl : './account-options.component.html',
	styleUrls   : [ './account-options.component.css' ]
} )
export class AccountOptionsComponent implements OnInit {
	@Input ()
	admin : boolean

	constructor (
		private dialog : MatDialog,
		public api : ApiService,
		private snackbar : MatSnackBar,
		private router : Router
	) { }

	ngOnInit () {}

	changeAccountUsername () {
		const dialogRef = this.dialog.open (
			AccountChangeUsernameComponent,
			{
				width : '300px'
			}
		)

		dialogRef.afterClosed ().subscribe (
			data => {
				if ( data ) {
					this.api.changeUsername (
						this.api.username,
						data.password,
						data.username
					).subscribe (
						result => {
							if ( !result ) {
								this.snackbar.open (
									'The account username could not be changed.',
									'Close'
								)
							} else {
								this.snackbar.open (
									'The account username was successfully changed.',
									'Close'
								)
							}
						}
					)
				}
			} )
	}

	changeAccountPassword () {
		const dialogRef = this.dialog.open (
			AccountChangePasswordComponent,
			{
				width : '300px'
			}
		)

		dialogRef.afterClosed ().subscribe (
			passwords => {
				if ( passwords ) {
					this.api.changePassword (
						this.api.username,
						passwords.old,
						passwords.new
					).subscribe (
						result => {
							if ( !result ) {
								this.snackbar.open (
									'The account password could not be changed.',
									'Close'
								)
							} else {
								this.snackbar.open (
									'The account password was successfully changed.',
									'Close'
								)
							}
						}
					)
				}
			} )
	}

	deleteAccount () {
		const dialogRef = this.dialog.open (
			AccountDeleteDialogComponent,
			{
				width : '300px'
			}
		)

		dialogRef.afterClosed ().subscribe (
			password => {
				if ( password ) {
					this.api.deleteAccount (
						password
					).subscribe (
						result => {
							if ( !result ) {
								this.snackbar.open (
									'The account could not be deleted.',
									'Close'
								)
							} else {
								this.snackbar.open (
									'The account was successfully deleted.',
									'Close'
								)

								this.router.navigate ( [ '/signin' ] )
							}
						}
					)
				}
			} )
	}

}

@Component ( {
	selector    : 'app-account-change-username-dialog',
	templateUrl : './dialogs/account-change-username-dialog.component.html'
} )
export class AccountChangeUsernameComponent {
	password : string
	showPassword = false
	username : string

	constructor (
		public dialogRef : MatDialogRef<AccountChangeUsernameComponent>
	) {}
}

@Component ( {
	selector    : 'app-account-change-password-dialog',
	templateUrl : './dialogs/account-change-password-dialog.component.html'
} )
export class AccountChangePasswordComponent {
	oldPassword : string
	newPassword : string
	newPasswordConfirm : string
	showOldPassword = false
	showNewPassword = false

	constructor (
		public dialogRef : MatDialogRef<AccountChangePasswordComponent>,
		private snackbar : MatSnackBar
	) {}

	onClick () {
		if ( this.newPasswordConfirm = this.newPasswordConfirm ) {
			this.dialogRef.close ( {
				old : this.oldPassword,
				new : this.newPassword
			} )
		} else {
			this.snackbar.open (
				'Passwords do not match.',
				'Close'
			)
		}
	}
}

@Component ( {
	selector    : 'app-account-delete-dialog',
	templateUrl : './dialogs/account-delete-dialog.component.html'
} )
export class AccountDeleteDialogComponent {
	password : string

	constructor (
		public dialogRef : MatDialogRef<AccountDeleteDialogComponent>
	) {}
}
