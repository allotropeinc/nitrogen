import { Component, Inject, Injectable, isDevMode }                                          from '@angular/core'
import { Observable, Observer, of }                                                          from 'rxjs'
import { Account, BugReport, ClientProject, DECRYPTION_CONFIRMATION_HEADER, MinimalAccount } from '../../backend/types'
import { HttpClient }                                                                        from '@angular/common/http'
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSnackBar }                             from '@angular/material'
import { URL }                                                                               from 'url-parse'
import IEditorConstructionOptions = monaco.editor.IEditorConstructionOptions

declare const CryptoJS : any

@Injectable ()
export class ApiService {
	public apiLocation = isDevMode () ? 'http://localhost:5015/api' : '/api'
	public username = null
	protected password = null
	public token = null
	public ready = false

	constructor (
		private http : HttpClient,
		private dialog : MatDialog,
		private snackbar : MatSnackBar
	) {
		if ( localStorage.hasOwnProperty ( 'account' ) ) {
			const details = JSON.parse ( localStorage[ 'account' ] )

			this.username = details.username
			this.token = details.token

			this.getTokenValidity ().subscribe (
				success => {
					if ( success ) {
						this.askForPassword ()
					} else {
						this.username = null
						this.token = null

						this.saveAccount ()

						this.ready = true
					}
				}
			)
		} else {
			this.ready = true
		}
	}

	protected askForPassword () {
		this.log (
			'askForPassword'
		)

		this.dialog.open (
			ApiProvidePasswordDialogComponent,
			{
				width : '300px',
				data  : this.username
			}
		).afterClosed ().subscribe (
			( data : string ) => {
				if ( data === undefined ) {
					this.username = null
					this.token = null

					this.saveAccount ()

					this.ready = true
				} else {
					this.checkPassword ( data ).subscribe (
						( valid : boolean ) => {
							if ( valid ) {
								this.password = data

								this.ready = true
							} else {
								this.snackbar.open (
									'Invalid password.',
									'Close'
								)

								this.askForPassword ()
							}
						}
					)
				}
			}
		)
	}

	protected saveAccount () : void {
		this.log (
			'saveAccount'
		)

		if ( this.token ) {
			localStorage[ 'account' ] = JSON.stringify ( {
				username : this.username,
				token    : this.token
			} )
		} else {
			delete localStorage[ 'account' ]
		}
	}

	protected log ( ... args : any[] ) {
		if ( isDevMode () ) {
			console.log ( ... args )
		}
	}

	protected request (
		url : string,
		body? : Object
	) : Observable<any> {
		return new Observable<any> (
			( observer : Observer<any> ) => {
				const options = {
					headers : {
						token : this.token
					}
				}

				let request

				if ( !body ) {
					request = this.http.get (
						url,
						options
					)
				} else {
					request = this.http.post (
						url,
						body,
						options
					)
				}

				request.subscribe (
					( response ) => {
						observer.next ( response )
						observer.complete ()
					},
					() => {
						observer.next ( undefined )
						observer.complete ()
					}
				)
			}
		)
	}

	authenticate (
		username : string,
		password : string
	) : Observable<boolean> {
		this.log (
			'authenticate',
			username,
			password
		)

		return new Observable<boolean> (
			observer => {
				this.request (
					this.apiLocation + '/accounts/auth',
					{
						username : username,
						password : password
					}
				).subscribe (
					( response : string ) => {
						if ( response !== null ) {
							this.username = username
							this.password = password
							this.token = response

							this.saveAccount ()

							observer.next ( true )
							observer.complete ()
						} else {
							observer.next ( false )
							observer.complete ()
						}
					}
				)
			}
		)
	}

	getTokenValidity () : Observable<boolean> {
		this.log (
			'getTokenValidity'
		)

		if ( this.token ) {
			return new Observable<boolean> (
				observer => {
					this.request (
						this.apiLocation + '/accounts/check'
					).subscribe (
						( response : string ) => {
							if ( response !== null ) {
								observer.next ( true )
								observer.complete ()
							} else {
								this.username = null
								this.password = null
								this.token = null

								this.saveAccount ()

								observer.next ( false )
								observer.complete ()
							}
						}
					)
				}
			)
		} else {
			return of ( false )
		}
	}

