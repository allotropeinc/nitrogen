import { Component, OnInit }       from '@angular/core'
import { ApiService }              from '../api.service'
import { Router }                  from '@angular/router'
import { MatSnackBar }             from '@angular/material'
import { FormControl, Validators } from '@angular/forms'
import { usernamePattern }         from '../../../backend/types'

@Component ( {
	selector    : 'app-register',
	templateUrl : './register.component.html',
	styleUrls   : [ './register.component.css' ]
} )
export class RegisterComponent implements OnInit {
	username = new FormControl (
		'',
		[
			Validators.max ( 16 ),
			Validators.required,
			Validators.pattern ( usernamePattern )
		]
	)
	password = ''
	confirmPassword = ''
	working = false
	showPassword = false
	showPasswordConfirm = false
	consent = false

	constructor (
		private api : ApiService,
		private router : Router,
		private snackbar : MatSnackBar
	) {}

	ngOnInit () {
		this.working = true

		this.api.getTokenValidity ().subscribe (
			valid => {
				if ( valid ) {
					this.router.navigate ( [ '/dashboard' ] )
				} else {
					this.working = false
				}
			}
		)
	}

	register () {
		if ( this.consent ) {
			if ( !this.username.invalid ) {
				if ( this.password === this.confirmPassword ) {
					this.working = true

					this.api.register (
						<string> this.username.value,
						this.password
					).subscribe (
						result => {
							if ( !result ) {
								this.working = false

								this.snackbar.open (
									'Could not register a new account.',
									'Close'
								)
							} else {
								this.router.navigate ( [ '/signin' ] )
							}
						} )
				} else {
					this.snackbar.open (
						'Passwords do not match',
						'Close'
					)
				}
			} else {
				this.snackbar.open (
					'Invalid username.',
					'Close'
				)
			}
		} else {
			this.snackbar.open (
				'Please agree to our privacy policy and ToS',
				'Close'
			)
		}
	}

	getErrorMessage () {
		if ( this.username.value.length > 16 ) {
			return 'Usernames can be up to 16 characters long'
		} else if ( this.username.hasError ( 'required' ) ) {
			return 'This field is required'
		} else if ( this.username.hasError ( 'pattern' ) ) {
			return 'Letters and numbers only, no spaces'
		}
	}
}
