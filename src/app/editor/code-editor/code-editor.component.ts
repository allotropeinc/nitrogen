import {
	AfterViewInit,
	Component,
	ComponentFactory,
	ComponentFactoryResolver,
	ComponentRef,
	EventEmitter,
	Input,
	OnInit,
	Output,
	ViewChild,
	ViewContainerRef
}                        from '@angular/core'
import {EditorComponent} from 'ngx-monaco-editor'
import {Observable}      from 'rxjs'
import {ApiService}      from '../../api.service'
import IStandaloneCodeEditor = monaco.editor.IStandaloneCodeEditor

@Component({
	selector   : 'app-code-editor',
	templateUrl: './code-editor.component.html',
	styleUrls  : ['./code-editor.component.css']
})
export class CodeEditorComponent implements OnInit, AfterViewInit {
	private editorComponent: ComponentRef<EditorComponent>
	public working = true

	@ViewChild('editorContainer', {
		read  : ViewContainerRef,
		static: true
	})
	private editorContainer: ViewContainerRef
	private factory: ComponentFactory<EditorComponent>
	private editor: IStandaloneCodeEditor

	@Input()
	public code: string

	@Input()
	public language: string

	@Output()
	codeChange: EventEmitter<string>

	constructor(
		private factoryResolver: ComponentFactoryResolver,
		private api: ApiService
	) {
		this.codeChange = new EventEmitter<string>()
	}

	ngOnInit() {
		this.factory =
			this.factoryResolver.resolveComponentFactory(EditorComponent)
		this.codeChange.emit(this.code)
	}

	ngAfterViewInit() {
		this.reload().subscribe(this.reload.bind(this)) // HACK
	}

	reload() {
		return new Observable<boolean>(
			observer => {
				this.working = true

				this.api.getSettings().subscribe(
					settings => {
						if (settings) {
							this.editorContainer.clear()
							this.editor = null

							this.editorComponent =
								this.editorContainer.createComponent(
									this.factory)
							this.editorComponent.instance.options =
								settings.editor
							this.editorComponent.instance.writeValue(this.code)

							this.editorComponent.instance.registerOnChange(
								value => {
									this.code = value
									this.codeChange.emit(this.code)
								})

							this.editorComponent.instance.onInit.subscribe(
								(editor: IStandaloneCodeEditor) => {
									(this.editor = editor).getModel()
										.updateOptions({
											tabSize     : 4,
											insertSpaces: false
										});

									(<any> window).monaco.editor.setModelLanguage(
										editor.getModel(),
										this.language
									)
								})

							observer.next(true)
							observer.complete()
						} else {
							observer.next(false)
							observer.complete()
						}

						this.working = false
					})
			})
	}

	setValue(code: string) {
		if (this.editor) {
			this.editor.setValue(code)

			return true
		} else {
			return false
		}
	}
}
