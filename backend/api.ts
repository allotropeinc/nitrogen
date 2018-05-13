import IEditorConstructionOptions = monaco.editor.IEditorConstructionOptions
import { Account, ApiData, BugReport, ClientProject, Project, PublishToken } from './types'
import * as crypto                                                           from 'crypto'

const fs = require ( 'fs' )
const uuid = require ( 'uuid' )
let data : ApiData = null

const starterEditorOptions : IEditorConstructionOptions = {
	acceptSuggestionOnCommitCharacter : true,
	acceptSuggestionOnEnter           : 'on',
	accessibilitySupport              : 'auto',
	ariaLabel                         : '',
	autoClosingBrackets               : true,
	autoIndent                        : true, // false,
	automaticLayout                   : true,
	codeLens                          : true,
	contextmenu                       : true,
	cursorBlinking                    : 'blink',
	cursorStyle                       : 'line',
	disableLayerHinting               : false,
	disableMonospaceOptimizations     : false,
	dragAndDrop                       : false,
	emptySelectionClipboard           : false,
	extraEditorClassName              : '',
	fixedOverflowWidgets              : false,
	folding                           : true,
	fontFamily                        : 'Inconsolata',
	fontLigatures                     : true, // false,
	fontSize                          : 14,
	fontWeight                        : '100', // 'normal',
	formatOnPaste                     : false,
	formatOnType                      : false,
	glyphMargin                       : false,
	hideCursorInOverviewRuler         : false,
	hover                             : true,
	iconsInSuggestions                : true,
	letterSpacing                     : 0,
	lineDecorationsWidth              : 10,
	lineHeight                        : 16,
	lineNumbers                       : 'on',
	lineNumbersMinChars               : 5,
	links                             : false, // true,
	matchBrackets                     : true,
	mouseWheelScrollSensitivity       : 1,
	mouseWheelZoom                    : false,
	multiCursorModifier               : 'ctrlCmd', // 'alt',
	occurrencesHighlight              : true,
	overviewRulerBorder               : true,
	overviewRulerLanes                : 2,
	parameterHints                    : true,
	quickSuggestions                  : true,
	quickSuggestionsDelay             : 500,
	readOnly                          : false,
	renderControlCharacters           : true, // false,
	renderIndentGuides                : true, // false,
	renderLineHighlight               : 'none', // 'all',
	renderWhitespace                  : 'all', // 'none',
	revealHorizontalRightPadding      : 30,
	roundedSelection                  : true,
	rulers                            : [],
	scrollBeyondLastLine              : false, // true,
	selectOnLineNumbers               : true,
	selectionClipboard                : true,
	selectionHighlight                : true,
	showFoldingControls               : 'always', // 'mouseover',
	snippetSuggestions                : 'bottom',
	stopRenderingLineAfter            : -1,
	suggestFontSize                   : 14,
	suggestLineHeight                 : 16, // 14,
	suggestOnTriggerCharacters        : true,
	useTabStops                       : true, // false,
	wordBasedSuggestions              : true,
	wordSeparators                    : '`~!@#$%^&*()-=+[{]}\\|;:\\\'",.<>/?',
	wordWrap                          : 'on', // 'off',
	wordWrapBreakAfterCharacters      : ' \t})]?|&,;',
	wordWrapBreakBeforeCharacters     : '{([+',
	wordWrapBreakObtrusiveCharacters  : '.',
	wordWrapColumn                    : 80,
	wordWrapMinified                  : true,
	wrappingIndent                    : 'same', // 'none',

	language             : 'html',
	theme                : 'vs-dark',
	accessibilityHelpUrl : ''
}

