import {Component, OnInit}      from '@angular/core'
import {FormControl, FormGroup} from '@angular/forms'
import {Router}                 from '@angular/router'
import {ApiService}             from '../api.service'

@Component({
	selector   : 'app-signin',
	templateUrl: './signin.component.html',
	styleUrls  : ['./signin.component.css']
})
export class SigninComponent implements OnInit {
	working = false
	error = false

	username = new FormControl('')
	password: FormControl
	formGroup: FormGroup

	constructor(
		private api: ApiService,
		private router: Router
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
			})
	}

	initFormGroup() {
		setTimeout(() => {
			this.formGroup = new FormGroup({
				username: this.username,
				password: this.password
			})
		}, 0)
	}

	signIn() {
		this.working = true

		this.api.authenticate(
			this.username.value,
			this.password.value
		).subscribe(
			result => {
				if (!result) {
					this.working = false
					this.error = true
				} else {
					this.router.navigate(['/my-projects'])
				}
			})
	}
}
