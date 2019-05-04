import {Component, Input} from '@angular/core'
import IEditorConstructionOptions = monaco.editor.IEditorConstructionOptions

@Component({
	selector   : 'app-editor-sidenav-editor-settings',
	templateUrl: './editor-sidenav-editor-settings.component.html',
	styleUrls  : ['./editor-sidenav-editor-settings.component.css']
})
export class EditorSidenavEditorSettingsComponent {
	@Input()
	public editorSettings: IEditorConstructionOptions

	@Input()
	public disabled: boolean
}
