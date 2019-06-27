import {NgModule}                    from '@angular/core'
import {Route, RouterModule, Routes} from '@angular/router'
import {ComponentsModule}            from '../components.module'
import {DashboardComponent}          from './dashboard.component'
import {DashboardData}               from './data'
import {DashboardCanActivate}        from './guard.service'

const DashboardRoutes: Routes = [
	{
		path       : 'dashboard',
		component  : DashboardComponent,
		canActivate: [DashboardCanActivate],
		children   :
			DashboardData.sidebarData.map(
				(g: DashboardData.SidebarGroup): Route => ({
					path    : g.path,
					children: g.components.map(d => d.route).concat({
						path      : '**',
						redirectTo: g.components[0].route.path
					})
				})
			).concat([
				{
					path      : '**',
					redirectTo: DashboardData.sidebarData[0].path
				}
			])
	}
]

const components =
	      [].concat(...DashboardData.componentsData
		      .map(d => d.components.concat([d.route.component])))

const providers =
	      [].concat(...DashboardData.componentsData.map(d => d.providers))

const entries =
	      [].concat(...DashboardData.componentsData.map(d => d.entries))

@NgModule({
	imports        : [
		ComponentsModule,
		RouterModule.forChild(DashboardRoutes)
	],
	exports        : [RouterModule],
	declarations   : components,
	providers      : providers,
	entryComponents: entries
})
export class DashboardRoutingModule {}
