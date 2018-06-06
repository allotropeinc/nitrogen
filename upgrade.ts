// A script used by `api.ts` to update the structure of `data.json` to support adding new features or changing existing ones.
// Uses the `version` property to determine what upgrades to apply.

import { ApiData, Upgrades } from './types'
import { safeShutdown }      from './index'

const debug = require ( 'debug' ) (
	'hexazine:upgrade'
)

debug.enabled = true

const allUpgrades : Upgrades = [
	async ( data ) => {
		for ( const accKey of Object.keys ( data.accounts ) ) {
			const acc = data.accounts[ accKey ]

			for ( const proj of acc.projects ) {
				proj.type = 0
			}
		}
	}
]

export async function upgradeData ( data : ApiData ) {
	debug ( 'upgrading data' )

	if ( !data.version ) {
		data.version = 0
	}

	if ( data.version === allUpgrades.length ) {
		debug (
			'version is %d (latest, not upgrading)',
			data.version
		)

		return false
	} else if ( data.version > allUpgrades.length ) {
		debug (
			'version is %d (NEWER THAN THIS HEXAZINE)',
			data.version
		)
		debug ( 'this is a fatal error, hexazine will be shut down to prevent corruption of data' )

		await safeShutdown ()

		return false
	}

	debug (
		'version is %d, will be upgraded to %d',
		data.version,
		allUpgrades.length
	)

	const upgrades = allUpgrades.slice ( data.version )

	for ( const upgrade of upgrades ) {
		await upgrade ( data )
	}

	data.version = allUpgrades.length

	debug (
		'data has been upgraded to version %d',
		data.version
	)

	return true
}