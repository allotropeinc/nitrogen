import {Component, Inject, Input, OnInit} from '@angular/core'
import {
	MAT_DIALOG_DATA,
	MatDialog,
	MatDialogRef
}                                         from '@angular/material/dialog'
import {MatSnackBar}                      from '@angular/material/snack-bar'
import {Project}                          from '../../../../../backend/src/types/database'
import {ApiService}                       from '../../../api.service'
import {ProjectsComponent}                from '../projects.component'

@Component({
	selector   : 'app-project-item',
	templateUrl: './project-item.component.html',
	styleUrls  : ['./project-item.component.css']
})
export class ProjectItemComponent implements OnInit {
	@Input()
	project: Project
	@Input()
	index: number
	apiLocation = this.api.apiLocation

	constructor(
		private api: ApiService,
		private parent: ProjectsComponent,
		private snackbar: MatSnackBar,
		private dialog: MatDialog
	) {}

	ngOnInit() {}

	delete() {
		const dialogRef = this.dialog.open(DeleteProjectDialogComponent)

		dialogRef.afterClosed().subscribe(
			name => {
				if (name) {
					this.api.deleteProject(
						this.project.id
					).subscribe(
						success => {
							if (!success) {
								this.snackbar.open(
									'The project could not be deleted.'
								)
							} else {
								this.parent.refresh()
							}
						})
				} else {
					this.parent.working = false
				}
			})
	}

	rename() {
		const dialogRef = this.dialog.open(RenameProjectDialogComponent, {
			data: this.project.name
		})

		dialogRef.afterClosed().subscribe(
			name => {
				if (name) {
					this.api.renameProject(
						this.project.id,
						name
					).subscribe(
						success => {
							if (!success) {
								this.snackbar.open(
									'The project could not be renamed.'
								)
							} else {
								this.parent.refresh()
							}
						})
				} else {
					this.parent.working = false
				}
			})
	}

	first() {
		return this.index === 0
	}

	last() {
		return this.index === this.parent.projects.length - 1
	}

	moveUp() {
		this.parent.working = true

		this.api.moveProject(
			this.project.id,
			this.index - 1
		).subscribe(
			success => {
				if (!success) {
					this.snackbar.open(
						'The project could not be moved up.'
					)
				}

				this.parent.refresh()
			})
	}

	moveDown() {
		this.parent.working = true

		this.api.moveProject(
			this.project.id,
			this.index + 1
		).subscribe(
			success => {
				if (!success) {
					this.snackbar.open(
						'The project could not be moved down.'
					)
				}

				this.parent.refresh()
			})
	}
}

@Component({
	selector   : 'app-delete-project-dialog',
	templateUrl: '../dialogs/delete-project-dialog.component.html'
})
export class DeleteProjectDialogComponent {
	constructor(
		public dialogRef: MatDialogRef<DeleteProjectDialogComponent>
	) {}
}

@Component({
	selector   : 'app-rename-project-dialog',
	templateUrl: '../dialogs/rename-project-dialog.component.html'
})
export class RenameProjectDialogComponent {
	constructor(
		public dialogRef: MatDialogRef<RenameProjectDialogComponent>,
		@Inject(MAT_DIALOG_DATA)
		public name: string
	) {}
}
