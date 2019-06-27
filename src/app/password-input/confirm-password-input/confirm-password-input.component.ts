import {Component, Input, OnInit}     from '@angular/core'
import {AbstractControl, FormControl} from '@angular/forms'
import {PasswordInputComponent}       from '../password-input.component'

@Component({
	selector   : 'app-confirm-password-input',
	templateUrl: '../password-input.component.html'
})
export class ConfirmPasswordInputComponent extends PasswordInputComponent implements OnInit {
	@Input()
	otherFormControl: FormControl

	placeholder = 'Confirm Password'
	hint = false

	ngOnInit() {
		super.ngOnInit()

		this.formControl.setValidators((control: AbstractControl) => {
			if (control.value !== this.otherFormControl.value) {
				return {confirmpassword: {valid: false}}
			}

			return null
		})
	}

	getErrorMessage() {
		if (this.formControl.hasError('confirmpassword')) {
			return 'Passwords must match'
		}

		return super.getErrorMessage()
	}
}
