import {Component, OnInit} from '@angular/core'
import {EmailStatus}       from '../../../../../backend/src/types/database'
import {ApiService}        from '../../../api.service'

@Component({
	selector   : 'app-account-dashboard-credentials-email',
	templateUrl: './email-credential.component.html',
	styleUrls  : ['./email-credential.component.css']
})
export class EmailCredentialComponent implements OnInit {
	public working = true
	public status: EmailStatus

	constructor(protected api: ApiService) {}

	ngOnInit() {
		this.refresh()
	}

	refresh() {
		this.api.getEmailStatus().subscribe(
			emailStatus => {
				this.status = emailStatus

				this.working = false
			}
		)
	}
}
