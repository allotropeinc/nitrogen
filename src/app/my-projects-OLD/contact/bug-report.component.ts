import {Component, OnInit}       from '@angular/core'
import {MatDialog, MatDialogRef} from '@angular/material/dialog'
import {MatSnackBar}             from '@angular/material/snack-bar'
import {ApiService}              from '../../api.service'

@Component({
	selector   : 'app-contact',
	templateUrl: './bug-report.component.html',
	styleUrls  : ['./bug-report.component.css']
})
export class BugReportComponent implements OnInit {
	constructor(
		private api: ApiService,
		private dialog: MatDialog,
		private snackbar: MatSnackBar
	) {}

	ngOnInit() {}

	reportBug() {
		const dialogRef = this.dialog.open(
			BugReportDialogComponent,
			{
				width: '500px'
			}
		)

		dialogRef.afterClosed().subscribe(
			data => {
				if (data) {
					this.api.submitBugReport(data).subscribe((
						success
					) => {
						if (!success) {
							this.snackbar.open(
								'Your bug report could not be submitted.'
							)
						} else {
							this.snackbar.open(
								'Your bug report has been submitted.'
							)
						}
					})
				}
			})
	}
}

@Component({
	selector   : 'app-bug-report-dialog',
	templateUrl: './dialogs/bug-report-dialog.component.html'
})
export class BugReportDialogComponent {
	data: {
		username: string,
		title: string,
		summary: string,
		steps: string,
		comments: string
	} = {
		username: this.api.username,
		title   : '',
		summary : '',
		steps   : '',
		comments: ''
	}

	constructor(
		public dialogRef: MatDialogRef<BugReportDialogComponent>,
		private api: ApiService
	) {}
}
