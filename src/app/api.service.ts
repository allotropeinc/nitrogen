import {HttpClient}                     from '@angular/common/http'
import {
	Component,
	Inject,
	Injectable,
	isDevMode
}                                       from '@angular/core'
import {FormControl}                    from '@angular/forms'
import {
	MAT_DIALOG_DATA,
	MatDialog,
	MatDialogRef
}                                       from '@angular/material/dialog'
import {MatSnackBar}                    from '@angular/material/snack-bar'
import {Observable, Observer, of}       from 'rxjs'
import {URL}                            from 'url-parse'
import {Bodies}                         from '../../backend/src/types/bodies'
import {
	Account,
	AccountSettings,
	BugReport,
	EmailStatus,
	Project
}                                       from '../../backend/src/types/database'
import {
	MinimalAccount,
	ProjectData
}                                       from '../../backend/src/types/datatypes'
import {DECRYPTION_CONFIRMATION_HEADER} from '../../backend/src/types/shared-vars'

declare const CryptoJS: any

@Injectable()
export class ApiService {
	public apiLocation = '/api'
	public username: string = null
	protected password: string = null
	public token: string = null
	public ready = false

	constructor(
		private http: HttpClient,
		private dialog: MatDialog,
		private snackbar: MatSnackBar
	) {
		if (localStorage.hasOwnProperty('account')) {
			const details = JSON.parse(localStorage['account'])

			this.username = details.username
			this.token = details.token

			this.getTokenValidity().subscribe(
				success => {
					if (success) {
						this.askForPassword()
					} else {
						this.username = null
						this.token = null

						this.saveAccount()

						this.ready = true
					}
				}
			)
		} else {
			this.ready = true
		}
	}

	protected askForPassword() {
		this.log(
			'askForPassword'
		)

		this.dialog.open(
			ApiProvidePasswordDialogComponent,
			{
				data: this.username
			}
		).afterClosed().subscribe(
			(data: string) => {
				if (data === undefined) {
					this.username = null
					this.token = null

					this.saveAccount()

					this.ready = true
				} else {
					this.checkPassword(data).subscribe(
						(valid: boolean) => {
							if (valid) {
								this.password = data

								this.ready = true
							} else {
								this.snackbar.open('Invalid password.')

								this.askForPassword()
							}
						}
					)
				}
			}
		)
	}

	protected saveAccount(): void {
		this.log(
			'saveAccount'
		)

		if (this.token) {
			localStorage['account'] = JSON.stringify({
				username: this.username,
				token   : this.token
			})
		} else {
			delete localStorage['account']
		}
	}

	protected log(...args: any[]) {
		if (isDevMode()) {
			console.log(...args)
		}
	}

	protected request(
		url: string,
		body?: Object
	): Observable<any> {
		return new Observable<any>(
			(observer: Observer<any>) => {
				const options = {
					headers: {
						token: this.token || ''
					}
				}

				let request: Observable<Object>

				if (!body) {
					request = this.http.get(
						url,
						options
					)
				} else {
					request = this.http.post(
						url,
						body,
						options
					)
				}

				request.subscribe(
					(response) => {
						observer.next(response)
						observer.complete()
					},
					(err) => {
						console.error(
							'HTTP error: %s',
							err
						)

						observer.next(undefined)
						observer.complete()
					}
				)
			}
		)
	}

	authenticate(
		username: string,
		password: string
	): Observable<boolean> {
		this.log(
			'authenticate',
			username,
			password
		)

		return new Observable<boolean>(
			observer => {
				this.request(
					this.apiLocation + '/accounts/auth',
					<Bodies.Accounts.Auth> {
						username: username,
						password: password
					}
				).subscribe(
					(response: string) => {
						if (response) {
							this.username = username
							this.password = password
							this.token = response

							this.saveAccount()

							observer.next(true)
							observer.complete()
						} else {
							observer.next(false)
							observer.complete()
						}
					}
				)
			}
		)
	}

	getTokenValidity(): Observable<boolean> {
		this.log(
			'getTokenValidity'
		)

		if (this.token) {
			return new Observable<boolean>(
				observer => {
					this.request(
						this.apiLocation + '/accounts/check'
					).subscribe(
						(response: boolean) => {
							if (response) {
								observer.next(true)
								observer.complete()
							} else {
								this.username = null
								this.password = null
								this.token = null

								this.saveAccount()

								observer.next(false)
								observer.complete()
							}
						}
					)
				}
			)
		} else {
			return of(false)
		}
	}

