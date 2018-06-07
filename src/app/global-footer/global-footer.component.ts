import { Component, isDevMode, OnInit } from '@angular/core'

declare var require : any

@Component ( {
	selector    : 'app-global-footer',
	templateUrl : './global-footer.component.html',
	styleUrls   : [ './global-footer.component.css' ]
} )
export class GlobalFooterComponent implements OnInit {
	isDev = isDevMode ()
	version : string

	constructor () {}

	ngOnInit () {
		this.version = require ( '../../../package.json' ).version
	}
}
