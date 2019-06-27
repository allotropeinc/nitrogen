import {CommonModule}                         from '@angular/common'
import {HttpClientModule}                     from '@angular/common/http'
import {
	NgModule,
	Provider
}                                             from '@angular/core'
import {
	FormsModule,
	ReactiveFormsModule
}                                             from '@angular/forms'
import {
	MAT_DIALOG_DEFAULT_OPTIONS,
	MAT_SNACK_BAR_DEFAULT_OPTIONS,
	MatDialogConfig,
	MatSnackBarConfig
}                                             from '@angular/material'
import {BrowserModule}                        from '@angular/platform-browser'
import {BrowserAnimationsModule}              from '@angular/platform-browser/animations'
import {RouterModule}                         from '@angular/router'
import {SplitPaneModule}                      from 'ng2-split-pane/lib/ng2-split-pane'
import {
	EditorComponent as MonacoEditorComponent,
	MonacoEditorModule
}                                             from 'ngx-monaco-editor'
import {AdminDashboardReportsComponent}       from './admin-dashboard/admin-dashboard-reports/admin-dashboard-reports.component'
import {AdminDashboardStarterCodeComponent}   from './admin-dashboard/admin-dashboard-starterCode/admin-dashboard-starterCode.component'
import {
	AdminDashboardUserComponent,
	UserDeleteAccountDialogComponent
}                                             from './admin-dashboard/admin-dashboard-users/admin-dashboard-user/admin-dashboard-user.component'
import {AdminDashboardUsersComponent}         from './admin-dashboard/admin-dashboard-users/admin-dashboard-users.component'
import {AdminDashboardComponent}              from './admin-dashboard/admin-dashboard.component'
import {
	ApiDecryptionDialogComponent,
	ApiProvidePasswordDialogComponent,
	ApiService
}                                             from './api.service'
import {CodeEditorComponent}                  from './editor/code-editor/code-editor.component'
import {EditorSidenavEditorSettingsComponent} from './editor/editor-sidenav/editor-sidenav-editor-settings/editor-sidenav-editor-settings.component'
import {
	ConfirmResetSettingsDialogComponent,
	EditorSidenavComponent
}                                             from './editor/editor-sidenav/editor-sidenav.component'
import {
	CanDeactivateEditor,
	ConfirmLeaveDialogComponent,
	ConfirmPublishDialogComponent,
	ConfirmRevertDialogComponent,
	ConfirmUnpublishDialogComponent,
	EditorComponent,
	ShareProjectDialogComponent
}                                             from './editor/editor.component'
import {EmailInputComponent}                  from './email-input/email-input.component'
import {GlobalFooterComponent}                from './global-footer/global-footer.component'
import {InlineSpinnerComponent}               from './inline-spinner/inline-spinner.component'
import {MaterialModule}                       from './material.module'
import {
	AccountChangePasswordComponent,
	AccountChangeUsernameComponent,
	AccountDeleteDialogComponent,
	AccountOptionsComponent
}                                             from './my-projects-OLD/account-options/account-options.component'
import {
	BugReportComponent,
	BugReportDialogComponent
}                                             from './my-projects-OLD/contact/bug-report.component'
import {
	MaintenanceDialogComponent,
	MyProjectsComponent
}                                             from './my-projects-OLD/my-projects.component'
import {
	DeleteProjectDialogComponent,
	ProjectItemComponent,
	RenameProjectDialogComponent
}                                             from './my-projects-OLD/projects/project-item/project-item.component'
import {
	ImportDialogComponent,
	NewProjectDialogComponent,
	ProjectsComponent
}                                             from './my-projects-OLD/projects/projects.component'
import {ConfirmPasswordInputComponent}        from './password-input/confirm-password-input/confirm-password-input.component'
import {PasswordInputComponent}               from './password-input/password-input.component'
import {RegisterComponent}                    from './register/register.component'
import {SafeUrlPipe}                          from './safe-url.pipe'
import {SigninComponent}                      from './signin/signin.component'
import {UsernameInputComponent}               from './username-input/username-input.component'

const declarations = [
	GlobalFooterComponent,
	UsernameInputComponent,
	PasswordInputComponent,
	ConfirmPasswordInputComponent,
	SigninComponent,
	RegisterComponent,
	MyProjectsComponent,
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
	AdminDashboardComponent,
	AdminDashboardUsersComponent,
	AdminDashboardReportsComponent,
	AdminDashboardUserComponent,
	AdminDashboardStarterCodeComponent,
	ApiProvidePasswordDialogComponent,
	ApiDecryptionDialogComponent,
	ShareProjectDialogComponent,
	UserDeleteAccountDialogComponent,
	MaintenanceDialogComponent,
	EmailInputComponent,
	InlineSpinnerComponent
]

const imports = <any[]> [
	MaterialModule,
	BrowserModule,
	BrowserAnimationsModule,
	MaterialModule,
	RouterModule,
	FormsModule,
	ReactiveFormsModule,
	SplitPaneModule,
	MonacoEditorModule,
	HttpClientModule
]

const entryComponents = [
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

const providers: Provider[] = [
	ApiService,
	CanDeactivateEditor,
	{
		provide : MAT_SNACK_BAR_DEFAULT_OPTIONS,
		useValue: <MatSnackBarConfig> {duration: 2500}
	},
	{
		provide : MAT_DIALOG_DEFAULT_OPTIONS,
		useValue: <MatDialogConfig> {
			width      : '400px',
			hasBackdrop: true
		}
	}
]

const ngModule: NgModule = {
	declarations   : declarations,
	imports        : [
		CommonModule,
		...imports
	],
	entryComponents: entryComponents,
	providers      : providers,
	exports        : [
		...imports,
		...declarations
	]
}

@NgModule(ngModule)
export class ComponentsModule {}
