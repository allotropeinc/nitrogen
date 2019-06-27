import {NgModule}         from '@angular/core'
import {AppRoutingModule} from './app-routing.module'

import {AppComponent}     from './app.component'
import {ComponentsModule} from './components.module'
import {DashboardModule}  from './dashboard/dashboard.module'

@NgModule({
	declarations   : [AppComponent],
	imports        : [
		ComponentsModule,
		DashboardModule,
		AppRoutingModule
	],
	bootstrap      : [AppComponent],
	entryComponents: []
})
export class AppModule {}
