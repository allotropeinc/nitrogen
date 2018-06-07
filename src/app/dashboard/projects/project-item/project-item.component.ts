import { Component, Inject, Input, OnInit }                      from '@angular/core'
import { ApiService }                                            from '../../../api.service'
import { ProjectsComponent }                                     from '../projects.component'
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSnackBar } from '@angular/material'
import { ClientProject }                                         from '../../../../../backend/types'

@Component ( {
	selector    : 'app-project-item',
	templateUrl : './project-item.component.html',
	styleUrls   : [ './project-item.component.css' ]
} )
export class ProjectItemComponent implements OnInit {
	@Input ()
	project : ClientProject
	apiLocation = this.api.apiLocation

	constructor (
		private api : ApiService,
		private parent : ProjectsComponent,
		private snackbar : MatSnackBar,
		private dialog : MatDialog
	) {}

	ngOnInit () {}

	delete () {
		/*
		 this.parent.working = true

		 this.api.deleteProject ( this.project.id ).subscribe (
		 success => {
		 if ( !success ) {
		 this.snackbar.open (
		 'The project could not be deleted.',
		 'Close'
		 )
		 } else {
		 this.parent.refresh ()
		 }
		 } )*/
		const dialogRef = this.dialog.open (
			DeleteProjectDialogComponent,
			{
				width : '300px'
			}
		)

		this.parent.working = true

		dialogRef.afterClosed ().subscribe (
			name => {
				if ( name ) {
					this.api.deleteProject (
						this.project.id
					).subscribe (
						success => {
							if ( !success ) {
								this.snackbar.open (
									'The project could not be deleted.',
									'Close'
								)

								this.parent.working = false
							} else {
								this.parent.refresh ()
							}
						} )
				} else {
					this.parent.working = false
				}
			} )
	}

	rename () {
		const dialogRef = this.dialog.open (
			RenameProjectDialogComponent,
			{
				width : '300px',
				data  : this.project.name
			}
		)

		this.parent.working = true

		dialogRef.afterClosed ().subscribe (
			name => {
				if ( name ) {
					this.api.renameProject (
						this.project.id,
						name
					).subscribe (
						success => {
							if ( !success ) {
								this.snackbar.open (
									'The project could not be renamed.',
									'Close'
								)

								this.parent.working = false
							} else {
								this.parent.refresh ()
							}
						} )
				} else {
					this.parent.working = false
				}
			} )
	}

	first () {
		return this.project.id === 0
	}

	last () {
		return this.project.id === this.parent.projects.length - 1
	}

	moveUp () {
		this.parent.working = true

		this.api.moveProjectUp (
			this.project.id
		).subscribe (
			success => {
				if ( !success ) {
					this.snackbar.open (
						'The project could not be moved up.',
						'Close'
					)
				}

				this.parent.refresh ()
			} )
	}

	moveDown () {
		this.parent.working = true

		this.api.moveProjectDown (
			this.project.id
		).subscribe (
			success => {
				if ( !success ) {
					this.snackbar.open (
						'The project could not be moved down.',
						'Close'
					)
				}

				this.parent.refresh ()
			} )
	}
}

@Component ( {
	selector    : 'app-delete-project-dialog',
	templateUrl : '../dialogs/delete-project-dialog.component.html'
} )
export class DeleteProjectDialogComponent {
	constructor (
		public dialogRef : MatDialogRef<DeleteProjectDialogComponent>
	) {}
}

@Component ( {
	selector    : 'app-rename-project-dialog',
	templateUrl : '../dialogs/rename-project-dialog.component.html'
} )
export class RenameProjectDialogComponent {
	constructor (
		public dialogRef : MatDialogRef<RenameProjectDialogComponent>,
		@Inject ( MAT_DIALOG_DATA )
		public name : string
	) {}
}
