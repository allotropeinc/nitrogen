import {
	animate,
	group,
	query,
	style,
	transition,
	trigger
}                                            from '@angular/animations'
import {BreakpointObserver, BreakpointState} from '@angular/cdk/layout'
import {Component, OnInit}                   from '@angular/core'
import {Router}                              from '@angular/router'
import {ApiService}                          from '../api.service'
import {DashboardService}                    from './dashboard.service'

@Component({
	selector   : 'app-account-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls  : ['./dashboard.component.css'],
	providers  : [DashboardService],
	animations : [
		trigger('routerAnimation', [
			transition(':enter, :leave', []),
			transition('* <=> *', [
				group([
					query(':enter', [
						style({
							transform: 'scale(0.95)',
							opacity  : 0
						}),
						animate(
							'0.2s ease-out',
							style({
								transform: 'scale(1)',
								opacity  : 1
							})
						)
					]),
					query(':leave', [
						style({
							transform: 'scale(1)',
							opacity  : 1
						}),
						animate(
							'0.2s ease-out',
							style({
								transform: 'scale(0.95)',
								opacity  : 0
							})
						)
					])
				])
			])
		])
	]
})
export class DashboardComponent implements OnInit {
	public working = true
	public sidebarMode = 'side'

	constructor(
		public service: DashboardService,
		public breakpointObserver: BreakpointObserver,
		public api: ApiService,
		public router: Router
	) {
		breakpointObserver
			.observe('(min-width: 900px)')
			.subscribe(
				(breakpointState: BreakpointState) => {
					this.sidebarMode = breakpointState.matches ? 'side' : 'over'
				}
			)
	}

	ngOnInit() {
		this.api.getTokenValidity()
			.subscribe(
				(valid: boolean) => {
					if (valid) {
						this.working = false
					} else {
						this.router.navigate([''])
					}
				}
			)
	}
}
