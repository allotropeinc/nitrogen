import { Component, Inject, OnInit }                             from '@angular/core'
import { ApiService }                                            from '../../api.service'
import { Project }                                               from '../../project'
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSnackBar } from '@angular/material'

@Component ( {
	selector    : 'app-projects',
	templateUrl : './projects.component.html',
	styleUrls   : [ './projects.component.css' ]
} )
export class ProjectsComponent implements OnInit {
	working = true
	projects : Project[]

	constructor (
		private api : ApiService,
		private dialog : MatDialog,
		private snackbar : MatSnackBar
	) {}

	ngOnInit () {
		this.refresh ()
	}

	refresh () {
		this.working = true

		this.api.getProjectList ().subscribe (
			list => {
				this.projects = list
				this.working = false
			} )
	}

	newProject () {
		const dialogRef = this.dialog.open (
			NewProjectDialogComponent,
			{
				width: '300px'
			}
		)

		this.working = true

		dialogRef.afterClosed ().subscribe (
			name => {
				if ( name ) {
					this.api.newProject ( name ).subscribe (
						success => {
							if ( !success ) {
								this.snackbar.open (
									'The new project could not be created.',
									'Close'
								)

								this.working = false
							} else {
								this.refresh ()
							}
						} )
				} else {
					this.working = false
				}
			} )
	}
}

@Component ( {
	selector    : 'app-new-project-dialog',
	templateUrl : './dialogs/new-project-dialog.component.html'
} )
export class NewProjectDialogComponent {
	name = 'New Project'

	constructor (
		public dialogRef : MatDialogRef<NewProjectDialogComponent>
	) {}
}