	register (
		username : string,
		password : string
	) : Observable<boolean> {
		this.log (
			'register',
			username,
			password
		)

		return new Observable<boolean> (
			observer => {
				this.request (
					this.apiLocation + '/accounts/new',
					{
						username : username,
						password : password
					}
				).subscribe (
					( response : string | boolean ) => {
						if ( typeof response === 'string' ) {
							this.username = username
							this.password = password
							this.token = response

							this.saveAccount ()

							observer.next ( true )
							observer.complete ()
						} else {
							observer.next ( response )
							observer.complete ()
						}
					}
				)
			} )
	}

	logout () : Observable<boolean> {
		this.log (
			'logout'
		)

		return new Observable<boolean> (
			observer => {
				this.request (
					this.apiLocation + '/accounts/logout',
					{}
				).subscribe (
					( response : boolean ) => {
						if ( response ) {
							this.username = null
							this.password = null
							this.token = null

							this.saveAccount ()

							observer.next ( true )
							observer.complete ()
						} else {
							observer.next ( false )
							observer.complete ()
						}
					}
				)
			}
		)
	}

	getProjectList () : Observable<ClientProject[]> {
		this.log (
			'getProjectList'
		)

		return new Observable<ClientProject[]> (
			observer => {
				this.request (
					this.apiLocation + '/projects'
				).subscribe (
					( response : ClientProject[] ) => {
						if ( response ) {
							observer.next ( response )
							observer.complete ()
						} else {
							observer.next ( null )
							observer.complete ()
						}
					}
				)
			}
		)
	}

	newProject (
		name : string,
		type : number
	) : Observable<boolean> {
		this.log (
			'newProject',
			name
		)

		return new Observable<boolean> (
			observer => {
				this.request (
					this.apiLocation + '/projects/new',
					{
						name : name,
						type : type
					}
				).subscribe (
					( response : boolean ) => {
						observer.next ( response )
						observer.complete ()
					}
				)
			}
		)
	}

	deleteProject ( id : number ) : Observable<boolean> {
		this.log (
			'deleteProject',
			id
		)

		return new Observable<boolean> (
			observer => {
				this.request (
					this.apiLocation + '/projects/delete/' + id,
					{
						name : name
					}
				).subscribe (
					( response : boolean ) => {
						observer.next ( response )
						observer.complete ()
					}
				)
			}
		)
	}

	moveProjectUp ( id : number ) : Observable<boolean> {
		this.log (
			'moveProjectUp',
			id
		)

		return new Observable<boolean> (
			observer => {
				this.request (
					this.apiLocation + '/projects/move/' + id,
					{
						delta : -1
					}
				).subscribe (
					( response : boolean ) => {
						observer.next ( response )
						observer.complete ()
					}
				)
			}
		)
	}

	moveProjectDown ( id : number ) : Observable<boolean> {
		this.log (
			'moveProjectDown',
			id
		)

		return new Observable<boolean> (
			observer => {
				this.request (
					this.apiLocation + '/projects/move/' + id,
					{
						delta : 1
					}
				).subscribe (
					( response : boolean ) => {
						observer.next ( response )
						observer.complete ()
					}
				)
			}
		)
	}

	renameProject (
		id : number,
		name : string
	) : Observable<boolean> {
		this.log (
			'renameProject',
			id,
			name
		)

		return new Observable<boolean> (
			observer => {
				this.request (
					this.apiLocation + '/projects/rename/' + id,
					{
						name : name
					}
				).subscribe (
					( response : boolean ) => {
						observer.next ( response )
						observer.complete ()
					}
				)
			}
		)
	}

	getProject ( id : number ) : Observable<ClientProject> {
		this.log (
			'getProject',
			id
		)

		return new Observable<ClientProject> (
			observer => {
				this.request (
					this.apiLocation + '/projects/' + id
				).subscribe (
					( response : ClientProject ) => {
						if ( response ) {
							this.decrypt ( response.code ).subscribe (
								( decrypted : string ) => {
									if ( decrypted ) {
										response.code = decrypted

										observer.next ( response )
									} else {
										observer.next ( null )
									}

									observer.complete ()
								}
							)
						} else {
							observer.next ( null )
							observer.complete ()
						}
					}
				)
			}
		)
	}

