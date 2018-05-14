import { Component, OnInit } from '@angular/core'
import { ApiService }        from '../api.service'
import { Router }            from '@angular/router'
import { MatSnackBar }       from '@angular/material'

@Component ( {
	selector : 'app-register',
	templateUrl : './register.component.html',
	styleUrls : [ './register.component.css' ]
} )
export class RegisterComponent implements OnInit {
	username : string
	password : string
	confirmPassword : string
	working = false
	showPassword = false
	showPasswordConfirm = false

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
			} )
	}

	register () {
		if ( this.password === this.confirmPassword ) {
			this.working = true

			this.api.register (
				this.username,
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
				'Passwords do not match.',
				'Close'
			)
		}
	}

}
