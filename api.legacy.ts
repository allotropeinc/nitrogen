export const Api = {
	validateToken (
		token : string
	) : Promise<boolean> {
		return new Promise ( (
			accept,
			reject
			) => {
				debug (
					'validating token'
				)

				if ( data.activeTokens.hasOwnProperty ( token ) ) {
					debug (
						'token belongs to %o',
						data.activeTokens[ token ]
					)

					accept ( true )
				} else {
					debug ( 'inactive or fake token' )
					reject ( false )
				}
			}
		)
	},
	createAccount (
		username : string,
		password : string
	) : Promise<boolean> {
		return new Promise ( (
			accept,
			reject
			) => {
				debug (
					'creating account %o',
					username
				)

				getAccount ( username ).then (
					() => {
						reject ( false )
					}
				).catch (
					() => {
						if ( usernamePattern.test ( username ) ) {
							data.accounts[ username ] = {
								username      : username,
								password      : currentHashVersion + '!' + hashFunctions[ currentHashVersion ] (
									username,
									password
								),
								projects      : [],
								editorOptions : starterEditorOptions,
								isAdmin       : false
							}

							saveData ().then (
								accept
							).catch (
								reject
							)
						} else {
							debug (
								'username %o is too exotic',
								username
							)

							reject ()
						}
					}
				)
			}
		)
	},
	token (
		username : string
	) : Promise<string> {
		return new Promise<string> ( (
			accept,
			reject
			) => {
				debug (
					'creating token for %o',
					username
				)

				getAccount ( username ).then (
					( account : Account ) => {
						if ( account.activeToken ) {
							debug ( 'token already exists' )
							accept ( account.activeToken )
						} else {
							debug ( 'generating token' )
							const token = uuid.v4 ()

							debug ( 'activating token' )
							account.activeToken = token
							data.activeTokens[ token ] = username

							saveData ().then (
								() => accept ( token )
							).catch (
								() => reject ( null )
							)
						}
					}
				).catch (
					() => reject ( null )
				)
			}
		)
	},
	validateCredentials (
		username : string,
		password : string
	) : Promise<boolean> {
		return new Promise<boolean> (
			(
				accept,
				reject
			) => {
				debug (
					'validating credentials for %o',
					username
				)

				getAccount ( username ).then (
					( account : Account ) => {
						const hashed = account.password.split ( '!' )
						let algorithm = 'v1'

						if ( hashed.length !== 1 ) { // length === 1 means v1, before hashes were versioned
							debug ( 'account is using v1 hash' )

							algorithm = hashed[ 0 ]
						}

						if ( hashFunctions[ algorithm ] (
							username,
							password
						) === hashed[ hashed.length - 1 ] ) {
							debug ( 'credentials are valid' )

							Api.upgradeHash (
								username,
								password
							).then (
								accept
							).catch (
								reject
							)
						} else {
							debug ( 'credentials are invalid' )

							reject ( false )
						}
					}
				).catch (
					() => reject ( false )
				)
			}
		)
	},
	authenticate (
		username : string,
		password : string
	) : Promise<string> {
		return new Promise<string> (
			(
				accept,
				reject
			) => {
				debug (
					'authenticating %o',
					username
				)

				Api.validateCredentials (
					username,
					password
				).then (
					() => {
						getAccount ( username ).then (
							( account : Account ) => {
								let token : string

								if ( account.activeToken ) {
									debug ( 'account has active token' )

									token = account.activeToken
								} else {
									debug ( 'account has no token' )
								}

								if ( token ) {
									accept ( token )
								} else {
									Api.token ( username ).then (
										accept
									).catch (
										reject
									)
								}
							}
						).catch (
							reject
						)
					}
				).catch (
					() => reject ( null )
				)
			}
		)
	},
	logoutAccount (
		username : string
	) : Promise<boolean> {
		return new Promise<boolean> (
			(
				accept,
				reject
			) => {
				debug (
					'logging out %o',
					username
				)

				getAccount ( username ).then (
					( account : Account ) => {
						if ( !account.activeToken ) {
							debug ( 'account has no active token' )

							accept ( true )
						} else {
							debug ( 'deactivating token' )

							delete data.activeTokens[ account.activeToken ]
							delete account.activeToken

							saveData ().then (
								accept
							).catch (
								reject
							)
						}
					}
				).catch (
					reject
				)
			}
		)
	},
	getProjects (
		username : string
	) : Promise<ClientProject[]> {
		return new Promise ( (
			accept,
			reject
			) => {
				debug (
					'getting projects for %o',
					username
				)

				getAccount ( username ).then (
					( account : Account ) => {
						accept ( account.projects.map (
							(
								project : Project,
								index : number
							) => {
								return <ClientProject> {
									... project,
									id : index
								}
							}
						) )
					}
				).catch (
					() => reject ( null )
				)
			}
		)
	},
	getOwner (
		token : string
	) : Promise<string> {
		return new Promise ( (
			accept,
			reject
			) => {
				debug ( 'getting owner of token' )

				Api.validateToken ( token ).then (
					() => {
						accept ( data.activeTokens[ token ] )
					}
				).catch (
					() => reject ( null )
				)
			}
		)
	},
	newProject (
		username : string,
		name : string,
		type : number,
		code? : string
	) : Promise<boolean> {
		return new Promise ( (
			accept,
			reject
			) => {
				debug (
					'creating new project for %o with name %o',
					username,
					name
				)

				getAccount ( username ).then (
					( account : Account ) => {
						account.projects.push ( <Project> {
								name : name,
								type : type,
								code : DECRYPTION_CONFIRMATION_HEADER + ( code || data.starterCodes[ type ] )
							}
						)

						saveData ().then (
							accept
						).catch (
							reject
						)
					}
				).catch (
					reject
				)
			}
		)
	},
	renameProject (
		username : string,
		id : number,
		name : string
	) : Promise<boolean> {
		return new Promise ( (
			accept,
			reject
			) => {
				debug (
					'renaming project with id %d to %o for %o',
					id,
					name,
					username
				)

				getAccount ( username ).then (
					( account : Account ) => {
						if ( id >= 0 && id < account.projects.length && id % 1 === 0 ) {
							account.projects[ id ].name = name

							saveData ().then (
								accept
							).catch (
								reject
							)
						} else {
							debug (
								'invalid project id %d',
								id
							)

							reject ( false )
						}
					}
				).catch (
					reject
				)
			}
		)
	},
	deleteProject (
		username : string,
		id : number
	) : Promise<boolean> {
		return new Promise ( (
			accept,
			reject
			) => {
				debug (
					'deleting project %d for %o',
					id,
					username
				)

				getAccount ( username ).then (
					( account : Account ) => {
						if ( id >= 0 && id < account.projects.length && id % 1 === 0 ) {
							const project = account.projects[ id ]

							if ( project.hasOwnProperty ( 'publishToken' ) ) {
								delete data.publishTokens[ project.publishToken ]
							}

							account.projects.splice (
								id,
								1
							)

							for ( let i = id ; id < account.projects.length ; i++ ) {
								data.publishTokens[ account.projects[ i ].publishToken ].projectIndex--
							}

							saveData ().then (
								accept
							).catch (
								reject
							)
						} else {
							debug (
								'invalid project id %d',
								id
							)

							reject ( false )
						}
					}
				).catch (
					reject
				)
			}
		)
	},
	moveProject (
		username : string,
		id : number,
		delta : number
	) : Promise<boolean> {
		return new Promise ( (
			accept,
			reject
			) => {
				debug (
					'moving project %d to %d for %o',
					id, id + delta,
					username
				)

				getAccount ( username ).then (
					( account : Account ) => {
						if ( id >= 0 && id < account.projects.length && id % 1 === 0 ) {
							if ( id + delta >= 0 && id + delta < account.projects.length && ( id + delta ) % 1 === 0 ) {
								const src = account.projects[ id ]
								const dest = account.projects[ id + delta ]

								account.projects[ id + delta ] = src
								account.projects[ id ] = dest

								if ( src.hasOwnProperty ( 'publishToken' ) ) {
									data.publishTokens[ src.publishToken ].projectIndex += delta
								}

								if ( dest.hasOwnProperty ( 'publishToken' ) ) {
									data.publishTokens[ dest.publishToken ].projectIndex -= delta
								}

								saveData ().then (
									accept
								).catch (
									reject
								)
							} else {
								debug ( 'moving to an invalid project id %d', id + delta )

								reject ( false )
							}
						} else {
							debug (
								'moving from an invalid project id %d',
								id
							)

							reject ( false )
						}
					}
				).catch (
					reject
				)
			}
		)
	},
	getProject (
		username : string,
		id : number
	) : Promise<ClientProject> {
		return new Promise ( (
			accept,
			reject
			) => {
				debug (
					'getting project %d for %o',
					id,
					username
				)

				getAccount ( username ).then (
					( account : Account ) => {
						if ( id >= 0 && id < account.projects.length && id % 1 === 0 ) {
							const project = account.projects[ id ]

							accept ( <ClientProject> {
									id : id,
									... project
								}
							)
						} else {
							debug (
								'invalid project id %d',
								id
							)

							reject ( null )
						}
					}
				).catch (
					() => reject ( null )
				)
			}
		)
	},
	setProjectCode (
		username : string,
		id : number,
		code : string
	) : Promise<boolean> {
		return new Promise ( (
			accept,
			reject
			) => {
				debug (
					'setting project %d code for %o',
					id,
					username
				)

				getAccount ( username ).then (
					( account : Account ) => {
						if ( id >= 0 && id < account.projects.length && id % 1 === 0 ) {
							account.projects[ id ].code = code

							saveData ().then (
								accept
							).catch (
								reject
							)
						} else {
							debug (
								'invalid project id %d',
								id
							)

							reject ( false )
						}
					}
				).catch (
					reject
				)
			}
		)
	},
	getEditorOptions (
		username : string
	) : Promise<IEditorConstructionOptions> {
		return new Promise ( (
			accept,
			reject
			) => {
				debug (
					'getting editor options for %o',
					username
				)

				getAccount ( username ).then (
					( account : Account ) => {
						accept ( account.editorOptions )
					}
				).catch (
					() => reject ( null )
				)
			}
		)
	},
	setEditorOptions (
		username : string,
		options : IEditorConstructionOptions
	) : Promise<boolean> {
		return new Promise ( (
			accept,
			reject
			) => {
				debug (
					'setting editor options for %o',
					username
				)

				getAccount ( username ).then (
					( account : Account ) => {
						account.editorOptions = options

						saveData ().then (
							accept
						).catch (
							reject
						)
					}
				).catch (
					reject
				)
			}
		)
	},
	submitBugReport (
		username : string,
		bugReport : BugReport
	) : Promise<boolean> {
		return new Promise ( (
			accept,
			reject
			) => {
				debug (
					'submitting bug report for %o',
					username
				)

				data.bugReports.push ( bugReport )

				saveData ().then (
					accept
				).catch (
					reject
				)
			}
		)
	},
	deleteAccount (
		username : string
	) : Promise<boolean> {
		return new Promise ( (
			accept,
			reject
			) => {
				debug (
					'deleting account of %o',
					username
				)

				getAccount ( username ).then (
					( account : Account ) => {
						debug ( 'removing account from list' )
						delete data.accounts[ username ]

						debug ( 'wiping active token' )
						if ( account.hasOwnProperty ( 'activeToken' ) ) {
							delete data.activeTokens[ account.activeToken ]
						}

						debug ( 'wiping projects' )
						if ( account.projects.length > 0 ) {
							account.projects.forEach ( ( project : Project ) => {
									if ( project.hasOwnProperty ( 'publishToken' ) ) {
										delete data.publishTokens[ project.publishToken ]
									}
								}
							)
						}

						saveData ().then (
							accept
						).catch (
							reject
						)
					}
				).catch (
					() => reject ( false )
				)
			}
		)
	},
	getPublished (
		publishToken : string
	) : Promise<Project> {
		return new Promise ( (
			accept,
			reject
			) => {
				debug (
					'getting published project for %o',
					publishToken
				)

				if ( data.publishTokens.hasOwnProperty ( publishToken ) ) {
					debug (
						'project at %o exists',
						publishToken
					)

					const token : PublishToken = data.publishTokens[ publishToken ]

					accept ( data.accounts[ token.username ].projects[ token.projectIndex ] )
				} else {
					debug (
						'project at %o does not exist',
						publishToken
					)

					reject ( null )
				}
			}
		)
	},
	publish (
		username : string,
		id : number
	) : Promise<string> {
		return new Promise ( (
			accept,
			reject
			) => {
				debug (
					'publishing project %d for %o',
					id,
					username
				)

				getAccount ( username ).then (
					(
						account : Account
					) => {
						if ( id >= 0 && id < account.projects.length && id % 1 === 0 ) {
							const project = account.projects[ id ]

							if ( !project.publishToken ) {
								debug ( 'generating publish token' )
								const publishToken = uuid.v4 ()

								debug ( 'activating publish token' )
								project.publishToken = publishToken
								data.publishTokens[ publishToken ] = <PublishToken> {
									username     : username,
									projectIndex : id
								}

								saveData ().then (
									() => accept ( publishToken )
								).catch (
									() => reject ( null )
								)
							} else {
								debug ( 'project already published' )

								reject ( null )
							}
						} else {
							debug (
								'invalid project id %d',
								id
							)

							reject ( null )
						}
					}
				).catch (
					reject
				)
			}
		)
	},
	unpublish (
		username : string,
		id : number
	) : Promise<boolean> {
		return new Promise ( (
			accept,
			reject
			) => {
				debug (
					'unpublishing project %d for %o',
					id,
					username
				)

				getAccount ( username ).then (
					(
						account : Account
					) => {
						if ( id >= 0 && id < account.projects.length && id % 1 === 0 ) {
							debug ( 'getting project' )

							const project = account.projects[ id ]

							if ( project.hasOwnProperty ( 'publishToken' ) ) {
								debug ( 'deactivating publish token' )

								delete data.publishTokens[ project.publishToken ]
								delete project.publishToken

								saveData ().then (
									accept
								).catch (
									reject
								)
							} else {
								debug ( 'project is not published' )

								reject ( false )
							}
						} else {
							debug (
								'invalid project id %d',
								id
							)

							reject ( false )
						}
					}
				).catch (
					() => reject ( false )
				)
			}
		)
	},
	resetEditorOptions (
		username : string
	) : Promise<boolean> {
		return new Promise ( (
			accept,
			reject
			) => {
				debug (
					'resetting editor options for %o',
					username
				)

				getAccount ( username ).then (
					( account : Account ) => {
						account.editorOptions = starterEditorOptions

						saveData ().then (
							accept
						).catch (
							reject
						)
					}
				).catch (
					() => reject ( false )
				)
			}
		)
	},
	upgradeHash (
		username : string,
		password : string
	) : Promise<boolean> {
		return new Promise (
			(
				accept,
				reject
			) => {
				debug (
					'upgrading hash for %o',
					username
				)

				getAccount ( username ).then (
					( account : Account ) => {
						account.password = currentHashVersion + '!' + hashFunctions[ currentHashVersion ] (
							username,
							password
						)

						saveData ().then (
							accept
						).catch (
							reject
						)
					}
				).catch (
					() => reject ( false )
				)
			}
		)
	},
	changePassword (
		username : string,
		oldPassword : string,
		newPassword : string
	) : Promise<boolean> {
		return new Promise (
			(
				accept,
				reject
			) => {
				debug (
					'changing password for %o',
					username
				)

				Api.validateCredentials (
					username,
					oldPassword
				).then (
					() => {
						getAccount (
							username
						).then (
							(
								account : Account
							) => {
								account.password = currentHashVersion + '!' + hashFunctions[ currentHashVersion ] (
									username,
									newPassword
								)

								saveData ().then (
									accept
								).catch (
									() => reject ( false )
								)
							}
						).catch (
							() => reject ( false )
						)
					}
				).catch (
					reject
				)
			}
		)
	},
	changeUsername (
		oldUsername : string,
		newUsername : string,
		password : string
	) : Promise<boolean> {
		return new Promise (
			(
				accept,
				reject
			) => {
				debug (
					'changing username of %o to %o',
					oldUsername,
					newUsername
				)

				if ( !data.accounts.hasOwnProperty ( newUsername ) && usernamePattern.test ( newUsername ) ) {
					Api.validateCredentials (
						oldUsername,
						password
					).then (
						() => {
							getAccount (
								oldUsername
							).then (
								(
									account : Account
								) => {
									debug ( 'setting username' )
									account.username = newUsername
									account.password = currentHashVersion + '!' + hashFunctions[ currentHashVersion ] (
										newUsername,
										password
									)

									debug ( 'migrating published projects to new username' )
									account.projects.forEach (
										(
											project : Project
										) => {
											if ( project.publishToken ) {
												data.publishTokens[ project.publishToken ].username = newUsername
											}
										}
									)

									debug ( 'migrating active token to new username' )
									if ( account.activeToken ) {
										data.activeTokens[ account.activeToken ] = newUsername
									}

									debug ( 'migrating account to new username' )
									delete data.accounts[ oldUsername ]
									data.accounts[ newUsername ] = account

									saveData ().then (
										accept
									).catch (
										reject
									)
								}
							).catch (
								() => reject ( false )
							)
						}
					).catch (
						reject
					)
				} else {
					reject ( false )
				}
			}
		)
	},
	isAdmin (
		username : string
	) : Promise<boolean> {
		return new Promise<boolean> (
			(
				accept,
				reject
			) => {
				debug (
					'checking if %o is admin',
					username
				)

				getAccount ( username ).then (
					( account : Account ) => {
						accept ( account.isAdmin )
					}
				).catch (
					() => reject ( false )
				)
			}
		)
	},
	getAccounts () : Promise<MinimalAccount[]> {
		return new Promise<MinimalAccount[]> (
			(
				accept,
				reject
			) => {
				debug ( 'getting accounts' )

				accept ( Object.keys ( data.accounts ).map (
					( username : string ) => {
						return {
							username : username,
							isAdmin  : data.accounts[ username ].isAdmin
						}
					}
				) )
			}
		)
	},
	getAccount (
		username : string
	) : Promise<Account> {
		return new Promise<Account> (
			(
				accept,
				reject
			) => {
				debug (
					'getting account of %o',
					username
				)

				if ( data.accounts.hasOwnProperty ( username ) ) {
					debug ( 'account exists' )

					accept ( data.accounts[ username ] )
				} else {
					debug ( 'account does not exist' )

					reject ( null )
				}
			}
		)
	},
	setAccount (
		username : string,
		account : Account
	) : Promise<boolean> {
		return new Promise<boolean> (
			(
				accept,
				reject
			) => {
				debug (
					'setting data of account %o to %O',
					username,
					account
				)

				if ( data.accounts.hasOwnProperty ( username ) ) {
					debug ( 'account exists' )

					data.accounts[ username ] = account

					saveData ().then (
						accept
					).catch (
						reject
					)
				} else {
					debug ( 'account exists' )

					reject ( false )
				}
			}
		)
	},
	getBugReports () : Promise<BugReport[]> {
		return new Promise<BugReport[]> (
			(
				accept,
				reject
			) => {
				debug ( 'getting bug reports' )

				accept ( data.bugReports.map (
					(
						report : BugReport,
						index : number
					) => {
						report.id = index

						return report
					}
				) )
			}
		)
	},
	setBugReport (
		id : number,
		bugReport : BugReport
	) : Promise<boolean> {
		return new Promise<boolean> (
			(
				accept,
				reject
			) => {
				debug (
					'setting bug report %d to %O',
					id,
					bugReport
				)

				data.bugReports[ id ] = bugReport

				saveData ().then (
					accept
				).catch (
					reject
				)
			}
		)
	},
	getStarterCode ( type : number ) : Promise<string> {
		return new Promise<string> ( ( accept ) => accept ( data.starterCodes[ type ] ) )
	},
	setStarterCode (
		type : number,
		code : string
	) : Promise<boolean> {
		return new Promise<boolean> (
			(
				accept,
				reject
			) => {
				data.starterCodes[ type ] = code

				saveData ().then (
					accept
				).catch (
					reject
				)
			}
		)
	}
}