import { Component, OnInit }       from '@angular/core'
import { AdminDashboardComponent } from '../admin-dashboard.component'
import { BugReport }               from '../../../../backend/types'
import { ApiService }              from '../../api.service'
import { MatSnackBar }             from '@angular/material'

@Component ( {
	selector    : 'app-admin-dashboard-reports',
	templateUrl : './admin-dashboard-reports.component.html',
	styleUrls   : [ './admin-dashboard-reports.component.css' ]
} )
export class AdminDashboardReportsComponent implements OnInit {
	working = true
	reports : BugReport[]

	constructor (
		private parent : AdminDashboardComponent,
		private api : ApiService,
		private snackbar : MatSnackBar
	) { }

	ngOnInit () {
		this.parent.activeRoute = 'reports'

		this.refresh ()
	}

	refresh () {
		this.working = true
		this.reports = null

		this.api.getBugReports ().subscribe (
			( reports : BugReport[] ) => {
				if ( reports ) {
					this.reports = reports.reverse ()
				}

				this.working = false
			}
		)
	}

	toggleRead ( report : BugReport ) {
		this.working = true

		report.read = !report.read

		this.api.setBugReport (
			report.id,
			report
		).subscribe (
			( success : boolean ) => {
				if ( !success ) {
					this.snackbar.open (
						'The bug report\'s read status could not be toggled.',
						'Close'
					)
				}

				this.refresh ()
			}
		)
	}
}
