import IEditorConstructionOptions = monaco.editor.IEditorConstructionOptions
import * as crypto                                                                                                           from 'crypto'
import * as fs                                                                                                               from 'fs-extra'
import * as path                                                                                                             from 'path'
import * as uuid                                                                                                             from 'uuid'
import { upgradeToCarbyne }                                                                                                  from './carbyneMigration'
import { db }                                                                                                                from './index'
import { DECRYPTION_CONFIRMATION_HEADER, TAccount, TClientProject, TJSONAccount, TJSONBugReport, TMinimalAccount, TProject } from './types'
import { upgradeJSONData }                                                                                                   from './upgradeJSON'

const debug = require ( 'debug' ) (
	'hexazine:api'
)

debug.enabled = true

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

	// language             : 'html',
	theme                : 'vs-dark',
	accessibilityHelpUrl : ''
}

const hashFunctions = {
	v1 : function (
		username : string,
		password : string
	) : string {
		debug (
			'calculating v1 hash for %o',
			username
		)

		return crypto.createHash ( 'sha256' ).update (
			password,
			'utf8'
		).digest ( 'hex' )
	},
	v2 : function (
		username : string,
		password : string
	) : string {
		debug (
			'calculating v2 hash for %o',
			username
		)

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
		debug (
			'calculating v3 hash for %o',
			username
		)

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

function generateHash (
	username : string,
	password : string,
	version = currentHashVersion
) {
	return version + '!' + hashFunctions[ version ] (
		username,
		password
	)
}

async function getAccount ( username : string ) {
	const accounts = await db.getKey (
		'root',
		'accounts'
	)

	if ( !await db.hasKey (
		accounts,
		username
	) ) {
		return null
	}

	return await db.getKey (
		accounts,
		username
	)
}

export const Api = {
	async validateToken (
		token : string
	) : Promise<boolean> {
		return await db.hasKey (
			await db.getKey (
				'root',
				'activeTokens'
			),
			token
		)
	},
	async createAccount (
		username : string,
		password : string
	) : Promise<boolean> {
		const accounts = await db.getKey (
			'root',
			'accounts'
		)

		if ( await db.hasKey (
			accounts,
			username
		) ) {
			return false
		}

		await db.setKey (
			accounts,
			username,
			<TAccount> {
				username      : username,
				password      : generateHash (
					username,
					password
				),
				projects      : [],
				editorOptions : starterEditorOptions,
				isAdmin       : false
			}
		)

		return true
	},
	async token (
		username : string
	) : Promise<string> {
		const account = await getAccount ( username )

		if ( await db.hasKey (
			account,
			'activeToken'
		) ) {
			return await db.toObject ( await db.getKey (
				account,
				'activeToken'
			) )
		}

		const token = uuid.v4 ()

		await db.setKey (
			await db.getKey (
				'root',
				'activeTokens'
			),
			token,
			account
		)

		await db.setKey (
			account,
			'activeToken',
			token
		)

		return token
	},
	async validateCredentials (
		username : string,
		password : string
	) : Promise<boolean> {
		const account = await getAccount ( username )

		if ( !account ) {
			return false
		}

		const storedPassword = await db.toObject ( await db.getKey (
			account,
			'password'
		) )

		const segments = storedPassword.split ( '!' )
		let version
		let hash

		if ( segments.length === 1 ) {
			// v1 password, before versioning was a thing

			version = 'v1'
			hash = segments[ 0 ]
		} else {
			version = segments[ 0 ]
			hash = segments[ 1 ]
		}

		const full = version + '!' + hash
		const gen = generateHash (
			username,
			password,
			version
		)

		return full === gen
	},
	async authenticate (
		username : string,
		password : string
	) : Promise<string> {
		if ( await Api.validateCredentials (
			username,
			password
		) ) {
			return await Api.token ( username )
		}

		return null
	},
	async logoutAccount (
		username : string
	) : Promise<boolean> {
		try {
			const account = await getAccount ( username )

			if ( !account || !await db.hasKey (
				account,
				'activeToken'
			) ) {
				return false
			}

			const token = await db.toObject (
				await db.getKey (
					account,
					'activeToken'
				)
			)

			await db.delKey (
				account,
				'activeToken'
			)

			await db.delKey (
				await db.getKey (
					'root',
					'activeTokens'
				),
				token
			)

			return true
		} catch ( e ) { console.error ( e ) }
	},
	async getProjects (
		username : string
	) : Promise<TClientProject[]> {
		const account = await getAccount ( username )

		if ( !account ) {
			return null
		}

		const projects = await db.getKey (
			account,
			'projects'
		)

		const length = await db.getLength ( projects )

		const promises = []

		for ( let i = 0 ; i < length ; i++ ) {
			promises.push ( ( async () => {
				const project = await db.getKey (
					projects,
					i
				)

				let values : any = [
					db.getKey (
						project,
						'name'
					),
					db.getKey (
						project,
						'code'
					),
					db.getKey (
						project,
						'type'
					)
				]

				if ( await db.hasKey (
					project,
					'publishToken'
				) ) {
					values.push ( db.getKey (
						project,
						'publishToken'
					) )
				}

				values = await Promise.all ( values )

				for ( let i = 0 ; i < values.length ; i++ ) {
					values[ i ] = db.toObject ( values[ i ] )
				}

				values = await Promise.all ( values )

				const toReturn : TClientProject = {
					name : values[ 0 ],
					code : values[ 1 ],
					type : values[ 2 ],
					id   : i
				}

				if ( values.length > 3 ) {
					toReturn.publishToken = values[ 3 ]
				}

				return toReturn
			} ) () )
		}

		return await Promise.all ( promises )
	},
	async getOwner (
		token : string
	) : Promise<string> {
		const activeTokens = await db.getKey (
			'root',
			'activeTokens'
		)

		if ( !await db.hasKey (
			activeTokens,
			token
		) ) {
			return null
		}

		return await db.toObject ( await db.getKey (
			await db.getKey (
				activeTokens,
				token
			),
			'username'
		) )
	},
	async newProject (
		username : string,
		name : string,
		type : number,
		code? : string
	) : Promise<boolean> {
		const account = await getAccount ( username )

		if ( !account ) {
			return false
		}

		await db.push (
			await db.getKey (
				account,
				'projects'
			),
			<TProject> {
				name : name,
				type : type,
				code : DECRYPTION_CONFIRMATION_HEADER + ( code || await db.getKey (
					await db.getKey (
						'root',
						'starterCodes'
					),
					type
				) )
			}
		)

		return true
	},
	async renameProject (
		username : string,
		id : number,
		name : string
	) : Promise<boolean> { return false },
	async deleteProject (
		username : string,
		id : number
	) : Promise<boolean> { return false },
	async moveProject (
		username : string,
		id : number,
		delta : number
	) : Promise<boolean> { return false },
	async getProject (
		username : string,
		id : number
	) : Promise<TClientProject> { return null },
	async setProjectCode (
		username : string,
		id : number,
		code : string
	) : Promise<boolean> { return false },
	async getEditorOptions (
		username : string
	) : Promise<IEditorConstructionOptions> { return null },
	async setEditorOptions (
		username : string,
		options : IEditorConstructionOptions
	) : Promise<boolean> { return false },
	async submitBugReport (
		username : string,
		bugReport : TJSONBugReport
	) : Promise<boolean> { return false },
	async deleteAccount (
		username : string
	) : Promise<boolean> { return false },
	async getPublished (
		publishToken : string
	) : Promise<TProject> { return null },
	async publish (
		username : string,
		id : number
	) : Promise<string> { return null },
	async unpublish (
		username : string,
		id : number
	) : Promise<boolean> { return false },
	async resetEditorOptions (
		username : string
	) : Promise<boolean> { return false },
	async upgradeHash (
		username : string,
		password : string
	) : Promise<boolean> { return false },
	async changePassword (
		username : string,
		oldPassword : string,
		newPassword : string
	) : Promise<boolean> { return false },
	async changeUsername (
		oldUsername : string,
		newUsername : string,
		password : string
	) : Promise<boolean> { return false },
	async isAdmin (
		username : string
	) : Promise<boolean> { return false },
	async getAccounts () : Promise<TMinimalAccount[]> { return null },
	async getAccount (
		username : string
	) : Promise<TJSONAccount> {
		const account = await getAccount ( username )

		if ( !account ) {
			return null
		}

		let values : any = [
			db.getKey (
				account,
				'username'
			),
			db.getKey (
				account,
				'password'
			),
			db.getKey (
				account,
				'isAdmin'
			)
		]

		if ( await db.hasKey (
			account,
			'activeToken'
		) ) {
			values.push ( db.getKey (
				account,
				'activeToken'
			) )
		}

		values = await Promise.all ( values )

		for ( let i = 0 ; i < values.length ; i++ ) {
			values[ i ] = db.toObject ( values[ i ] )
		}

		values = await Promise.all ( values )

		const toReturn : TJSONAccount = {
			username      : values[ 0 ],
			password      : values[ 1 ],
			projects      : [],
			editorOptions : {},
			isAdmin       : values[ 2 ]
		}

		if ( values.length > 3 ) {
			toReturn.activeToken = values[ 3 ]
		}

		return toReturn
	},
	async setAccount (
		username : string,
		account : TJSONAccount
	) : Promise<boolean> { return false },
	async getBugReports () : Promise<TJSONBugReport[]> { return null },
	async setBugReport (
		id : number,
		bugReport : TJSONBugReport
	) : Promise<boolean> { return false },
	async getStarterCode ( type : number ) : Promise<string> { return null },
	async setStarterCode (
		type : number,
		code : string
	) : Promise<boolean> { return false }
}

debug ( 'api functions exported' );

( async () => {
	try {
		const data = JSON.parse ( await fs.readFile (
			path.join (
				__dirname,
				'data.json'
			),
			'utf8'
		) )

		debug ( 'Ensuring old data.json is up to date...' )

		await upgradeJSONData ( data )

		debug ( 'Migrating old data.json to Carbyne...' )

		await upgradeToCarbyne ( data )

		debug ( 'Creating backup of data.json...' )

		await fs.move (
			path.join (
				__dirname,
				'data.json'
			),
			path.join (
				__dirname,
				'data.json.bak'
			)
		)

		debug ( 'Done. Database is fully operational.' )
	} catch ( e ) {
		if ( e.code !== 'ENOENT' ) {
			throw e
		}
	}
} ) ()
