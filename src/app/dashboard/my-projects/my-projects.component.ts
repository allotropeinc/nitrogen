import {Component}      from '@angular/core'
import {ActivatedRoute} from '@angular/router'
import {Project}        from '../../../../backend/src/types/database'

@Component({
	selector   : 'app-my-projects',
	templateUrl: './my-projects.component.html',
	styleUrls  : ['./my-projects.component.css']
})
export class MyProjectsComponent {
	projects: Project[]

	constructor(route: ActivatedRoute) {
		this.projects = route.snapshot.data.projects
	}
}
