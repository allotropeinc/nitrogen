import IEditorConstructionOptions = monaco.editor.IEditorConstructionOptions
import { ClientProject } from '../../backend/types'

export class User {
	constructor (
		public projects : ClientProject[],
		public editorOptions : IEditorConstructionOptions
	) {}
}
