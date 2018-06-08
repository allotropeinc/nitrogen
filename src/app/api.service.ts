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
				this.http.post (
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
					},
					() => {
						observer.next ( false )
						observer.complete ()
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
					this.http.get (
						this.apiLocation + '/accounts/check',
						{
							headers : {
								token : this.token
							}
						}
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
						},
						() => {
							this.username = null
							this.token = null

							observer.next ( false )
							observer.complete ()
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
				this.http.post (
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
					},
					() => {
						observer.next ( false )
						observer.complete ()
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
				this.http.post (
					this.apiLocation + '/accounts/logout',
					{},
					{
						headers : {
							token : this.token
						}
					}
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
					},
					() => {
						observer.next ( false )
						observer.complete ()
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
				this.http.get (
					this.apiLocation + '/projects',
					{
						headers : {
							token : this.token
						}
					}
				).subscribe (
					( response : ClientProject[] ) => {
						if ( response ) {
							observer.next ( response )
							observer.complete ()
						} else {
							observer.next ( null )
							observer.complete ()
						}
					},
					() => {
						observer.next ( null )
						observer.complete ()
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
				this.http.post (
					this.apiLocation + '/projects/new',
					{
						name : name,
						type : type
					},
					{
						headers : {
							token : this.token
						}
					}
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
				this.http.post (
					this.apiLocation + '/projects/delete/' + id,
					{
						name : name
					},
					{
						headers : {
							token : this.token
						}
					}
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
				this.http.post (
					this.apiLocation + '/projects/move/' + id,
					{
						delta : -1
					},
					{
						headers : {
							token : this.token
						}
					}
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
				this.http.post (
					this.apiLocation + '/projects/move/' + id,
					{
						delta : 1
					},
					{
						headers : {
							token : this.token
						}
					}
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
				this.http.post (
					this.apiLocation + '/projects/rename/' + id,
					{
						name : name
					},
					{
						headers : {
							token : this.token
						}
					}
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
				this.http.get (
					this.apiLocation + '/projects/' + id,
					{
						headers : {
							token : this.token
						}
					}
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
					},
					() => {
						observer.next ( null )
						observer.complete ()
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
						this.http.post (
							this.apiLocation + '/projects/' + id,
							{
								code : newCode
							},
							{
								headers : {
									token : this.token
								}
							}
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
					}
				)
			}
		)
	}

	getEditorOptions () : Observable<IEditorConstructionOptions> {
		this.log ( 'getEditorOptions' )

		return new Observable<IEditorConstructionOptions> (
			observer => {
				this.http.get (
					this.apiLocation + '/editorOptions',
					{
						headers : {
							token : this.token
						}
					}
				).subscribe (
					( response : IEditorConstructionOptions ) => {
						observer.next ( response )
						observer.complete ()
					},
					() => {
						observer.next ( null )
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
				this.http.post (
					this.apiLocation + '/editorOptions',
					{
						options : options
					},
					{
						headers : {
							token : this.token
						}
					}
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
			}
		)
	}

	submitBugReport ( data ) : Observable<boolean> {
		return new Observable<boolean> (
			observer => {
				this.http.post (
					this.apiLocation + '/bugReport',
					<{
						username : string,
						title : string,
						summary : string,
						steps : string
					}> data,
					{
						headers : {
							token : this.token
						}
					}
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
				this.http.post (
					this.apiLocation + '/accounts/delete',
					{
						password : password
					},
					{
						headers : {
							token : this.token
						}
					}
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
			this.http.post (
				this.apiLocation + '/projects/' + id + '/unpublish',
				{},
				{
					headers : {
						token : this.token
					}
				}
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
			this.http.post (
				this.apiLocation + '/projects/' + id + '/publish',
				{},
				{
					headers : {
						token : this.token
					}
				}
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
				this.http.post (
					this.apiLocation + '/editorOptions/reset',
					{},
					{
						headers : {
							token : this.token
						}
					}
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

				this.http.post (
					this.apiLocation + '/accounts/changePassword',
					{
						oldPassword : oldPassword,
						password    : newPassword
					},
					{
						headers : {
							token : this.token
						}
					}
				).subscribe (
					( success : boolean ) => {
						if ( success ) {
							this.password = newPassword
						}

						observer.next ( success )
						observer.complete ()
					},
					() => {
						observer.next ( false )
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

				this.http.post (
					this.apiLocation + '/accounts/changeUsername',
					{
						password : password,
						username : newUsername
					},
					{
						headers : {
							token : this.token
						}
					}
				).subscribe (
					( success : boolean ) => {
						if ( success ) {
							this.username = newUsername
						}

						observer.next ( success )
						observer.complete ()
					},
					() => {
						observer.next ( false )
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

				this.http.get (
					this.apiLocation + '/isAdmin',
					{
						headers : {
							token : this.token
						}
					}
				).subscribe (
					( admin : boolean ) => {
						observer.next ( admin )
						observer.complete ()
					},
					() => {
						observer.next ( false )
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

				this.http.get (
					this.apiLocation + '/accounts',
					{
						headers : {
							token : this.token
						}
					}
				).subscribe (
					( response : MinimalAccount[] ) => {
						observer.next ( response )
						observer.complete ()
					},
					() => {
						observer.next ( null )
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

				this.http.get (
					this.apiLocation + '/accounts/admin/' + encodeURIComponent ( username ),
					{
						headers : {
							token : this.token
						}
					}
				).subscribe (
					( response : Account ) => {
						observer.next ( response )
						observer.complete ()
					},
					() => {
						observer.next ( null )
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

				this.http.post (
					this.apiLocation + '/accounts/admin/' + encodeURIComponent ( username ),
					account,
					{
						headers : {
							token : this.token
						}
					}
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

				this.http.post (
					this.apiLocation + '/accounts/checkPassword',
					{
						password : password
					},
					{
						headers : {
							token : this.token
						}
					}
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

				this.http.get (
					this.apiLocation + '/bugReports',
					{
						headers : {
							token : this.token
						}
					}
				).subscribe (
					( response : BugReport[] ) => {
						observer.next ( response )
						observer.complete ()
					},
					() => {
						observer.next ( null )
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

				this.http.post (
					this.apiLocation + '/bugReports/' + id,
					bugReport,
					{
						headers : {
							token : this.token
						}
					}
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

				this.http.post (
					this.apiLocation + '/accounts/delete/' + encodeURIComponent ( username ),
					{},
					{
						headers : {
							token : this.token
						}
					}
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
			}
		)
	}

	import (
		url : string
	) : Observable<boolean> {
		return new Observable<boolean> (
			( observer : Observer<boolean> ) => {
				this.http.post (
					this.apiLocation + '/projects/import',
					{
						url : url
					},
					{
						headers : {
							token : this.token
						}
					}
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
			}
		)
	}

	getStarterCode (
		type : number
	) : Observable<string> {
		return new Observable<string> (
			( observer : Observer<string> ) => {
				this.http.get (
					this.apiLocation + '/starterCode/' + type,
					{
						headers : {
							token : this.token
						}
					}
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
			}
		)
	}

	setStarterCode (
		type : number,
		code : string
	) : Observable<string> {
		return new Observable<string> (
			( observer : Observer<string> ) => {
				this.http.post (
					this.apiLocation + '/starterCode/' + type,
					{
						code : code
					},
					{
						headers : {
							token : this.token
						}
					}
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
