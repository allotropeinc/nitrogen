import {Component}  from '@angular/core'
import {ApiService} from './api.service'

@Component({
	selector   : 'app-root',
	templateUrl: './app.component.html'
})
export class AppComponent {
	constructor(
		public api: ApiService
	) {}
}