	register(
		username: string,
		password: string
	): Observable<boolean> {
		this.log(
			'register',
			username,
			password
		)

		return new Observable<boolean>(
			observer => {
				this.request(
					this.apiLocation + '/accounts/new',
					<Bodies.Accounts.New> {
						username: username,
						password: password
					}
				).subscribe(
					(response: string | boolean) => {
						if (typeof response === 'string') {
							this.username = username
							this.password = password
							this.token = response

							this.saveAccount()

							observer.next(true)
							observer.complete()
						} else {
							observer.next(response)
							observer.complete()
						}
					}
				)
			})
	}

	logout(): Observable<boolean> {
		this.log(
			'logout'
		)

		return new Observable<boolean>(
			observer => {
				this.request(
					this.apiLocation + '/accounts/logout',
					{}
				).subscribe(
					(response: boolean) => {
						if (response) {
							this.username = null
							this.password = null
							this.token = null

							this.saveAccount()

							observer.next(true)
							observer.complete()
						} else {
							observer.next(false)
							observer.complete()
						}
					}
				)
			}
		)
	}

	getProjectList(): Observable<Project[]> {
		this.log(
			'getProjectList'
		)

		return new Observable<Project[]>(
			observer => {
				this.request(
					this.apiLocation + '/projects'
				).subscribe(
					(response: Project[]) => {
						if (response) {
							observer.next(response)
							observer.complete()
						} else {
							observer.next(null)
							observer.complete()
						}
					}
				)
			}
		)
	}

	newProject(
		name: string,
		type: number
	): Observable<boolean> {
		this.log(
			'newProject',
			name
		)

		return new Observable<boolean>(
			observer => {
				this.request(
					this.apiLocation + '/projects/new',
					<Bodies.Projects.New> {
						name: name,
						type: type
					}
				).subscribe(
					(response: boolean) => {
						observer.next(response)
						observer.complete()
					}
				)
			}
		)
	}

	deleteProject(id: string): Observable<boolean> {
		this.log(
			'deleteProject',
			id
		)

		return new Observable<boolean>(
			observer => {
				this.request(
					this.apiLocation + '/projects/delete/' + id,
					{}
				).subscribe(
					(response: boolean) => {
						observer.next(response)
						observer.complete()
					}
				)
			}
		)
	}

	moveProject(id: string, newPos: number): Observable<boolean> {
		this.log(
			'moveProject',
			id,
			newPos
		)

		return new Observable<boolean>(
			observer => {
				this.request(
					this.apiLocation + '/projects/move/' + id,
					<Bodies.Projects.Move> {
						newPos: newPos
					}
				).subscribe(
					(response: boolean) => {
						observer.next(response)
						observer.complete()
					}
				)
			}
		)
	}

	renameProject(
		id: string,
		name: string
	): Observable<boolean> {
		this.log(
			'renameProject',
			id,
			name
		)

		return new Observable<boolean>(
			observer => {
				this.request(
					this.apiLocation + '/projects/rename/' + id,
					<Bodies.Projects.Rename> {
						name: name
					}
				).subscribe(
					(response: boolean) => {
						observer.next(response)
						observer.complete()
					}
				)
			}
		)
	}

	getProject(id: string): Observable<Project> {
		this.log(
			'getProject',
			id
		)

		return new Observable<Project>(
			observer => {
				this.request(
					this.apiLocation + '/projects/' + id
				).subscribe(
					(response: Project) => {
						if (response) {
							this.decrypt(response.code).subscribe(
								(decrypted: string) => {
									if (decrypted) {
										response.code = decrypted

										observer.next(response)
									} else {
										observer.next(null)
									}

									observer.complete()
								}
							)
						} else {
							observer.next(null)
							observer.complete()
						}
					}
				)
			}
		)
	}

	setProjectCode(
		id: string,
		code: string,
		encrypt: boolean
	): Observable<boolean> {
		this.log(
			'setProjectCode',
			id,
			code
		)

		return new Observable<boolean>(
			observer => {
				(encrypt
				 ? this.encrypt(code)
				 : of(DECRYPTION_CONFIRMATION_HEADER + code)).subscribe(
					(newCode: string) => {
						this.request(
							this.apiLocation + '/projects/' + id,
							<Bodies.Projects.UpdateCode> {
								code: newCode
							}
						).subscribe(
							(response: boolean) => {
								observer.next(response)
								observer.complete()
							}
						)
					}
				)
			}
		)
	}

