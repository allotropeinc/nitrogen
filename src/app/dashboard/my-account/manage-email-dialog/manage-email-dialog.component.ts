import {Component, EventEmitter, Inject, Output} from '@angular/core'
import {FormControl}                             from '@angular/forms'
import {
	MAT_DIALOG_DATA,
	MatDialog
}                                                from '@angular/material/dialog'
import {MatSnackBar}                             from '@angular/material/snack-bar'
import {EmailStatus}                             from '../../../../../backend/src/types/database'
import {ApiService}                              from '../../../api.service'
import {ManageEmailConfirmRevokeDialogComponent} from './confirm-revoke-dialog/manage-email-confirm-revoke-dialog.component'

@Component({
	selector   : 'app-account-dashboard-manage-email-dialog',
	templateUrl: './manage-email-dialog.component.html',
	styleUrls  : ['./manage-email-dialog.component.css']
})
export class ManageEmailDialogComponent {
	public working = false
	public emailControl: FormControl

	@Output()
	refreshing = new EventEmitter<undefined>()

	@Output()
	refreshed = new EventEmitter<EmailStatus>()

	constructor(
		protected api: ApiService,
		protected snackbar: MatSnackBar,
		protected dialog: MatDialog,
		@Inject(MAT_DIALOG_DATA)
		public status: EmailStatus
	) {}

	refresh() {
		this.refreshing.emit()
		this.working = true

		this.api.getEmailStatus().subscribe(
			emailStatus => {
				this.refreshed.emit(emailStatus)
				this.status = emailStatus
				this.working = false
			}
		)
	}

	submit() {
		if (this.emailControl.valid) {
			this.working = true

			this.api.setEmail(this.emailControl.value).subscribe(
				status => {
					if (!status) {
						this.snackbar.open(
							'The email address could not be set.'
						)

						this.working = false

						return
					}

					this.refresh()
				}
			)
		}
	}

	openRevoke() {
		this.dialog.open(
			ManageEmailConfirmRevokeDialogComponent,
			{
				data: this.status
			}
		).afterClosed().subscribe(() => this.refresh())
	}
}
