import {Component, OnInit}       from '@angular/core'
import {MatDialog, MatDialogRef} from '@angular/material/dialog'
import {MatSnackBar}             from '@angular/material/snack-bar'
import {Project}                 from '../../../../backend/src/types/database'
import {ApiService}              from '../../api.service'

@Component({
	selector   : 'app-projects',
	templateUrl: './projects.component.html',
	styleUrls  : ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
	working = true
	projects: Project[]

	constructor(
		private api: ApiService,
		private dialog: MatDialog,
		private snackbar: MatSnackBar
	) {}

	ngOnInit() {
		this.refresh()
	}

	refresh() {
		this.working = true

		this.api.getProjectList().subscribe(
			list => {
				this.projects = list
				this.working = false
			})
	}

	newProject() {
		const dialogRef = this.dialog.open(NewProjectDialogComponent)

		dialogRef.afterClosed().subscribe(
			data => {
				if (data) {
					this.api.newProject(
						data.name,
						data.type
					).subscribe(
						success => {
							if (!success) {
								this.snackbar.open(
									'The new project could not be created.'
								)
							} else {
								this.refresh()
							}
						})
				}
			})
	}

	import() {
		this.dialog.open(ImportDialogComponent).afterClosed().subscribe(
			url => {
				if (url) {
					this.api.import(url).subscribe(
						success => {
							if (success) {
								this.refresh()
							} else {
								this.snackbar.open(
									'Could not import'
								)
							}
						}
					)
				}
			}
		)
	}
}

@Component({
	selector   : 'app-new-project-dialog',
	templateUrl: './dialogs/new-project-dialog.component.html'
})
export class NewProjectDialogComponent {
	data = {
		name: 'New Project',
		type: 0
	}

	constructor(
		public dialogRef: MatDialogRef<NewProjectDialogComponent>
	) {}
}

@Component({
	selector   : 'app-import-dialog',
	templateUrl: './dialogs/import-dialog.component.html'
})
export class ImportDialogComponent {
	url = ''

	constructor(
		public dialogRef: MatDialogRef<ImportDialogComponent>
	) {}
}