	getSettings(): Observable<AccountSettings> {
		this.log('getSettings')

		return new Observable<AccountSettings>(
			observer => {
				this.request(
					this.apiLocation + '/accounts/settings'
				).subscribe(
					(response: AccountSettings) => {
						observer.next(response)
						observer.complete()
					}
				)
			}
		)
	}

	setSettings(settings: AccountSettings): Observable<boolean> {
		this.log(
			'setSettings',
			settings
		)

		return new Observable<boolean>(
			observer => {
				this.request(
					this.apiLocation + '/accounts/settings',
					<Bodies.Accounts.Settings> {
						settings: settings
					}
				).subscribe(
					(response: boolean) => {
						observer.next(response)
						observer.complete()
					}
				)
			}
		)
	}

	submitBugReport(data: Bodies.BugReport): Observable<boolean> {
		this.log(
			'submitBugReport',
			data
		)

		return new Observable<boolean>(
			observer => {
				this.request(
					this.apiLocation + '/bugReport',
					data
				).subscribe(
					(response: boolean) => {
						observer.next(response)
						observer.complete()
					}
				)
			}
		)
	}

	deleteAccount(
		password: string
	): Observable<boolean> {
		this.log(
			'deleteAccount',
			password
		)

		return new Observable<boolean>(
			observer => {
				this.request(
					this.apiLocation + '/accounts/delete',
					<Bodies.Accounts.Delete> {
						password: password
					}
				).subscribe(
					(response: boolean) => {
						observer.next(response)
						observer.complete()
					}
				)
			}
		)
	}

	unpublishProject(
		id: string
	): Observable<boolean> {
		this.log(
			'unpublishProject',
			id
		)

		return new Observable<boolean>((observer) => {
			this.request(
				this.apiLocation + '/projects/' + id + '/unpublish',
				{}
			).subscribe(
				(response: boolean) => {
					observer.next(response)
					observer.complete()
				},
				() => {
					observer.next(false)
					observer.complete()
				}
			)
		})
	}

	publishProject(
		id: string
	): Observable<string> {
		this.log(
			'publishProject',
			id
		)

		return new Observable<string>((observer) => {
			this.request(
				this.apiLocation + '/projects/' + id + '/publish',
				{}
			).subscribe(
				(response: string) => {
					observer.next(response)
					observer.complete()
				},
				() => {
					observer.next(null)
					observer.complete()
				}
			)
		})
	}

	resetSettings(): Observable<boolean> {
		this.log(
			'resetSettings'
		)

		return new Observable<boolean>(
			observer => {
				this.request(
					this.apiLocation + '/accounts/settings/reset',
					{}
				).subscribe(
					(response: boolean) => {
						observer.next(response)
						observer.complete()
					}
				)
			}
		)
	}

	changePassword(
		username: string,
		oldPassword: string,
		newPassword: string
	): Observable<boolean> {
		this.log(
			'changePassword',
			username,
			oldPassword,
			newPassword
		)

		return new Observable(
			observer => {
				this.request(
					this.apiLocation + '/accounts/changePassword',
					<Bodies.Accounts.ChangePassword> {
						oldPassword: oldPassword,
						password   : newPassword
					}
				).subscribe(
					(success: boolean) => {
						if (success) {
							this.password = newPassword
						}

						observer.next(success)
						observer.complete()
					}
				)
			})
	}

	changeUsername(
		username: string,
		password: string,
		newUsername: string
	): Observable<boolean> {
		this.log(
			'changeUsername',
			username,
			password,
			newUsername
		)

		return new Observable(
			observer => {
				this.request(
					this.apiLocation + '/accounts/changeUsername',
					<Bodies.Accounts.ChangeUsername> {
						password: password,
						username: newUsername
					}
				).subscribe(
					(success: boolean) => {
						if (success) {
							this.username = newUsername
						}

						observer.next(success)
						observer.complete()
					}
				)
			})
	}

	getAdminStatus(): Observable<boolean> {
		this.log(
			'getAdminStatus'
		)

		return new Observable<boolean>(
			(observer: Observer<boolean>) => {
				this.request(
					this.apiLocation + '/accounts/isAdmin'
				).subscribe(
					(admin: boolean) => {
						observer.next(admin)
						observer.complete()
					}
				)
			}
		)
	}

