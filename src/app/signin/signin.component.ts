import { Component, OnInit }                    from '@angular/core'
import { ApiService }                           from '../api.service'
import { Router }                               from '@angular/router'
import { MatDialog, MatDialogRef, MatSnackBar } from '@angular/material'
import { DeleteProjectDialogComponent }         from '../dashboard/projects/project-item/project-item.component'

@Component ( {
	selector    : 'app-signin',
	templateUrl : './signin.component.html',
	styleUrls   : [ './signin.component.css' ]
} )
export class SigninComponent implements OnInit {
	username : string
	password : string
	showPassword = false
	working = false
	error = false

	constructor (
		private api : ApiService,
		private router : Router,
		private snackbar : MatSnackBar,
		private dialog : MatDialog
	) {
	}

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

	signIn () {
		this.working = true

		this.api.authenticate (
			this.username,
			this.password
		).subscribe (
			result => {
				if ( !result ) {
					this.working = false
					this.error = true
				} else {
					this.router.navigate ( [ '/dashboard' ] )
				}
			} )
	}
}
