import {Component, OnInit}                  from '@angular/core'
import {FormControl, FormGroup, Validators} from '@angular/forms'
import {MatSnackBar}                        from '@angular/material/snack-bar'
import {Router}                             from '@angular/router'
import {ApiService}                         from '../api.service'

@Component({
	selector   : 'app-register',
	templateUrl: './register.component.html',
	styleUrls  : ['./register.component.css']
})
export class RegisterComponent implements OnInit {
	working = false

	username: FormControl
	password: FormControl
	confirmPassword: FormControl
	consent = new FormControl(false, [Validators.requiredTrue])
	formGroup: FormGroup

	constructor(
		private api: ApiService,
		private router: Router,
		private snackbar: MatSnackBar
	) {}

	ngOnInit() {
		this.working = true

		this.api.getTokenValidity().subscribe(
			valid => {
				if (valid) {
					this.router.navigate(['/my-projects'])
				} else {
					this.working = false
					this.initFormGroup()
				}
			}
		)
	}

	initFormGroup() {
		setTimeout(() => {
			this.formGroup = new FormGroup({
				'username'       : this.username,
				'password'       : this.password,
				'confirmPassword': this.confirmPassword,
				'consent'        : this.consent
			})
		}, 0)
	}

	register() {
		if (this.formGroup.invalid) {
			this.snackbar.open(
				'Please complete the form to register'
			)

			return
		}

		this.working = true

		this.api.register(
			this.username.value,
			this.password.value
		).subscribe(
			result => {
				if (!result) {
					this.working = false

					this.snackbar.open(
						'Could not register a new account.'
					)
				} else {
					this.router.navigate(['/signin'])
				}
			})
	}
}
