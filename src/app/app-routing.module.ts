import {NgModule}                             from '@angular/core'
import {RouterModule, Routes}                 from '@angular/router'
import {AdminDashboardReportsComponent}       from './admin-dashboard/admin-dashboard-reports/admin-dashboard-reports.component'
import {AdminDashboardStarterCodeComponent}   from './admin-dashboard/admin-dashboard-starterCode/admin-dashboard-starterCode.component'
import {AdminDashboardUserComponent}          from './admin-dashboard/admin-dashboard-users/admin-dashboard-user/admin-dashboard-user.component'
import {AdminDashboardUsersComponent}         from './admin-dashboard/admin-dashboard-users/admin-dashboard-users.component'
import {AdminDashboardComponent}              from './admin-dashboard/admin-dashboard.component'
import {CanDeactivateEditor, EditorComponent} from './editor/editor.component'
import {MyProjectsComponent}                  from './my-projects-OLD/my-projects.component'
import {RegisterComponent}                    from './register/register.component'
import {SigninComponent}                      from './signin/signin.component'

const routes: Routes = [
	{
		path      : '',
		redirectTo: 'signin',
		pathMatch : 'full'
	},
	{
		path     : 'signin',
		component: SigninComponent
	},
	{
		path     : 'register',
		component: RegisterComponent
	},
	{
		path     : 'my-projects',
		component: MyProjectsComponent
	},
	{
		path         : 'edit/:id',
		component    : EditorComponent,
		canDeactivate: [CanDeactivateEditor]
	},
	{
		path     : 'admin',
		component: AdminDashboardComponent,
		children : [
			{
				path      : '',
				redirectTo: 'users',
				pathMatch : 'full'
			},
			{
				path     : 'users',
				component: AdminDashboardUsersComponent
			},
			{
				path     : 'users/:username',
				component: AdminDashboardUserComponent
			},
			{
				path     : 'reports',
				component: AdminDashboardReportsComponent
			},
			{
				path     : 'starterCode',
				component: AdminDashboardStarterCodeComponent
			},
			{
				path      : '**',
				redirectTo: 'users'
			}
		]
	},
	{
		path      : '**',
		redirectTo: 'signin'
	}
]

@NgModule({
	imports: [
		RouterModule.forRoot(
			routes,
			{
				onSameUrlNavigation: 'reload'
			}
		)
	],
	exports: [
		RouterModule
	]
})
export class AppRoutingModule {
}
