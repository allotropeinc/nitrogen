import { NgModule }                             from '@angular/core'
import { RouterModule, Routes }                 from '@angular/router'
import { DashboardComponent }                   from './dashboard/dashboard.component'
import { SigninComponent }                      from './signin/signin.component'
import { CanDeactivateEditor, EditorComponent } from './editor/editor.component'
import { RegisterComponent }                    from './register/register.component'
import { AdminDashboardComponent }              from './admin-dashboard/admin-dashboard.component'
import { AdminDashboardUsersComponent }         from './admin-dashboard/admin-dashboard-users/admin-dashboard-users.component'
import { AdminDashboardReportsComponent }       from './admin-dashboard/admin-dashboard-reports/admin-dashboard-reports.component'
import { AdminDashboardUserComponent }          from './admin-dashboard/admin-dashboard-users/admin-dashboard-user/admin-dashboard-user.component'

const routes : Routes = [
	{
		path       : '',
		redirectTo : 'signin',
		pathMatch  : 'full'
	},
	{
		path      : 'signin',
		component : SigninComponent
	},
	{
		path      : 'register',
		component : RegisterComponent
	},
	{
		path      : 'dashboard',
		component : DashboardComponent
	},
	{
		path          : 'edit/:id',
		component     : EditorComponent,
		canDeactivate : [ CanDeactivateEditor ]
	},
	{
		path      : 'admin',
		component : AdminDashboardComponent,
		children  : [
			{
				path       : '',
				redirectTo : 'users',
				pathMatch  : 'full'
			},
			{
				path      : 'users',
				component : AdminDashboardUsersComponent
			},
			{
				path      : 'users/:username',
				component : AdminDashboardUserComponent
			},
			{
				path      : 'reports',
				component : AdminDashboardReportsComponent
			}
		]
	}
]

@NgModule ( {
	imports : [
		RouterModule.forRoot (
			routes,
			{
				onSameUrlNavigation : 'reload'
			}
		)
	],
	exports : [
		RouterModule
	]
} )
export class AppRoutingModule {
}