const starterCode = '<!doctype html>\n' +
	'<html>\n' +
	'\t<head>\n' +
	'\t\t<meta charset="utf-8">\n' +
	'\t\t<title>Getting Started with the HTML Editor</title>\n' +
	'\t\t<style type="text/css">\n' +
	'\t\t\t/* put CSS styles here */\n' +
	'\t\t</style>\n' +
	'\t\t<script type="text/javascript">\n' +
	'\t\t\t/* put JavaScript here */\n' +
	'\t\t</script>\n' +
	'\t</head>\n' +
	'\t<body>\n' +
	'\t\t<h1>Welcome to the new real-time HTML editor!</h1>\n' +
	'\t\t<p>I hope you like it! Here\'s a quick tutorial on how to use some common functions:</p>\n' +
	'\t\t<h2>Changing Editor Options</h2>\n' +
	'\t\t<p>There\'s a button on the top-left of the screen. It looks like this:</p>\n' +
	'\t\t<p><img src="https://puu.sh/AibHf/de5213fb3a.png"></p>\n' +
	'\t\t<p>If you click it, it will bring up a menu. In that menu is an option to return to the dashboard, and a whole ton of editor options down below. Leaving them alone won\'t do any harm, but if you want to use Comic Sans, go ahead and use Comic Sans! I\'ll hate you, but it won\'t break anything.</p>\n' +
	'\t\t<p><img src="https://puu.sh/AibJN/02edf0d97b.png" style="border: 2em solid #424242; height: 39px"></p>\n' +
	'\t\t<p>Don\'t forget to hit that save button when you\'re done!</p>\n' +
	'\t\t<p><img src="https://puu.sh/AibOO/f88c13ff6e.png" style="border: 2em solid #424242; height: 36px"></p>\n' +
	'\t\t<h2>Publishing a Project</h2>\n' +
	'\t\t<p>Let\'s say you\'ve created this amazing project and you want to share it with someone else, but you don\'t want to give them your username and password. That\'s fine! With the power of <b>publishing</b>, you can share your project with others easily and safely.</p>\n' +
	'\t\t<p>So.. how exactly do we publish? Well, let me walk you through it!</p>\n' +
	'\t\t<ol>\n' +
	'\t\t\t<li>Open an amazing project (like this one!)</li>\n' +
	'\t\t\t<li>Find that attractive-looking <b>Publish</b> button, it looks like this:<br /><br /><img src="https://puu.sh/AibUE/01dc2e1602.png"  style="border: 2em solid #212121; height: 36px"></li>\n' +
	'\t\t\t<li>Click it! Soon, that button will <b>multiply</b>. Not really, but it will turn into two buttons: a scary-looking <b>Unpublish</b> button, and a jolly <b>Published</b> button!<br /><br /><img src="https://puu.sh/Aic2e/3f9555cce4.png"  style="border: 2em solid #212121; height: 36px"></li>\n' +
	'\t\t\t<li>Click the <b>Published</b> button to visit your published page. Don\'t worry, you won\'t lose your work, it\'ll open in a new tab. The link will be super attractive, like <a href="https://html.localtunnel.me/api/projects/published/677225cc-116b-4f62-9341-511d07f6f8df" target="_blank">https://magic.unicorns</a>. Okay, I cheated a bit there, it\'s going to be a bit uglier.</li>\n' +
	'\t\t\t<li>You can always click the <b>Unpublish</b> button to unpublish your project.</li>\n' +
	'\t\t</ol>\n' +
	'\t\t<p>You can share that URL with anyone! They won\'t have to be logged in. Don\'t worry about being up to date - if you save your project while it\'s published, the page will automatically update. Don\'t worry about unpublishing it either - you can publish it again at any time, though the link will be different if you do.</p>\n' +
	'\t</body>\n' +
	'</html>'

function getData () : Promise<ApiData> {
	return new Promise ( (
		accept,
		reject
		) => {
			fs.readFile (
				'./data.json',
				'utf8',
				(
					err : NodeJS.ErrnoException,
					content : string
				) => {
					if ( !err ) {
						accept ( JSON.parse ( content ) )
					} else {
						reject ( null )
					}
				}
			)
		}
	)
}

function saveData () : Promise<boolean> {
	return new Promise ( (
		accept,
		reject
		) => {
			fs.writeFile (
				'./data.json',
				JSON.stringify (
					data,
					undefined,
					'\t'
				),
				( err : NodeJS.ErrnoException ) => {
					if ( !err ) {
						accept ( true )
					} else {
						reject ( false )
					}
				}
			)
		}
	)
}

function getAccount (
	username : string
) : Promise<Account> {
	return new Promise ( (
		accept,
		reject
		) => {
			if ( data.accounts.hasOwnProperty ( username ) ) {
				accept ( data.accounts[ username ] )
			} else {
				reject ( false )
			}
		}
	)
}

const hashFunctions = {
	v1 : function (
		username : string,
		password : string
	) : string {
		return crypto.createHash ( 'sha256' ).update (
			password,
			'utf8'
		).digest ( 'hex' )
	},
	v2 : function (
		username : string,
		password : string
	) : string {
		return crypto.createHmac (
			'sha256',
			password
		).update (
			password,
			'utf8'
		).digest ( 'hex' )
	},
	v3 : function (
		username : string,
		password : string
	) : string {
		return crypto.createHmac (
			'sha256',
			username
		).update (
			password,
			'utf8'
		).digest ( 'hex' )
	}
}

const currentHashVersion = 'v3'

