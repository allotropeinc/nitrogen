import { Project } from './project'
import IEditorConstructionOptions = monaco.editor.IEditorConstructionOptions

export interface Account {
	username : string
	password : string
	projects : Project[],
	editorOptions : IEditorConstructionOptions,
	isAdmin : boolean,
	activeToken : string
}
