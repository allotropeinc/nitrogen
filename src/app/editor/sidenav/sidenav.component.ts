import { Component, Input, OnInit }                         from '@angular/core'
import { MatDialog, MatDialogRef, MatSidenav, MatSnackBar } from '@angular/material'
import { ApiService }                                       from '../../api.service'
import { EditorComponent }                                  from '../editor.component'
import IEditorConstructionOptions = monaco.editor.IEditorConstructionOptions

@Component ( {
	selector    : 'app-sidenav',
	templateUrl : './sidenav.component.html',
	styleUrls   : [ './sidenav.component.css' ]
} )
export class SidenavComponent implements OnInit {
	public optionsReady = false
	public saving = false
	private _editorOptions : IEditorConstructionOptions

	@Input ()
	set editorOptions ( editorOptions : IEditorConstructionOptions ) {
		this._editorOptions = editorOptions

		if ( editorOptions ) {
			this.optionsReady = true
		}
	}

	get editorOptions () {
		return this._editorOptions
	}

	constructor (
		public sidenav : MatSidenav,
		private editor : EditorComponent,
		private api : ApiService,
		private snackbar : MatSnackBar,
		private dialog : MatDialog
	) {}

	ngOnInit () {}

	saveSettings () {
		this.saving = true

		this.api.setEditorOptions ( this.editorOptions ).subscribe (
			success => {
				if ( success ) {
					this.editor.reloadCodeEditor ().subscribe (
						reloaded => {
							if ( !reloaded ) {
								this.snackbar.open (
									'The editor settings could not be reloaded.',
									'Retry'
								).onAction ().subscribe ( function () {
									this.saveSettings ()
								}.bind ( this ) )
							}

							this.saving = false
						} )
				} else {
					this.snackbar.open (
						'The editor settings could not be saved.',
						'Close'
					)

					this.saving = false
				}
			}
		)
	}

	resetSettings () {
		this.saving = true

		const dialogRef = this.dialog.open (
			ConfirmResetSettingsDialogComponent,
			{
				width : '300px'
			}
		)

		dialogRef.afterClosed ().subscribe (
			agreed => {
				if ( agreed ) {
					this.api.resetEditorOptions ().subscribe (
						success => {
							if ( success ) {
								this.api.getEditorOptions ().subscribe (
									options => {
										if ( options ) {
											this.editorOptions = options

											this.saveSettings ()
										} else {
											this.snackbar.open (
												'The editor settings could not be reset.',
												'Close'
											)
										}

										this.saving = false
									} )
							} else {
								this.snackbar.open (
									'The editor settings could not be reset.',
									'Close'
								)

								this.saving = false
							}
						} )
				} else {
					this.saving = false
				}
			} )
	}
}

@Component ( {
	selector    : 'app-confirm-reset-settings-dialog',
	templateUrl : './dialogs/confirm-reset-settings-dialog.component.html'
} )
export class ConfirmResetSettingsDialogComponent {
	constructor (
		public dialogRef : MatDialogRef<ConfirmResetSettingsDialogComponent>
	) {}
}