	getUsers(): Observable<MinimalAccount[]> {
		this.log(
			'getUsers'
		)

		return new Observable<MinimalAccount[]>(
			(observer: Observer<MinimalAccount[]>) => {
				this.request(
					this.apiLocation + '/accounts'
				).subscribe(
					(response: MinimalAccount[]) => {
						observer.next(response)
						observer.complete()
					}
				)
			}
		)
	}

	getAccount(
		id: string
	): Observable<Account> {
		this.log(
			'getAccount',
			id
		)

		return new Observable<Account>(
			(
				observer: Observer<Account>
			) => {
				this.request(
					this.apiLocation + '/accounts/admin/' +
					encodeURIComponent(id)
				).subscribe(
					(response: Account) => {
						observer.next(response)
						observer.complete()
					}
				)
			}
		)
	}

	checkPassword(
		password: string
	): Observable<boolean> {
		this.log(
			'checkPassword',
			password
		)

		return new Observable<boolean>(
			(observer: Observer<boolean>) => {
				this.request(
					this.apiLocation + '/accounts/checkPassword',
					<Bodies.Accounts.CheckPassword> {
						password: password
					}
				).subscribe(
					(response: boolean) => {
						observer.next(response)
						observer.complete()
					}
				)
			}
		)
	}

	encrypt(
		code: string
	): Observable<string> {
		this.log(
			'encrypt',
			code
		)

		return new Observable<string>(
			(observer: Observer<string>) => {
				observer.next(
					CryptoJS.AES.encrypt(
						DECRYPTION_CONFIRMATION_HEADER + code,
						this.password
					).toString()
				)
				observer.complete()
			}
		)
	}

	_getDecrypted(code: string) {
		this.log(
			'_getDecrypted',
			code
		)

		if (code.startsWith(DECRYPTION_CONFIRMATION_HEADER)) {
			return code.substr(DECRYPTION_CONFIRMATION_HEADER.length)
		} else if (code.toLowerCase().startsWith('<!doctype html>')) {
			return code
		} else {
			return
		}
	}

	_decrypt(
		encrypted: string,
		password?: string
	): string {
		this.log(
			'_decrypt',
			encrypted,
			password
		)

		const decrypted = this._getDecrypted(encrypted)

		if (decrypted) {
			return decrypted
		}

		try {
			return CryptoJS.AES.decrypt(
				encrypted, password || this.password
			).toString(
				CryptoJS.enc.Utf8
			)
		} catch (e) {
			return ''
		}
	}

	decrypt(
		encrypted: string
	): Observable<string> {
		this.log(
			'decrypt',
			encrypted
		)

		return new Observable<string>(
			(observer: Observer<string>) => {
				const alreadyDecrypted = this._getDecrypted(encrypted)

				if (alreadyDecrypted) {
					observer.next(alreadyDecrypted)
					observer.complete()

					return
				}

				const decrypted = this._getDecrypted(
					this._decrypt(encrypted))

				if (decrypted) {
					observer.next(decrypted)
					observer.complete()
				} else {
					this.decryptionDialog(encrypted).subscribe(
						(decryptedAgain) => {
							observer.next(decryptedAgain)
							observer.complete()
						}
					)
				}
			}
		)
	}

	decryptionDialog(
		encrypted: string
	): Observable<string> {
		this.log(
			'decryptionDialog',
			encrypted
		)

		return new Observable<string>(
			(observer: Observer<string>) => {
				this.dialog.open(
					ApiDecryptionDialogComponent,
					{
						data: [
							encrypted,
							this._decrypt.bind(this),
							this._getDecrypted.bind(this)
						]
					}
				).afterClosed().subscribe(
					(decrypted: string) => {
						if (decrypted) {
							observer.next(decrypted)
							observer.complete()
						} else {
							observer.next(null)
							observer.complete()
						}
					}
				)
			}
		)
	}

	getBugReports(): Observable<BugReport[]> {
		this.log(
			'getBugReports'
		)

		return new Observable<BugReport[]>(
			(observer: Observer<BugReport[]>) => {
				this.request(
					this.apiLocation + '/bugReports'
				).subscribe(
					(response: BugReport[]) => {
						observer.next(response)
						observer.complete()
					}
				)
			}
		)
	}

