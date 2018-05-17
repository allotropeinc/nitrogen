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
}                          from '@angular/core'
import { EditorComponent } from 'ngx-monaco-editor/editor.component'
import { ApiService }      from '../../api.service'
import { Observable }      from 'rxjs'
import IStandaloneCodeEditor = monaco.editor.IStandaloneCodeEditor

@Component ( {
	selector    : 'app-code-editor',
	templateUrl : './code-editor.component.html',
	styleUrls   : [ './code-editor.component.css' ]
} )
export class CodeEditorComponent implements OnInit, AfterViewInit {
	private editorComponent : ComponentRef<EditorComponent>
	public working = true
	@ViewChild (
		'editorContainer',
		{ read : ViewContainerRef }
	)
	private editorContainer : ViewContainerRef
	private factory : ComponentFactory<EditorComponent>
	private editor : IStandaloneCodeEditor

	@Input ()
	public code : string

	@Output ()
	codeChange : EventEmitter<string>

	constructor (
		private factoryResolver : ComponentFactoryResolver,
		private api : ApiService
	) {
		this.codeChange = new EventEmitter<string> ()
	}

	ngOnInit () {
		this.factory = this.factoryResolver.resolveComponentFactory ( EditorComponent )
		this.codeChange.emit ( this.code )
	}

	ngAfterViewInit () {
		this.reload ().subscribe ( this.reload ) // HACK
	}

	reload () {
		return new Observable<boolean> (
			observer => {
				this.working = true

				this.api.getEditorOptions ().subscribe (
					options => {
						if ( options ) {
							this.editorContainer.clear ()
							this.editor = null

							this.editorComponent = this.editorContainer.createComponent ( this.factory )
							this.editorComponent.instance.options = options
							this.editorComponent.instance.writeValue ( this.code )

							this.editorComponent.instance.registerOnChange (
								value => {
									this.code = value
									this.codeChange.emit ( this.code )
								} )

							this.editorComponent.instance.onInit.subscribe ( ( editor : IStandaloneCodeEditor ) => {
								( this.editor = editor ).getModel ().updateOptions ( {
									tabSize      : 4,
									insertSpaces : false
								} )
							} )

							observer.next ( true )
							observer.complete ()
						} else {
							observer.next ( false )
							observer.complete ()
						}

						this.working = false
					} )
			} )
	}

	setValue ( code : string ) {
		if ( this.editor ) {
			this.editor.setValue ( code )

			return true
		} else {
			return false
		}
	}
}
