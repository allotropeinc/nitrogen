import {Component, Input, OnInit}                         from '@angular/core'
import {MatDialog, MatDialogRef, MatSidenav, MatSnackBar} from '@angular/material'
import {AccountSettings}                                  from '../../../../backend/types'
import {ApiService}                                       from '../../api.service'
import {EditorComponent}                                  from '../editor.component'

@Component({
	selector   : 'app-editor-sidenav',
	templateUrl: './editor-sidenav.component.html',
	styleUrls  : ['./editor-sidenav.component.css']
})
export class EditorSidenavComponent implements OnInit {
	public settingsReady = false
	public saving = false
	private _settings: AccountSettings

	@Input()
	set settings(settings: AccountSettings) {
		this._settings = settings

		if (settings) {
			this.settingsReady = true
		}
	}

	get settings() {
		return this._settings
	}

	constructor(
		public sidenav: MatSidenav,
		private editor: EditorComponent,
		private api: ApiService,
		private snackbar: MatSnackBar,
		private dialog: MatDialog
	) {}

	ngOnInit() {}

	saveSettings() {
		this.saving = true

		this.api.setSettings(this.settings).subscribe(
			success => {
				if (success) {
					this.editor.reloadCodeEditor().subscribe(
						reloaded => {
							if (!reloaded) {
								this.snackbar.open(
									'The editor settings could not be reloaded.',
									'Retry'
								).onAction().subscribe(() => {
									this.saveSettings()
								})
							}

							this.saving = false
						})
				} else {
					this.snackbar.open(
						'The editor settings could not be saved.',
						'Close'
					)

					this.saving = false
				}
			}
		)
	}

	resetSettings() {
		this.saving = true

		const dialogRef = this.dialog.open(
			ConfirmResetSettingsDialogComponent,
			{
				width: '300px'
			}
		)

		dialogRef.afterClosed().subscribe(
			agreed => {
				if (agreed) {
					this.api.resetSettings().subscribe(
						success => {
							if (success) {
								this.api.getSettings().subscribe(
									settings => {
										if (settings) {
											this.settings = settings

											this.saveSettings()
										} else {
											this.snackbar.open(
												'The editor settings could not be reset.',
												'Close'
											)
										}

										this.saving = false
									})
							} else {
								this.snackbar.open(
									'The editor settings could not be reset.',
									'Close'
								)

								this.saving = false
							}
						})
				} else {
					this.saving = false
				}
			})
	}
}

@Component({
	selector   : 'app-confirm-reset-settings-dialog',
	templateUrl: './dialogs/confirm-reset-settings-dialog.component.html'
})
export class ConfirmResetSettingsDialogComponent {
	constructor(
		public dialogRef: MatDialogRef<ConfirmResetSettingsDialogComponent>
	) {}
}
