import {Component, Inject}             from '@angular/core'
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog'
import {MatSnackBar}                   from '@angular/material/snack-bar'
import {EmailStatus}                   from '../../../../../../backend/src/types/database'
import {ApiService}                    from '../../../../api.service'

@Component({
	selector   : 'app-confirm-revoke-dialog',
	templateUrl: './manage-email-confirm-revoke-dialog.component.html',
	styleUrls  : ['./manage-email-confirm-revoke-dialog.component.css']
})
export class ManageEmailConfirmRevokeDialogComponent {
	public working = false

	constructor(
		@Inject(MAT_DIALOG_DATA) public status: EmailStatus,
		protected api: ApiService,
		protected dialogRef: MatDialogRef<ManageEmailConfirmRevokeDialogComponent>,
		protected snackbar: MatSnackBar
	) {}

	revert() {
		this.working = true
		this.dialogRef.disableClose = true

		this.api.revokeEmailVerification().subscribe(
			success => {
				if (success) {
					this.dialogRef.close()
				} else {
					this.working = false
					this.snackbar.open('Couldn\'t revoke code.')
				}
			}
		)
	}
}