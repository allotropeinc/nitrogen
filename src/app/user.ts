import { Project } from './project'
import IEditorConstructionOptions = monaco.editor.IEditorConstructionOptions

export class User {
	constructor (
		public projects : Project[],
		public editorOptions : IEditorConstructionOptions
	) {}
}
