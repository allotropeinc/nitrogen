import { CarbyneBlob }  from 'carbyne-db'
import { db }           from './index'
import { TJSONApiData } from './types'

export async function upgradeToCarbyne ( data : TJSONApiData ) {
	const dataAccounts      = data.accounts,
	      accounts          = {},
	      dataActiveTokens  = data.activeTokens,
	      activeTokens      = {},
	      dataPublishTokens = data.publishTokens,
	      publishTokens     = {},
	      dataStarterCodes  = data.starterCodes,
	      starterCodes      = [],
	      dataBugReports    = data.bugReports,
	      bugReports        = []

	await db.clear ( {} )

	await db.setKey (
		'root',
		'accounts',
		accounts
	)

	const accKeys = Object.keys ( dataAccounts )

	for ( const username of accKeys ) {
		const account = dataAccounts[ username ]

		await db.setKey (
			accounts,
			username,
			account
		)

		for ( const project of account.projects ) {
			await db.setKey (
				project,
				'owner',
				account
			)

			await db.setKey (
				project,
				'code',
				new CarbyneBlob ( Buffer.from ( project.code ) )
			)
		}
	}

	await db.setKey (
		'root',
		'activeTokens',
		activeTokens
	)

	const atKeys = Object.keys ( dataActiveTokens )

	for ( const token of atKeys ) {
		const account = dataAccounts[ dataActiveTokens[ token ] ]

		await db.setKey (
			activeTokens,
			token,
			account
		)
	}

	await db.setKey (
		'root',
		'publishTokens',
		publishTokens
	)

	const ptKeys = Object.keys ( dataPublishTokens )

	for ( const token of ptKeys ) {
		const publishToken = dataPublishTokens[ token ]
		const project = dataAccounts[ publishToken.username ].projects[ publishToken.projectIndex ]

		await db.setKey (
			publishTokens,
			token,
			project
		)
	}

	await db.setKey (
		'root',
		'starterCodes',
		starterCodes
	)

	for ( const starterCode of dataStarterCodes ) {
		await db.push (
			starterCodes,
			starterCode
		)
	}

	await db.setKey (
		'root',
		'bugReports',
		bugReports
	)

	for ( const report of dataBugReports ) {
		await db.push (
			bugReports,
			report
		)

		await db.setKey (
			report,
			'user',
			dataAccounts[ report.username ]
		)

		await db.delKey (
			report,
			'username'
		)
	}
}
