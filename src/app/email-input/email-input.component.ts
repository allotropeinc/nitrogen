import {
	Component,
	EventEmitter,
	forwardRef,
	Input,
	OnInit,
	Output
} from '@angular/core'

import {
	ControlValueAccessor,
	FormControl,
	NG_VALUE_ACCESSOR,
	Validators
} from '@angular/forms'

@Component({
	selector   : 'app-email-input',
	templateUrl: './email-input.component.html',
	providers  : [
		{
			provide    : NG_VALUE_ACCESSOR,
			multi      : true,
			useExisting: forwardRef(() => EmailInputComponent)
		}
	]
})
export class EmailInputComponent implements OnInit, ControlValueAccessor {
	@Input()
	isNewEmail = false

	@Input()
	name = 'email'

	@Input()
	placeholder = 'Email'

	@Input()
	hint = true

	_formControl: FormControl

	@Output('formControl')
	formControlChange = new EventEmitter<FormControl>()

	set formControl(newFormControl) {
		if (newFormControl !== this._formControl) {
			this._formControl = newFormControl
			this.formControlChange.emit(newFormControl)
		}
	}

	get formControl() {
		return this._formControl
	}

	private _value = ''

	get value() {
		return this._value
	}

	@Input()
	set value(newValue) {
		if (newValue !== this._value) {
			this.writeValue(newValue)
		}
	}

	private _disabled = false

	@Output()
	disabledChange = new EventEmitter<boolean>()

	@Input()
	set disabled(isDisabled) {
		this.setDisabledState(isDisabled)
	}

	get disabled() {
		return this._disabled
	}

	ngOnInit() {
		this.formControl = new FormControl(this.value, this.isNewEmail ? [
			Validators.required,
			Validators.email
		] : [
			Validators.required
		])

		this.formControl.valueChanges.subscribe(newValue => {
			this._value = newValue
		})

		if (this.disabled) {
			this.formControl.disable()
		} else {
			this.formControl.enable()
		}
	}

	getErrorMessage(): string {
		if (this.formControl.hasError('required')) {
			return 'This field is required'
		} else if (this.formControl.hasError('email')) {
			return 'Enter a valid email address'
		}

		return 'Unknown error'
	}

	writeValue(newValue) {
		this._value = newValue
	}

	onChange(newValue: string) {}

	onTouched() {}

	registerOnChange(fn) {
		this.onChange = fn
	}

	registerOnTouched(fn) {
		this.onTouched = fn
	}

	setDisabledState(isDisabled) {
		this._disabled = isDisabled
		this.disabledChange.emit(isDisabled)

		if (this.formControl) {
			if (isDisabled) {
				this.formControl.disable()
			} else {
				this.formControl.enable()
			}
		}
	}
}
