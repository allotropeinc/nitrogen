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
}                        from '@angular/forms'
import {usernamePattern} from '../../../backend/src/types/shared-vars'

@Component({
	selector   : 'app-username-input',
	templateUrl: './username-input.component.html',
	providers  : [
		{
			provide    : NG_VALUE_ACCESSOR,
			multi      : true,
			useExisting: forwardRef(() => UsernameInputComponent)
		}
	]
})
export class UsernameInputComponent implements OnInit, ControlValueAccessor {
	@Input()
	isNewUsername = false

	@Input()
	name = 'username'

	@Input()
	placeholder = 'Username'

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
		this.formControl = new FormControl(this.value, this.isNewUsername ? [
			Validators.maxLength(16),
			Validators.required,
			Validators.pattern(usernamePattern)
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
		if (this.formControl.hasError('maxlength')) {
			return 'Usernames can be up to 16 characters long'
		} else if (this.formControl.hasError('required')) {
			return 'This field is required'
		} else if (this.formControl.hasError('pattern')) {
			return 'Letters and numbers only, no spaces'
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
