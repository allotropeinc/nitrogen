import { Component, isDevMode, OnInit } from '@angular/core'

@Component ( {
	selector    : 'app-global-footer',
	templateUrl : './global-footer.component.html',
	styleUrls   : [ './global-footer.component.css' ]
} )
export class GlobalFooterComponent implements OnInit {
	isDev = isDevMode ()

	constructor () {}

	ngOnInit () {
	}

}
