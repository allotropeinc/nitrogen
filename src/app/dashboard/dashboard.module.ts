import {LayoutModule}              from '@angular/cdk/layout'
import {CommonModule}              from '@angular/common'
import {NgModule}                  from '@angular/core'
import {ComponentsModule}          from '../components.module'
import {DashboardComponent}        from './dashboard.component'
import {DashboardCanActivate}      from './guard.service'
import {DashboardRoutingModule}    from './routing.module'
import {DashboardSidenavComponent} from './sidenav.component'

@NgModule({
	imports     : [
		CommonModule,
		ComponentsModule,
		LayoutModule,
		DashboardRoutingModule
	],
	declarations: [
		DashboardComponent,
		DashboardSidenavComponent
	],
	providers   : [
		DashboardCanActivate
	]
})
export class DashboardModule {}
