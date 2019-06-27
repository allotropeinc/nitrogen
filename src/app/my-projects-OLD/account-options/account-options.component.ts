import {AfterViewInit, Component, Input, OnInit} from '@angular/core'
import {FormControl, FormGroup}                  from '@angular/forms'
import {MatDialog, MatDialogRef}                 from '@angular/material/dialog'
import {MatSnackBar}                             from '@angular/material/snack-bar'
import {Router}                                  from '@angular/router'
import {ApiService}                              from '../../api.service'

@Component({
	selector   : 'app-account-options',
	templateUrl: './account-options.component.html',
	styleUrls  : ['./account-options.component.css']
})
export class AccountOptionsComponent implements OnInit {
	@Input()
	admin: boolean

	constructor(
		private dialog: MatDialog,
		public api: ApiService,
		private snackbar: MatSnackBar,
		private router: Router
	) { }

	ngOnInit() {}

	changeAccountUsername() {
		const dialogRef = this.dialog.open(AccountChangeUsernameComponent)

		dialogRef.afterClosed().subscribe(
			data => {
				if (data) {
					this.api.changeUsername(
						this.api.username,
						data.password,
						data.username
					).subscribe(
						result => {
							if (!result) {
								this.snackbar.open(
									'The account username could not be changed.'
								)
							} else {
								this.snackbar.open(
									'The account username was successfully changed.'
								)
							}
						}
					)
				}
			})
	}

	changeAccountPassword() {
		const dialogRef = this.dialog.open(AccountChangePasswordComponent)

		dialogRef.afterClosed().subscribe(
			passwords => {
				if (passwords) {
					this.api.changePassword(
						this.api.username,
						passwords.old,
						passwords.new
					).subscribe(
						result => {
							if (!result) {
								this.snackbar.open(
									'The account password could not be changed.'
								)
							} else {
								this.snackbar.open(
									'The account password was successfully changed.'
								)
							}
						}
					)
				}
			})
	}

	deleteAccount() {
		const dialogRef = this.dialog.open(AccountDeleteDialogComponent)

		dialogRef.afterClosed().subscribe(
			password => {
				if (password) {
					this.api.deleteAccount(
						password
					).subscribe(
						result => {
							if (!result) {
								this.snackbar.open(
									'The account could not be deleted.'
								)
							} else {
								this.snackbar.open(
									'The account was successfully deleted.'
								)

								this.router.navigate(['/signin'])
							}
						}
					)
				}
			})
	}
}

@Component({
	selector   : 'app-account-change-username-dialog',
	templateUrl: './dialogs/account-change-username-dialog.component.html'
})
export class AccountChangeUsernameComponent {
	password: FormControl
	username: FormControl

	constructor(
		public dialogRef: MatDialogRef<AccountChangeUsernameComponent>
	) {}
}

@Component({
	selector   : 'app-account-change-password-dialog',
	templateUrl: './dialogs/account-change-password-dialog.component.html'
})
export class AccountChangePasswordComponent implements AfterViewInit {
	oldPassword: FormControl
	newPassword: FormControl
	confirmNewPassword: FormControl
	formGroup: FormGroup

	constructor(
		public dialogRef: MatDialogRef<AccountChangePasswordComponent>
	) {}

	ngAfterViewInit() {
		this.formGroup = new FormGroup({
			oldPassword       : this.oldPassword,
			newPassword       : this.newPassword,
			confirmNewPassword: this.confirmNewPassword
		})
	}

	onSubmit() {
		if (this.formGroup.valid) {
			this.dialogRef.close({
				old: this.oldPassword.value,
				new: this.newPassword.value
			})
		}
	}
}

@Component({
	selector   : 'app-account-delete-dialog',
	templateUrl: './dialogs/account-delete-dialog.component.html'
})
export class AccountDeleteDialogComponent {
	password: string
	showPassword = false

	constructor(
		public dialogRef: MatDialogRef<AccountDeleteDialogComponent>
	) {}
}
