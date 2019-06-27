import {Component, OnInit, ViewChild} from '@angular/core'
import {MatDialog}                    from '@angular/material/dialog'
import {MatSnackBar}                  from '@angular/material/snack-bar'
import {ActivatedRoute}               from '@angular/router'
import {EmailStatus}                  from '../../../../backend/src/types/database'
import {ApiService}                   from '../../api.service'
import {
	AccountChangePasswordComponent,
	AccountChangeUsernameComponent
}                                     from '../../my-projects-OLD/account-options/account-options.component'
import {EmailCredentialComponent}     from './email-credential/email-credential.component'
import {ManageEmailDialogComponent}   from './manage-email-dialog/manage-email-dialog.component'

@Component({
	selector   : 'app-my-account',
	templateUrl: './my-account.component.html',
	styleUrls  : ['./my-account.component.css']
})
export class MyAccountComponent implements OnInit {
	@ViewChild('emailComponent', {static: true})
	public emailComponent: EmailCredentialComponent

	public emailStatus: EmailStatus

	constructor(
		public api: ApiService,
		protected dialog: MatDialog,
		protected snackbar: MatSnackBar,
		activatedRoute: ActivatedRoute
	) {
		this.emailStatus = activatedRoute.snapshot.data.emailStatus
	}

	ngOnInit() {}

	changeUsername() {
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
			}
		)
	}

	changePassword() {
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
			}
		)
	}

	manageEmail() {
		const ref = this.dialog.open(
			ManageEmailDialogComponent,
			{data: this.emailComponent.status}
		)

		ref.componentInstance.refreshing.subscribe(
			() => {
				this.emailComponent.working = true
			}
		)

		ref.componentInstance.refreshed.subscribe(
			(emailStatus) => {
				this.emailComponent.status = emailStatus
				this.emailComponent.working = false
			}
		)
	}

	/*showRecoveryKey() {
		this.snackbar.open('Show recovery key', 'Yep')
	}

	resetRecoveryKey() {
		this.snackbar.open('Reset recovery key', 'Dang')
	}*/
}
