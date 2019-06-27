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
	selector   : 'app-password-input',
	templateUrl: './password-input.component.html',
	providers  : [
		{
			provide    : NG_VALUE_ACCESSOR,
			multi      : true,
			useExisting: forwardRef(() => PasswordInputComponent)
		}
	]
})
export class PasswordInputComponent implements OnInit, ControlValueAccessor {
	@Input()
	visibilityButton = true

	@Input()
	isNewPassword = false

	@Input()
	name = 'password'

	@Input()
	placeholder = 'Password'

	@Input()
	showPassword = false

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
		this.formControl = new FormControl(this.value, this.isNewPassword ? [
			Validators.required,
			Validators.minLength(6),
			Validators.maxLength(1024)
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
		} else if (this.formControl.hasError('minlength')) {
			return 'Password must be at least 6 characters long'
		} else if (this.formControl.hasError('maxlength')) {
			return 'Password must be at most 1024 characters long'
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