	setProjectCode (
		id : number,
		code : string,
		encrypt : boolean
	) : Observable<boolean> {
		this.log (
			'setProjectCode',
			id,
			code
		)

		return new Observable<boolean> (
			observer => {
				( encrypt ? this.encrypt ( code ) : of ( DECRYPTION_CONFIRMATION_HEADER + code ) ).subscribe (
					( newCode : string ) => {
						this.request (
							this.apiLocation + '/projects/' + id,
							{
								code : newCode
							}
						).subscribe (
							( response : boolean ) => {
								observer.next ( response )
								observer.complete ()
							}
						)
					}
				)
			}
		)
	}

	getEditorOptions () : Observable<IEditorConstructionOptions> {
		this.log ( 'getEditorOptions' )

		return new Observable<IEditorConstructionOptions> (
			observer => {
				this.request (
					this.apiLocation + '/editorOptions'
				).subscribe (
					( response : IEditorConstructionOptions ) => {
						observer.next ( response )
						observer.complete ()
					}
				)
			}
		)
	}

	setEditorOptions ( options : IEditorConstructionOptions ) : Observable<boolean> {
		this.log (
			'setEditorOptions',
			options
		)

		return new Observable<boolean> (
			observer => {
				this.request (
					this.apiLocation + '/editorOptions',
					{
						options : options
					}
				).subscribe (
					( response : boolean ) => {
						observer.next ( response )
						observer.complete ()
					}
				)
			}
		)
	}

	submitBugReport ( data ) : Observable<boolean> {
		return new Observable<boolean> (
			observer => {
				this.request (
					this.apiLocation + '/bugReport',
					<{
						username : string,
						title : string,
						summary : string,
						steps : string
					}> data
				).subscribe (
					( response : boolean ) => {
						observer.next ( response )
						observer.complete ()
					}
				)
			}
		)
	}

	deleteAccount (
		password : string
	) : Observable<boolean> {
		this.log (
			'deleteAccount',
			password
		)

		return new Observable<boolean> (
			observer => {
				this.request (
					this.apiLocation + '/accounts/delete',
					{
						password : password
					}
				).subscribe (
					( response : boolean ) => {
						observer.next ( response )
						observer.complete ()
					}
				)
			}
		)
	}

	unpublishProject (
		id : number
	) : Observable<boolean> {
		this.log (
			'unpublishProject',
			id
		)

		return new Observable<boolean> ( ( observer ) => {
			this.request (
				this.apiLocation + '/projects/' + id + '/unpublish',
				{}
			).subscribe (
				( response : boolean ) => {
					observer.next ( response )
					observer.complete ()
				},
				() => {
					observer.next ( false )
					observer.complete ()
				}
			)
		} )
	}

	publishProject (
		id : number
	) : Observable<string> {
		this.log (
			'publishProject',
			id
		)

		return new Observable<string> ( ( observer ) => {
			this.request (
				this.apiLocation + '/projects/' + id + '/publish',
				{}
			).subscribe (
				( response : string ) => {
					observer.next ( response )
					observer.complete ()
				},
				() => {
					observer.next ( null )
					observer.complete ()
				}
			)
		} )
	}

	resetEditorOptions () : Observable<boolean> {
		this.log (
			'resetEditorOptions'
		)

		return new Observable<boolean> (
			observer => {
				this.request (
					this.apiLocation + '/editorOptions/reset',
					{}
				).subscribe (
					( response : boolean ) => {
						observer.next ( response )
						observer.complete ()
					}
				)
			}
		)
	}

	changePassword (
		username : string,
		oldPassword : string,
		newPassword : string
	) : Observable<boolean> {
		return new Observable (
			observer => {
				this.log (
					'changePassword',
					username,
					oldPassword,
					newPassword
				)

				this.request (
					this.apiLocation + '/accounts/changePassword',
					{
						oldPassword : oldPassword,
						password    : newPassword
					}
				).subscribe (
					( success : boolean ) => {
						if ( success ) {
							this.password = newPassword
						}

						observer.next ( success )
						observer.complete ()
					}
				)
			} )
	}

	changeUsername (
		username : string,
		password : string,
		newUsername : string
	) : Observable<boolean> {
		return new Observable (
			observer => {
				this.log (
					'changeUsername',
					username,
					password,
					newUsername
				)

				this.request (
					this.apiLocation + '/accounts/changeUsername',
					{
						password : password,
						username : newUsername
					}
				).subscribe (
					( success : boolean ) => {
						if ( success ) {
							this.username = newUsername
						}

						observer.next ( success )
						observer.complete ()
					}
				)
			} )
	}

