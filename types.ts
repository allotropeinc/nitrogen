import IEditorConstructionOptions = monaco.editor.IEditorConstructionOptions

export interface Project {
	name : string,
	code : string,
	publishToken? : string
}

export interface ClientProject extends Project {
	id : number
}

export interface Account {
	activeToken? : string,
	username : string,
	password : string,
	projects : Project[],
	editorOptions : IEditorConstructionOptions,
	isAdmin : boolean
}

export interface MinimalAccount {
	username : string,
	isAdmin : boolean
}

export interface PublishToken {
	username : string,
	projectIndex : number
}

export interface BugReport {
	username : string
	title : string
	summary : string
	steps : string
	comments : string
	read : boolean
	id? : number
}

export interface ApiData {
	accounts : {
		[ username : string ] : Account
	}

	activeTokens : {
		[ token : string ] : string
	}

	publishTokens : {
		[ token : string ] : PublishToken
	}

	bugReports : BugReport[]
	version : number
}

export type Upgrades = ( ( data : ApiData ) => Promise<void> )[]