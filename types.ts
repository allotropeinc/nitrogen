import IEditorConstructionOptions = monaco.editor.IEditorConstructionOptions

export interface TJSONProject {
	name : string
	code : string
	publishToken? : string
	/**
	 * 0: HTML
	 * 1: Markdown
	 */
	type : number
}

export interface TClientProject extends TJSONProject {
	id : number
}

export interface TJSONAccount {
	activeToken? : string
	username : string
	password : string
	projects : TJSONProject[]
	editorOptions : IEditorConstructionOptions
	isAdmin : boolean
}

export interface TMinimalAccount {
	username : string
	isAdmin : boolean
}

export interface TJSONPublishToken {
	username : string
	projectIndex : number
}

export interface TJSONBugReport {
	username : string
	title : string
	summary : string
	steps : string
	comments : string
	read : boolean
	id? : number
}

export interface TJSONApiData {
	accounts : {
		[ username : string ] : TJSONAccount
	}

	activeTokens : {
		[ token : string ] : string
	}

	publishTokens : {
		[ token : string ] : TJSONPublishToken
	}

	starterCodes : string[]

	bugReports : TJSONBugReport[]
	version : number
}

export interface TProject {
	name : string
	code : string
	publishToken? : string
	/**
	 * 0: HTML
	 * 1: Markdown
	 */
	type : number
	owner : TAccount
}

export interface TAccount {
	activeToken? : string
	username : string
	password : string
	projects : TProject[]
	editorOptions : IEditorConstructionOptions
	isAdmin : boolean
}

export interface TBugReport {
	user : TAccount
	title : string
	summary : string
	steps : string
	comments : string
	read : boolean
}

export interface TClientBugReport extends TBugReport {
	username : string
	user : undefined
	id : number
}

/**
 * This is the format of the Carbyne database. Should you use toObject on the
 * whole thing, this is the data structure it would reveal. Hopefully you never
 * toObject the whole database because that would have huge memory requirements
 * and would be incredibly inefficient.
 */
export interface TApiData {
	accounts : {
		[ username : string ] : TAccount
	}

	activeTokens : {
		[ token : string ] : TAccount
	}

	publishTokens : {
		[ token : string ] : TProject
	}

	starterCodes : string[]
	bugReports : TBugReport[]
}

export type TUpgrades = ( ( data : TJSONApiData ) => Promise<void> )[]

export const usernamePattern = /^[\w\d]{1,16}$/
export const DECRYPTION_CONFIRMATION_HEADER = '!!!!!DECRYPTION_CONFIRMATION_HEADER!!!!!'
