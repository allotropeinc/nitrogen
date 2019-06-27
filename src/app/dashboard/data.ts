import {Route}                                   from '@angular/router'
import {CustomDomainsComponent}                  from './custom-domains/custom-domains.component'
import {EmailCredentialComponent}                from './my-account/email-credential/email-credential.component'
import {ManageEmailConfirmRevokeDialogComponent} from './my-account/manage-email-dialog/confirm-revoke-dialog/manage-email-confirm-revoke-dialog.component'
import {ManageEmailDialogComponent}              from './my-account/manage-email-dialog/manage-email-dialog.component'
import {MyAccountComponent}                      from './my-account/my-account.component'
import {MyAccountResolver}                       from './my-account/resolver.service'
import {MyProjectsComponent}                     from './my-projects/my-projects.component'
import {MyProjectsResolver}                      from './my-projects/resolver.service'
import {PreferencesComponent}                    from './preferences/preferences.component'
import {SharedProjectsComponent}                 from './shared-projects/shared-projects.component'

export namespace DashboardData {
	export interface ComponentData {
		title: string
		id: string
		icon: string
		route: Route
		components: any[],
		providers: any[]
		entries: any[]
	}

	export interface SidebarGroup {
		name: string
		path: string
		components: ComponentData[]
	}

	export type SidebarData = SidebarGroup[]

	export const sidebarData: SidebarData = [
		{
			name      : 'Projects',
			path      : 'projects',
			components: [
				{
					title     : 'My Projects',
					id        : 'my-projects',
					icon      : 'code',
					route     : {
						path     : '',
						pathMatch: 'full',
						component: MyProjectsComponent,
						resolve  : {
							projects: MyProjectsResolver
						}
					},
					components: [],
					providers : [MyProjectsResolver],
					entries   : []
				},
				{
					title     : 'Shared Projects',
					id        : 'shared-projects',
					icon      : 'share',
					route     : {
						path     : 'shared-projects',
						component: SharedProjectsComponent
					},
					components: [],
					providers : [],
					entries   : []
				}
			]
		},
		{
			name      : 'Account',
			path      : 'account',
			components: [
				{
					title     : 'My Account',
					id        : 'my-account',
					icon      : 'account_circle',
					route     : {
						path     : '',
						pathMatch: 'full',
						component: MyAccountComponent,
						resolve  : {
							emailStatus: MyAccountResolver
						}
					},
					components: [
						ManageEmailDialogComponent,
						ManageEmailConfirmRevokeDialogComponent,
						EmailCredentialComponent
					],
					providers : [
						ManageEmailDialogComponent,
						ManageEmailConfirmRevokeDialogComponent,
						MyAccountResolver
					],
					entries   : [
						ManageEmailDialogComponent,
						ManageEmailConfirmRevokeDialogComponent
					]
				},
				{
					title     : 'Preferences',
					id        : 'preferences',
					icon      : 'settings',
					route     : {
						path     : 'preferences',
						component: PreferencesComponent
					},
					components: [],
					providers : [],
					entries   : []
				}
			]
		},
		{
			name      : 'Hosting',
			path      : 'hosting',
			components: [
				{
					title     : 'Custom Domains',
					id        : 'custom-domains',
					icon      : 'dns',
					route     : {
						path     : 'custom-domains',
						component: CustomDomainsComponent
					},
					components: [],
					providers : [],
					entries   : []
				}
			]
		}
	]

	export const componentsData: ComponentData[] =
		             [].concat(...sidebarData.map(g => g.components))

	export const componentDataLookup: {[groupPath: string]: {[componentPath: string]: ComponentData}} = {}

	for (const groupData of sidebarData) {
		const groupLookup = {}

		for (const componentData of groupData.components) {
			groupLookup[componentData.route.path] = componentData
		}

		componentDataLookup[groupData.path] = groupLookup
	}
}
