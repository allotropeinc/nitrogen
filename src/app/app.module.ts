import { BrowserModule }                                                               from '@angular/platform-browser'
import { BrowserAnimationsModule }                                                     from '@angular/platform-browser/animations'
import { NgModule }                                                                    from '@angular/core'
import {EditorSidenavEditorSettingsComponent}                                          from './editor/editor-sidenav/editor-sidenav-editor-settings/editor-sidenav-editor-settings.component'
import { MaterialModule }                                                              from './material.module'
import { ApiDecryptionDialogComponent, ApiProvidePasswordDialogComponent, ApiService } from './api.service'
import { FormsModule, ReactiveFormsModule }                                            from '@angular/forms'
import { MonacoEditorModule }                                                          from 'ngx-monaco-editor'

import { AppComponent }                                   from './app.component'
import { AppRoutingModule }                               from './app-routing.module'
import { GlobalFooterComponent }                          from './global-footer/global-footer.component'
import { SigninComponent }                                from './signin/signin.component'
import { RegisterComponent }                              from './register/register.component'
import { DashboardComponent, MaintenanceDialogComponent } from './dashboard/dashboard.component'
import {
	ImportDialogComponent,
	NewProjectDialogComponent,
	ProjectsComponent
}                                                         from './dashboard/projects/projects.component'
import {
	DeleteProjectDialogComponent,
	ProjectItemComponent,
	RenameProjectDialogComponent
}                                                         from './dashboard/projects/project-item/project-item.component'
import {
	CanDeactivateEditor,
	ConfirmLeaveDialogComponent,
	ConfirmPublishDialogComponent,
	ConfirmRevertDialogComponent,
	ConfirmUnpublishDialogComponent,
	EditorComponent,
	ShareProjectDialogComponent
}                                                   from './editor/editor.component'
import { SplitPaneModule }                          from 'ng2-split-pane/lib/ng2-split-pane'
import { SafeUrlPipe }                              from './safe-url.pipe'
import {
	BugReportComponent,
	BugReportDialogComponent
}                                                   from './dashboard/contact/bug-report.component'
import {
	ConfirmResetSettingsDialogComponent,
	EditorSidenavComponent
}                                                   from './editor/editor-sidenav/editor-sidenav.component'
import { HttpClientModule }                         from '@angular/common/http'
import { CodeEditorComponent }                      from 'app/editor/code-editor/code-editor.component'
import { EditorComponent as MonacoEditorComponent } from 'ngx-monaco-editor/editor.component'
import {
	AccountChangePasswordComponent,
	AccountChangeUsernameComponent,
	AccountDeleteDialogComponent,
	AccountOptionsComponent
}                                                   from './dashboard/account-options/account-options.component'
import { AdminButtonComponent }                     from './dashboard/admin-button/admin-button.component'
import { AdminDashboardComponent }            from './admin-dashboard/admin-dashboard.component'
import { AdminDashboardUsersComponent }       from './admin-dashboard/admin-dashboard-users/admin-dashboard-users.component'
import { AdminDashboardReportsComponent }     from './admin-dashboard/admin-dashboard-reports/admin-dashboard-reports.component'
import {
	AdminDashboardUserComponent,
	UserDeleteAccountDialogComponent
}                                             from './admin-dashboard/admin-dashboard-users/admin-dashboard-user/admin-dashboard-user.component'
import { AdminDashboardStarterCodeComponent }       from './admin-dashboard/admin-dashboard-starterCode/admin-dashboard-starterCode.component'

@NgModule ( {
	declarations    : [
		AppComponent,
		GlobalFooterComponent,
		SigninComponent,
		RegisterComponent,
		DashboardComponent,
		ProjectsComponent,
		ProjectItemComponent,
		EditorComponent,
		NewProjectDialogComponent,
		ImportDialogComponent,
		RenameProjectDialogComponent,
		DeleteProjectDialogComponent,
		SafeUrlPipe,
		BugReportComponent,
		BugReportDialogComponent,
		EditorSidenavComponent,
		EditorSidenavEditorSettingsComponent,
		CodeEditorComponent,
		AccountDeleteDialogComponent,
		ConfirmLeaveDialogComponent,
		ConfirmRevertDialogComponent,
		ConfirmUnpublishDialogComponent,
		ConfirmPublishDialogComponent,
		ConfirmResetSettingsDialogComponent,
		AccountOptionsComponent,
		AccountChangePasswordComponent,
		AccountChangeUsernameComponent,
		AdminButtonComponent,
		AdminDashboardComponent,
		AdminDashboardUsersComponent,
		AdminDashboardReportsComponent,
		AdminDashboardUserComponent,
		AdminDashboardStarterCodeComponent,
		ApiProvidePasswordDialogComponent,
		ApiDecryptionDialogComponent,
		ShareProjectDialogComponent,
		UserDeleteAccountDialogComponent,
		MaintenanceDialogComponent
	],
	imports         : [
		BrowserModule,
		BrowserAnimationsModule,
		MaterialModule,
		AppRoutingModule,
		FormsModule,
		ReactiveFormsModule,
		SplitPaneModule,
		MonacoEditorModule.forRoot (),
		HttpClientModule
	],
	providers       : [
		ApiService,
		CanDeactivateEditor
	],
	bootstrap       : [ AppComponent ],
	entryComponents : [
		NewProjectDialogComponent,
		ImportDialogComponent,
		RenameProjectDialogComponent,
		DeleteProjectDialogComponent,
		BugReportDialogComponent,
		MonacoEditorComponent,
		ConfirmLeaveDialogComponent,
		ConfirmRevertDialogComponent,
		ConfirmUnpublishDialogComponent,
		ConfirmPublishDialogComponent,
		ConfirmResetSettingsDialogComponent,
		AccountChangeUsernameComponent,
		AccountChangePasswordComponent,
		AccountDeleteDialogComponent,
		ApiProvidePasswordDialogComponent,
		ApiDecryptionDialogComponent,
		ShareProjectDialogComponent,
		UserDeleteAccountDialogComponent,
		MaintenanceDialogComponent
	]
} )
export class AppModule {}