	getAdminStatus () : Observable<boolean> {
		return new Observable<boolean> (
			( observer : Observer<boolean> ) => {
				this.log (
					'getAdminStatus'
				)

				this.request (
					this.apiLocation + '/isAdmin'
				).subscribe (
					( admin : boolean ) => {
						observer.next ( admin )
						observer.complete ()
					}
				)
			}
		)
	}

	getUsers () : Observable<MinimalAccount[]> {
		return new Observable<MinimalAccount[]> (
			( observer : Observer<MinimalAccount[]> ) => {
				this.log (
					'getUsers'
				)

				this.request (
					this.apiLocation + '/accounts'
				).subscribe (
					( response : MinimalAccount[] ) => {
						observer.next ( response )
						observer.complete ()
					}
				)
			}
		)
	}

	getAccount (
		username : string
	) : Observable<Account> {
		return new Observable<Account> (
			(
				observer : Observer<Account>
			) => {
				this.log (
					'getAccount',
					username
				)

				this.request (
					this.apiLocation + '/accounts/admin/' + encodeURIComponent ( username )
				).subscribe (
					( response : Account ) => {
						observer.next ( response )
						observer.complete ()
					}
				)
			}
		)
	}

	changeAccount (
		username : string,
		account : Account
	) : Observable<boolean> {
		return new Observable<boolean> (
			(
				observer : Observer<boolean>
			) => {
				this.log (
					'changeAccount',
					username,
					account
				)

				this.request (
					this.apiLocation + '/accounts/admin/' + encodeURIComponent ( username ),
					account
				).subscribe (
					( response : boolean ) => {
						observer.next ( response )
						observer.complete ()
					}
				)
			}
		)
	}

	checkPassword (
		password : string
	) : Observable<boolean> {
		return new Observable<boolean> (
			( observer : Observer<boolean> ) => {
				this.log (
					'checkPassword',
					password
				)

				this.request (
					this.apiLocation + '/accounts/checkPassword',
					{
						password : password
					}
				).subscribe (
					( response : boolean ) => {
						observer.next ( response )
						observer.complete ()
					}
				)
			}
		)
	}

	encrypt (
		code : string
	) : Observable<string> {
		return new Observable<string> (
			( observer : Observer<string> ) => {
				this.log (
					'encrypt',
					code
				)

				observer.next (
					CryptoJS.AES.encrypt (
						DECRYPTION_CONFIRMATION_HEADER + code,
						this.password
					).toString ()
				)
				observer.complete ()
			}
		)
	}

	_getDecrypted ( code : string ) {
		this.log (
			'_getDecrypted',
			code
		)

		if ( code.startsWith ( DECRYPTION_CONFIRMATION_HEADER ) ) {
			return code.substr ( DECRYPTION_CONFIRMATION_HEADER.length )
		} else if ( code.toLowerCase ().startsWith ( '<!doctype html>' ) ) {
			return code
		} else {
			return
		}
	}

	_decrypt (
		encrypted : string,
		password? : string
	) : string {
		this.log (
			'_decrypt',
			encrypted,
			password
		)

		const decrypted = this._getDecrypted ( encrypted )

		if ( decrypted ) {
			return decrypted
		}

		try {
			return CryptoJS.AES.decrypt (
				encrypted, password || this.password
			).toString (
				CryptoJS.enc.Utf8
			)
		} catch ( e ) {
			return ''
		}
	}

	decrypt (
		encrypted : string
	) : Observable<string> {
		return new Observable<string> (
			( observer : Observer<string> ) => {
				this.log (
					'decrypt',
					encrypted
				)

				const alreadyDecrypted = this._getDecrypted ( encrypted )

				if ( alreadyDecrypted ) {
					observer.next ( alreadyDecrypted )
					observer.complete ()

					return
				}

				const decrypted = this._getDecrypted ( this._decrypt ( encrypted ) )

				if ( decrypted ) {
					observer.next ( decrypted )
					observer.complete ()
				} else {
					this.decryptionDialog ( encrypted ).subscribe (
						( decryptedAgain ) => {
							observer.next ( decryptedAgain )
							observer.complete ()
						}
					)
				}
			}
		)
	}

