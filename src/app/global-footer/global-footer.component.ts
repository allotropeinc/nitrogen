import {Component, isDevMode} from '@angular/core'

declare var require: any

@Component({
	selector   : 'app-global-footer',
	templateUrl: './global-footer.component.html',
	styleUrls  : ['./global-footer.component.css']
})
export class GlobalFooterComponent {
	isDev = isDevMode()
	version = require('../../../package.json').version
	year: number | string = (new Date()).getFullYear()

	constructor() {
		if (this.year < 2018) {
			this.year = '(fix your system time)'
		}
	}
}
