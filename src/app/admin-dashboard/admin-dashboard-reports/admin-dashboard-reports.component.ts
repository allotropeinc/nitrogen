import {Component, OnInit}       from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar';
import {BugReport}               from '../../../../backend/src/types/database'
import {ApiService}              from '../../api.service'
import {AdminDashboardComponent} from '../admin-dashboard.component'

@Component({
	selector   : 'app-admin-dashboard-reports',
	templateUrl: './admin-dashboard-reports.component.html',
	styleUrls  : ['./admin-dashboard-reports.component.css']
})
export class AdminDashboardReportsComponent implements OnInit {
	working = true
	reports: BugReport[]

	constructor(
		private parent: AdminDashboardComponent,
		private api: ApiService,
		private snackbar: MatSnackBar
	) { }

	ngOnInit() {
		this.parent.activeRoute = 'reports'

		this.refresh()
	}

	refresh() {
		this.working = true
		this.reports = null

		this.api.getBugReports().subscribe(
			(reports: BugReport[]) => {
				if (reports) {
					this.reports = reports.reverse()
				}

				this.working = false
			}
		)
	}

	toggleRead(report: BugReport) {
		this.snackbar.open(
			'This is disabled right now.'
		)
	}
}
