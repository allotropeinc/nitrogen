import IEditorConstructionOptions = monaco.editor.IEditorConstructionOptions
import { ClientProject } from '../../backend/types'

export interface Account {
	username : string
	password : string
	projects : ClientProject[],
	editorOptions : IEditorConstructionOptions,
	isAdmin : boolean,
	activeToken : string
}