export const Api = {
	validateToken (
		token : string
	) : Promise<boolean> {
		return new Promise ( (
			accept,
			reject
			) => {
				if ( data.activeTokens.hasOwnProperty ( token ) ) {
					accept ( true )
				} else {
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
				getAccount ( username ).then (
					() => {
						reject ( false )
					}
				).catch (
					() => {
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
				getAccount ( username ).then (
					( account : Account ) => {
						if ( account.activeToken ) {
							accept ( account.activeToken )
						} else {
							const token = uuid.v4 ()

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
				getAccount ( username ).then (
					( account : Account ) => {
						const hashed = account.password.split ( '!' )
						let algorithm = 'v1'

						if ( hashed.length !== 1 ) { // length === 1 means v1, before hashes were versioned
							algorithm = hashed[ 0 ]
						}

						if ( hashFunctions[ algorithm ] (
							username,
							password
						) === hashed[ hashed.length - 1 ] ) {
							let token : string

							if ( account.activeToken ) {
								token = account.activeToken
							}

							Api.upgradeHash (
								username,
								password
							).then (
								accept
							).catch (
								reject
							)
						} else {
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
				Api.validateCredentials (
					username,
					password
				).then (
					() => {
						getAccount ( username ).then (
							( account : Account ) => {
								let token : string

								if ( account.activeToken ) {
									token = account.activeToken
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
	logoutAccount : (
		username : string
	) : Promise<boolean> => {
		return new Promise<boolean> (
			(
				accept,
				reject
			) => {
				getAccount ( username ).then (
					( account : Account ) => {
						if ( !account.activeToken ) {
							accept ( true )
						} else {
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
				getAccount ( username ).then (
					( account : Account ) => {
						accept ( account.projects.map (
							(
								project : Project,
								index : number
							) => {
								return <ClientProject> {
									id           : index,
									name         : project.name,
									code         : project.code,
									publishToken : project.publishToken
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
				Api.validateToken ( token ).then (
					() => {
						if ( data.activeTokens.hasOwnProperty ( token ) ) {
							accept ( data.activeTokens[ token ] )
						} else {
							reject ( null )
						}
					}
				).catch (
					() => reject ( null )
				)
			}
		)
	},
	newProject (
		username : string,
		name : string
	) : Promise<boolean> {
		return new Promise ( (
			accept,
			reject
			) => {
				getAccount ( username ).then (
					( account : Account ) => {
						account.projects.push ( <Project> {
								name : name,
								code : starterCode
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
				getAccount ( username ).then (
					( account : Account ) => {
						if ( id >= 0 && id < account.projects.length && id % 1 === 0 ) {
							account.projects[ id ].name = name

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
	deleteProject (
		username : string,
		id : number
	) : Promise<boolean> {
		return new Promise ( (
			accept,
			reject
			) => {
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

							saveData ().then (
								accept
							).catch (
								reject
							)
						} else {
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
				getAccount ( username ).then (
					( account : Account ) => {
						if ( id >= 0 && id < account.projects.length && id % 1 === 0 && id + delta >= 0 && id + delta < account.projects.length && ( id + delta ) % 1 === 0 ) {
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
				getAccount ( username ).then (
					( account : Account ) => {
						if ( id >= 0 && id < account.projects.length && id % 1 === 0 ) {
							const project = account.projects[ id ]

							accept ( <ClientProject> {
									id           : id,
									name         : project.name,
									code         : project.code,
									publishToken : project.publishToken
								}
							)
						} else {
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
		username : string,
		password : string
	) : Promise<boolean> {
		return new Promise ( (
			accept,
			reject
			) => {
				Api.validateCredentials (
					username,
					password
				).then (
					() => {
						getAccount ( username ).then (
							( account : Account ) => {
								delete data.accounts[ username ]

								if ( account.hasOwnProperty ( 'activeToken' ) ) {
									delete data.activeTokens[ account.activeToken ]
								}

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
				).catch (
					reject
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
				if ( data.publishTokens.hasOwnProperty ( publishToken ) ) {
					const token : PublishToken = data.publishTokens[ publishToken ]

					accept ( data.accounts[ token.username ].projects[ token.projectIndex ] )
				} else {
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
				getAccount ( username ).then (
					(
						account : Account
					) => {
						if ( id >= 0 && id < account.projects.length && id % 1 === 0 ) {
							const project = account.projects[ id ]

							if ( !project.publishToken ) {
								const publishToken = uuid.v4 ()

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
								reject ( null )
							}
						} else {
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
				getAccount ( username ).then (
					(
						account : Account
					) => {
						if ( id >= 0 && id < account.projects.length && id % 1 === 0 ) {
							const project = account.projects[ id ]

							if ( project.hasOwnProperty ( 'publishToken' ) ) {
								delete data.publishTokens[ project.publishToken ]
								delete project.publishToken

								saveData ().then (
									accept
								).catch (
									reject
								)
							} else {
								reject ( false )
							}
						} else {
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
				if ( !data.accounts.hasOwnProperty ( newUsername ) ) {
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
									account.username = newUsername
									account.password = currentHashVersion + '!' + hashFunctions[ currentHashVersion ] (
										newUsername,
										password
									)

									account.projects.forEach (
										(
											project : Project
										) => {
											if ( project.publishToken ) {
												data.publishTokens[ project.publishToken ].username = newUsername
											}
										}
									)

									if ( account.activeToken ) {
										data.activeTokens[ account.activeToken ] = newUsername
									}

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
	getAccounts () : Promise<string[]> {
		return new Promise<string[]> (
			(
				accept,
				reject
			) => {
				accept ( Object.keys ( data.accounts ) )
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
				if ( data.accounts.hasOwnProperty ( username ) ) {
					accept ( data.accounts[ username ] )
				} else {
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
				if ( data.accounts.hasOwnProperty ( username ) ) {
					data.accounts[ username ] = account

					saveData ().then (
						accept
					).catch (
						reject
					)
				} else {
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
				data.bugReports[ id ] = bugReport

				saveData ().then (
					accept
				).catch (
					reject
				)
			}
		)
	}
}

getData ().then (
	( apiData : ApiData ) => {
		data = apiData
	}
)