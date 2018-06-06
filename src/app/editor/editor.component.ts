import { Component, Inject, OnInit, ViewChild }                  from '@angular/core'
import { ActivatedRoute, CanDeactivate, Router }                 from '@angular/router'
import { ApiService }                                            from '../api.service'
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSnackBar } from '@angular/material'
import { CodeEditorComponent }                                   from './code-editor/code-editor.component'
import { Project }                                               from '../project'
import { Observable }                                            from 'rxjs'
import * as beautify                                             from 'js-beautify'
import IEditorConstructionOptions = monaco.editor.IEditorConstructionOptions

@Component ( {
	selector    : 'app-editor',
	templateUrl : './editor.component.html',
	styleUrls   : [ './editor.component.css' ]
} )
export class EditorComponent implements OnInit {
	id = +this.route.snapshot.paramMap.get ( 'id' )
	working = true
	originalCode : string
	code : string
	saving = false
	url = 'about:blank'
	dragging = false
	editorOptions : IEditorConstructionOptions
	@ViewChild ( CodeEditorComponent )
	editor : CodeEditorComponent
	project : Project
	unsaved = false
	publishing = false
	apiLocation = this.api.apiLocation
	autoUpdate = true

	constructor (
		private route : ActivatedRoute,
		private router : Router,
		private api : ApiService,
		private snackbar : MatSnackBar,
		public dialog : MatDialog
	) {}

	ngOnInit () {
		this.working = true

		window.onbeforeunload = ( event : BeforeUnloadEvent ) => {
			if ( this.unsaved ) {
				event.returnValue = 'Are you sure you want to leave?'

				return event.returnValue
			}
		}

		this.api.getTokenValidity ().subscribe (
			valid => {
				if ( valid ) {
					this.api.getProject ( this.id ).subscribe (
						project => {
							if ( project ) {
								this.code = this.originalCode = ( this.project = project ).code
								this.update ()

								this.api.getEditorOptions ().subscribe (
									editorOptions => {
										if ( editorOptions ) {
											this.editorOptions = editorOptions
											this.working = false
										} else {
											this.snackbar.open (
												'The editor settings could not be loaded.',
												'Retry'
											).onAction ().subscribe ( () => {
												this.ngOnInit ()
											} )
										}
									} )
							} else {
								this.snackbar.open (
									'The project could not be opened.',
									'Return to Dashboard'
								).onAction ().subscribe ( () => {
									this.router.navigate ( [ '/signin' ] )
								} )
							}
						} )
				} else {
					this.router.navigate ( [ '/signin' ] )
				}
			} )
	}

	onChange () {
		if ( this.autoUpdate ) {
			this.update ()
		}

		this.unsaved = this.code !== this.originalCode
	}

	update () {
		this.url = URL.createObjectURL ( new Blob (
			[ this.code ],
			{ type : 'text/html' }
		) )

		this.unsaved = this.code !== this.originalCode
	}

	save () {
		if ( this.saving ) {
			return
		}

		this.saving = true

		this.api.setProjectCode (
			this.id,
			this.code,
			!this.project.publishToken
		).subscribe (
			success => {
				if ( !success ) {
					this.snackbar.open (
						'The project could not be saved.',
						'Close'
					)
				} else {
					this.originalCode = this.code
					this.unsaved = false
				}

				this.saving = false
			} )
	}

	reloadCodeEditor () {
		return this.editor.reload ()
	}

	unpublish () {
		const dialogRef = this.dialog.open (
			ConfirmUnpublishDialogComponent,
			{
				width : '300px'
			}
		)

		dialogRef.afterClosed ().subscribe (
			( unpublish : boolean ) => {
				if ( unpublish ) {
					this.publishing = true

					this.api.unpublishProject ( this.project.id ).subscribe ( ( success ) => {
						if ( success ) {
							this.project.publishToken = null
							this.save ()
						} else {
							this.snackbar.open (
								'The project could not be unpublished.',
								'Close'
							)
						}

						this.publishing = false
					} )
				}
			}
		)
	}