	decryptionDialog (
		encrypted : string
	) : Observable<string> {
		return new Observable<string> (
			( observer : Observer<string> ) => {
				this.log (
					'decryptionDialog',
					encrypted
				)

				this.dialog.open (
					ApiDecryptionDialogComponent,
					{
						width : '300px',
						data  : [
							encrypted,
							this._decrypt.bind ( this ),
							this._getDecrypted.bind ( this )
						]
					}
				).afterClosed ().subscribe (
					( decrypted : string ) => {
						if ( decrypted ) {
							observer.next ( decrypted )
							observer.complete ()
						} else {
							observer.next ( null )
							observer.complete ()
						}
					}
				)
			}
		)
	}

	getBugReports () : Observable<BugReport[]> {
		return new Observable<BugReport[]> (
			( observer : Observer<BugReport[]> ) => {
				this.log (
					'getBugReports'
				)

				this.request (
					this.apiLocation + '/bugReports'
				).subscribe (
					( response : BugReport[] ) => {
						observer.next ( response )
						observer.complete ()
					}
				)
			}
		)
	}

	setBugReport (
		id : number,
		bugReport : BugReport
	) : Observable<boolean> {
		return new Observable<boolean> (
			( observer : Observer<boolean> ) => {
				this.log (
					'setBugReport',
					id,
					bugReport
				)

				this.request (
					this.apiLocation + '/bugReports/' + id,
					bugReport
				).subscribe (
					( response : boolean ) => {
						observer.next ( response )
						observer.complete ()
					}
				)
			}
		)
	}

	deleteOtherAccount (
		username : string
	) : Observable<boolean> {
		return new Observable<boolean> (
			( observer : Observer<boolean> ) => {
				this.log (
					'deleteOtherAccount',
					username
				)

				this.request (
					this.apiLocation + '/accounts/delete/' + encodeURIComponent ( username ),
					{}
				).subscribe (
					( response : boolean ) => {
						observer.next ( response )
						observer.complete ()
					}
				)
			}
		)
	}

	import (
		url : string
	) : Observable<boolean> {
		return new Observable<boolean> (
			( observer : Observer<boolean> ) => {
				this.request (
					this.apiLocation + '/projects/import',
					{
						url : url
					}
				).subscribe (
					( response : boolean ) => {
						observer.next ( response )
						observer.complete ()
					}
				)
			}
		)
	}

	getStarterCode (
		type : number
	) : Observable<string> {
		return new Observable<string> (
			( observer : Observer<string> ) => {
				this.request (
					this.apiLocation + '/starterCode/' + type
				).subscribe (
					( response : string ) => {
						observer.next ( response )
						observer.complete ()
					}
				)
			}
		)
	}

	setStarterCode (
		type : number,
		code : string
	) : Observable<string> {
		return new Observable<string> (
			( observer : Observer<string> ) => {
				this.request (
					this.apiLocation + '/starterCode/' + type,
					{
						code : code
					}
				).subscribe (
					( response : string ) => {
						observer.next ( response )
						observer.complete ()
					}
				)
			}
		)
	}
}

@Component ( {
	selector    : 'app-api-provide-password-dialog',
	templateUrl : './dialogs/api-provide-password-dialog.component.html'
} )
export class ApiProvidePasswordDialogComponent {
	showPassword = false
	password = ''

	constructor (
		public dialogRef : MatDialogRef<ApiProvidePasswordDialogComponent>,
		@Inject ( MAT_DIALOG_DATA )
		public username : string
	) {}
}

@Component ( {
	selector    : 'app-api-decryption-dialog',
	templateUrl : './dialogs/api-decryption-dialog.component.html'
} )
export class ApiDecryptionDialogComponent {
	showPassword = false
	password = ''
	encrypted : string
	decrypt : (
		encrypted : string,
		password : string
	) => string
	decrypted = ''
	getDecrypted = Function

	constructor (
		public dialogRef : MatDialogRef<ApiDecryptionDialogComponent>,
		@Inject ( MAT_DIALOG_DATA )
			data : [ string, any ]
	) {
		this.encrypted = data[ 0 ]
		this.decrypt = data[ 1 ]
		this.getDecrypted = data[ 2 ]
	}
}