	deleteOtherAccount(
		id: string
	): Observable<boolean> {
		this.log(
			'deleteOtherAccount',
			id
		)

		return new Observable<boolean>(
			(observer: Observer<boolean>) => {
				this.request(
					this.apiLocation + '/accounts/delete/' +
					encodeURIComponent(id),
					{}
				).subscribe(
					(response: boolean) => {
						observer.next(response)
						observer.complete()
					}
				)
			}
		)
	}

	import(
		url: string
	): Observable<boolean> {
		this.log(
			'import',
			url
		)

		return new Observable<boolean>(
			(observer: Observer<boolean>) => {
				this.request(
					this.apiLocation + '/projects/import',
					<Bodies.Projects.Import> {
						url: url
					}
				).subscribe(
					(response: boolean) => {
						observer.next(response)
						observer.complete()
					}
				)
			}
		)
	}

	getStarterCode(
		type: number
	): Observable<string> {
		this.log(
			'getStarterCode',
			type
		)

		return new Observable<string>(
			(observer: Observer<string>) => {
				this.request(
					this.apiLocation + '/starterCode/' + type
				).subscribe(
					(response: string) => {
						observer.next(response)
						observer.complete()
					}
				)
			}
		)
	}

	setStarterCode(
		type: number,
		code: string
	): Observable<string> {
		this.log(
			'setStarterCode',
			type,
			code
		)

		return new Observable<string>(
			(observer: Observer<string>) => {
				this.request(
					this.apiLocation + '/starterCode/' + type,
					<Bodies.StarterCode> {
						code: code
					}
				).subscribe(
					(response: string) => {
						observer.next(response)
						observer.complete()
					}
				)
			}
		)
	}

	setEmail(email: string): Observable<boolean> {
		this.log(
			'setEmail',
			email
		)

		return new Observable<boolean>(
			(observer: Observer<boolean>) => {
				this.request(
					this.apiLocation + '/accounts/email',
					<Bodies.Accounts.Email> {
						email   : email,
						password: this.password
					}
				).subscribe(
					(response: boolean) => {
						observer.next(response)
						observer.complete()
					}
				)
			}
		)
	}

	getEmailStatus(): Observable<EmailStatus> {
		this.log(
			'getEmailStatus'
		)

		return new Observable<EmailStatus>(
			(observer: Observer<EmailStatus>) => {
				this.request(this.apiLocation + '/accounts/email').subscribe(
					(response: EmailStatus) => {
						observer.next(response)
						observer.complete()
					}
				)
			}
		)
	}

	revokeEmailVerification(): Observable<boolean> {
		this.log(
			'revokeEmailVerification'
		)

		return new Observable<boolean>(
			(observer: Observer<boolean>) => {
				this.request(
					this.apiLocation + '/accounts/email/revokeVerification',
					{}
				).subscribe(
					(response: boolean) => {
						observer.next(response)
						observer.complete()
					}
				)
			}
		)
	}

	getProjectsData(): Observable<ProjectData[]> {
		this.log(
			'getProjectsData'
		)

		return new Observable<ProjectData[]>(
			observer => {
				this.request(
					this.apiLocation + '/projectData'
				).subscribe(
					(response: ProjectData[]) => {
						if (response) {
							observer.next(response)
							observer.complete()
						} else {
							observer.next(null)
							observer.complete()
						}
					}
				)
			}
		)
	}
}

@Component({
	selector   : 'app-api-provide-password-dialog',
	templateUrl: './dialogs/api-provide-password-dialog.component.html'
})
export class ApiProvidePasswordDialogComponent {
	password: FormControl

	constructor(
		public dialogRef: MatDialogRef<ApiProvidePasswordDialogComponent>,
		@Inject(MAT_DIALOG_DATA)
		public username: string
	) {}
}

@Component({
	selector   : 'app-api-decryption-dialog',
	templateUrl: './dialogs/api-decryption-dialog.component.html'
})
export class ApiDecryptionDialogComponent {
	password: FormControl
	encrypted: string
	decrypt: (
		encrypted: string,
		password: string
	) => string
	getDecrypted: (code: string) => string
	decrypted = ''

	constructor(
		public dialogRef: MatDialogRef<ApiDecryptionDialogComponent>,
		@Inject(MAT_DIALOG_DATA)
			data: [
			string,
			(encrypted: string, password?: string) => string,
			(code: string) => string
			]
	) {
		this.encrypted = data[0]
		this.decrypt = data[1]
		this.getDecrypted = data[2]
	}
}