	publish () {
		const dialogRef = this.dialog.open (
			ConfirmPublishDialogComponent,
			{
				width : '300px'
			}
		)

		dialogRef.afterClosed ().subscribe (
			( publish : boolean ) => {
				if ( publish ) {
					this.publishing = true

					this.api.publishProject ( this.project.id ).subscribe ( ( publishToken : string ) => {
						if ( publishToken ) {
							this.project.publishToken = publishToken

							this.save ()
						} else {
							this.snackbar.open (
								'The project could not be published.',
								'Close'
							)
						}

						this.publishing = false
					} )
				}
			}
		)
	}

	revert () {
		const dialogRef = this.dialog.open (
			ConfirmRevertDialogComponent,
			{
				width : '300px'
			}
		)

		dialogRef.afterClosed ().subscribe ( ( revert : boolean ) => {
			if ( revert ) {
				if ( !this.editor.setValue ( this.originalCode ) ) {
					this.snackbar.open (
						'The code could not be reverted.',
						'Close'
					)
				}
			}
		} )
	}

	hotkey ( $event : KeyboardEvent ) {
		if ( $event.key === 's' && ( $event.metaKey || $event.ctrlKey ) ) {
			this.save ()

			$event.preventDefault ()
		}
	}

	share () {
		this.dialog.open (
			ShareProjectDialogComponent,
			{
				width : '300px',
				data  : this.project
			}
		)
	}

	tidy () {
		this.editor.setValue (
			beautify.html (
				this.code,
				{
					indent_inner_html : true,
					indent_with_tabs  : true,
					wrap_line_length  : 0,
					brace_style       : 'end-expand',
					preserve_newlines : false,
					extra_liners      : [ 'style' ]
				}
			)
		)
	}
}

export class CanDeactivateEditor implements CanDeactivate<EditorComponent> {
	constructor () {}

	canDeactivate (
		editor : EditorComponent
	) : Observable<boolean> {
		return new Observable (
			observer => {
				if ( editor.unsaved ) {
					const dialogRef = editor.dialog.open (
						ConfirmLeaveDialogComponent,
						{
							width : '300px'
						}
					)

					dialogRef.afterClosed ().subscribe (
						leave => {
							if ( leave ) {
								editor.unsaved = false
							}

							observer.next ( leave )
							observer.complete ()
						}
					)
				} else {
					observer.next ( true )
					observer.complete ()
				}
			} )
	}
}

@Component ( {
	selector    : 'app-confirm-revert-dialog',
	templateUrl : './dialogs/confirm-revert-dialog.component.html'
} )
export class ConfirmRevertDialogComponent {
	constructor (
		public dialogRef : MatDialogRef<ConfirmRevertDialogComponent>
	) {}
}

@Component ( {
	selector    : 'app-confirm-leave-dialog',
	templateUrl : './dialogs/confirm-leave-dialog.component.html'
} )
export class ConfirmLeaveDialogComponent {
	constructor (
		public dialogRef : MatDialogRef<ConfirmLeaveDialogComponent>
	) {}
}

@Component ( {
	selector    : 'app-confirm-unpublish-dialog',
	templateUrl : './dialogs/confirm-unpublish-dialog.component.html'
} )
export class ConfirmUnpublishDialogComponent {
	constructor (
		public dialogRef : MatDialogRef<ConfirmUnpublishDialogComponent>
	) {}
}

@Component ( {
	selector    : 'app-confirm-publish-dialog',
	templateUrl : './dialogs/confirm-publish-dialog.component.html'
} )
export class ConfirmPublishDialogComponent {
	constructor (
		public dialogRef : MatDialogRef<ConfirmPublishDialogComponent>
	) {}
}

@Component ( {
	selector    : 'app-share-project-dialog',
	templateUrl : './dialogs/share-project-dialog.component.html'
} )
export class ShareProjectDialogComponent {
	constructor (
		@Inject ( MAT_DIALOG_DATA )
		public project : any,
		public api : ApiService
	) {}
}
