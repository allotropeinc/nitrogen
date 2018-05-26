import * as express                        from 'express'
import { NextFunction, Request, Response } from 'express'
import { Api }                             from './api'
import { Account, BugReport, Project }     from './types'
import * as path                           from 'path'
import * as https                          from 'https'
import * as fs                             from 'fs'
import * as net                            from 'net'
import * as http                           from 'http'
import { IncomingMessage, ServerResponse } from 'http'
import * as Prism                          from 'prismjs'
import { exec }                            from 'child_process'
import * as crypto                         from 'crypto'

const debug = require ( 'debug' ) (
	'hexazine'
)

debug.enabled = true

async function safeShutdown () {
	debug ( 'shutting down hexazine safely' )
	debug (
		'we have %d server(s) to shutdown',
		servers.length
	)

	for ( let i = 0 ; i < servers.length ; i++ ) {
		await new Promise (
			(
				accept,
				reject
			) => {
				const server = servers[ i ]

				server.close ( accept )
			}
		)
	}

	debug ( 'exiting' )

	process.exit ( 0 )
}

const config = JSON.parse (
	fs.readFileSync (
		'config.json',
		'utf8'
	)
)

debug ( 'Loaded config' )

interface ApiRequest extends Request {
	account? : Account,
	rawBody? : string
}

const app = express ()

const port : number = null, // set to a number if you want to use black magic, else it'll just use 80 (and 443 if certificates are provided)
      router        = express.Router (),
      servers       = []

const noAuthRoutes = [
	'/accounts/auth',
	'/accounts/new',
	'/github'
]

app.use (
	async (
		req : ApiRequest,
		res : Response,
		next : NextFunction
	) => {
		req.rawBody = ''
		req.setEncoding ( 'utf8' )

		req.on (
			'data',
			( chunk : string ) => {
				req.rawBody += chunk
			}
		)

		req.on (
			'end',
			() => {
				try {
					req.body = req.rawBody.length === 0 ? {} : JSON.parse ( req.rawBody )
				} catch ( e ) {
					req.body = {}
				}

				next ()
			}
		)
	}
)

router.use (
	async (
		req : ApiRequest,
		res : Response,
		next : NextFunction
	) => {
		const censored = JSON.parse ( JSON.stringify ( req.body ) )

		if ( censored.hasOwnProperty ( 'password' ) ) {
			censored.password = '[censored]'
		}

		debug (
			'%s: %s /api%s: %O',
			req.ip,
			req.method,
			req.url,
			censored
		)

		res.header (
			'Access-Control-Allow-Origin',
			'*'
		)

		res.header (
			'Access-Control-Allow-Headers',
			'*'
		)

		if ( req.method === 'OPTIONS' ) {
			res.status ( 200 )
			res.end ()
		} else {
			const headers = req.headers

			if ( !headers.hasOwnProperty ( 'token' ) ) {
				if ( noAuthRoutes.indexOf ( req.url ) !== -1 ) {
					next ()
				} else if ( req.url.startsWith ( '/projects/published/' ) && req.url.length > 20 ) {
					next ()
				} else {
					res.json ( null )
				}
			} else {
				const token = <string> headers.token
				const isValid = await Api.validateToken ( token )

				if ( isValid ) {
					const username = await Api.getOwner ( token )

					req.account = await Api.getAccount ( username )

					next ()
				} else {
					res.json ( null )
				}
			}
		}
	}
)

router.post (
	'/accounts/auth',
	async (
		req : ApiRequest,
		res : Response
	) => {
		const body = req.body

		if ( body.hasOwnProperty ( 'username' ) && body.hasOwnProperty ( 'password' ) ) {
			res.json ( await Api.authenticate (
				body.username,
				body.password
			) )
		} else {
			res.json ( null )
		}
	}
)

router.get (
	'/accounts/check',
	async (
		req : ApiRequest,
		res : Response
	) => {
		// this is not in the noAuthRoutes list, so the authorization check will automatically return null for us if the token's invalid

		res.json ( true )
	}
)

router.post (
	'/accounts/new',
	async (
		req : ApiRequest,
		res : Response
	) => {
		const body = req.body

		if ( body.hasOwnProperty ( 'username' ) && body.hasOwnProperty ( 'password' ) ) {
			await Api.createAccount (
				body.username,
				body.password
			)

			const token = res.json ( await Api.token ( body.username ) )

			res.json ( token || true )
		} else {
			res.json ( null )
		}
	}
)

router.post (
	'/accounts/logout',
	async (
		req : ApiRequest,
		res : Response
	) => {
		res.json ( await Api.logoutAccount ( req.account.username ) )
	}
)

router.get (
	'/projects',
	async (
		req : ApiRequest,
		res : Response
	) => {
		res.json ( await Api.getProjects ( req.account.username ) )
	}
)

router.post (
	'/projects/new',
	async (
		req : ApiRequest,
		res : Response
	) => {
		if ( req.body.hasOwnProperty ( 'name' ) ) {
			res.json ( await Api.newProject (
				req.account.username,
				<string> req.body.name
			) )
		} else {
			res.json ( null )
		}
	}
)

router.post (
	'/projects/rename/:id',
	async (
		req : ApiRequest,
		res : Response
	) => {
		if ( req.body.hasOwnProperty ( 'name' ) ) {
			res.json ( await Api.renameProject (
				req.account.username,
				+req.params.id,
				<string> req.body.name
			) )
		} else {
			res.json ( null )
		}
	}
)

router.post (
	'/projects/delete/:id',
	async (
		req : ApiRequest,
		res : Response
	) => {
		if ( req.body.hasOwnProperty ( 'name' ) ) {
			res.json ( await Api.deleteProject (
				req.account.username,
				+req.params.id
			) )
		} else {
			res.json ( null )
		}
	}
)

router.get (
	'/projects/:id',
	async (
		req : ApiRequest,
		res : Response
	) => {
		res.json ( await Api.getProject (
			req.account.username,
			+req.params.id
		) )
	}
)

router.post (
	'/projects/:id',
	async (
		req : ApiRequest,
		res : Response
	) => {
		if ( req.body.hasOwnProperty ( 'code' ) ) {
			res.json ( await Api.setProjectCode (
				req.account.username,
				+req.params.id,
				req.body.code
			) )
		} else {
			res.json ( false )
		}
	}
)

router.post (
	'/projects/move/:id',
	async (
		req : ApiRequest,
		res : Response
	) => {
		if ( req.body.hasOwnProperty ( 'delta' ) ) {
			res.json ( await Api.moveProject (
				req.account.username,
				+req.params.id,
				+req.body.delta
			) )
		} else {
			res.json ( false )
		}
	}
)

router.get (
	'/editorOptions',
	async (
		req : ApiRequest,
		res : Response
	) => {
		res.json ( await Api.getEditorOptions ( req.account.username ) )
	}
)

router.post (
	'/editorOptions',
	async (
		req : ApiRequest,
		res : Response
	) => {
		if ( req.body.hasOwnProperty ( 'options' ) ) {
			res.json ( await Api.setEditorOptions (
				req.account.username,
				req.body.options
			) )
		} else {
			res.json ( false )
		}
	}
)

router.post (
	'/editorOptions/reset',
	async (
		req : ApiRequest,
		res : Response
	) => {
		res.json ( await Api.resetEditorOptions (
			req.account.username
		) )
	}
)

router.post (
	'/accounts/delete',
	async (
		req : ApiRequest,
		res : Response
	) => {
		const body = req.body

		if ( body.hasOwnProperty ( 'password' ) ) {
			res.json ( await Api.deleteAccount (
				req.account.username,
				body.password
			) )
		} else {
			res.json ( false )
		}
	}
)

router.get (
	'/projects/published/:publishToken',
	async (
		req : ApiRequest,
		res : Response
	) => {
		res.header (
			'Content-Type',
			'text/html'
		)

		const project : Project = await Api.getPublished ( req.params.publishToken )

		if ( project ) {
			res.end (
				project.code,
				'utf8'
			)
		} else {
			res.end (
				'This project does not exist or has been unpublished. Ask the author for a new link.',
				'utf8'
			)
		}
	}
)

router.get (
	'/projects/published/:publishToken/source',
	async (
		req : ApiRequest,
		res : Response
	) => {
		res.header (
			'Content-Type',
			'text/html'
		)

		const project : Project = await Api.getPublished ( req.params.publishToken )

		if ( project ) {
			const highlighted = Prism.highlight (
				project.code,
				Prism.languages.html,
				'html'
			)

			res.end (
				'<link rel="stylesheet" type="text/css" href="/assets/prism.css">' + highlighted,
				'utf8'
			)
		} else {
			res.end (
				'This project does not exist or has been unpublished. Ask the author for a new link.',
				'utf8'
			)
		}
	}
)

router.post (
	'/projects/:id/unpublish',
	async (
		req : ApiRequest,
		res : Response
	) => {
		res.json ( await Api.unpublish (
			req.account.username,
			+req.params.id
		) )
	}
)

router.post (
	'/projects/:id/publish',
	async (
		req : ApiRequest,
		res : Response
	) => {
		res.json ( await Api.publish (
			req.account.username,
			+req.params.id
		) )
	}
)

router.post (
	'/bugReport',
	async (
		req : ApiRequest,
		res : Response
	) => {
		if (
			req.body.hasOwnProperty ( 'title' ) &&
			req.body.hasOwnProperty ( 'summary' ) &&
			req.body.hasOwnProperty ( 'steps' ) &&
			req.body.hasOwnProperty ( 'comments' )
		) {
			res.json ( await Api.submitBugReport (
				req.account.username,
				<BugReport> {
					username : req.account.username,
					title    : req.body.title,
					summary  : req.body.summary,
					steps    : req.body.steps,
					comments : req.body.comments,
					read     : false
				}
			) )
		} else {
			res.json ( false )
		}
	}
)

router.post (
	'/accounts/changePassword',
	async (
		req : ApiRequest,
		res : Response
	) => {
		if ( req.body.hasOwnProperty ( 'oldPassword' ) && req.body.hasOwnProperty ( 'password' ) ) {
			Api.getOwner ( <string> req.headers.token ).then (
				(
					username : string
				) => {
					Api.changePassword (
						username,
						req.body.oldPassword,
						req.body.password
					).then (
						res.json.bind ( res )
					).catch (
						res.json.bind ( res )
					)
				}
			).catch (
				() => res.json ( false )
			)
		} else {
			res.json ( false )
		}
	}
)

router.post (
	'/accounts/changeUsername',
	async (
		req : ApiRequest,
		res : Response
	) => {
		if ( req.body.hasOwnProperty ( 'username' ) && req.body.hasOwnProperty ( 'password' ) ) {
			res.json ( await Api.changeUsername (
				req.account.username,
				req.body.username,
				req.body.password
			) )
		} else {
			res.json ( false )
		}
	}
)

router.get (
	'/isAdmin',
	async (
		req : ApiRequest,
		res : Response
	) => {
		res.json ( req.account.isAdmin )
	}
)

router.get (
	'/accounts',
	async (
		req : ApiRequest,
		res : Response
	) => {
		if ( req.account.isAdmin ) {
			res.json ( await Api.getAccounts () )
		} else {
			res.json ( null )
		}
	}
)

router.get (
	'/accounts/admin/:username',
	async (
		req : ApiRequest,
		res : Response
	) => {
		if ( req.account.isAdmin ) {
			res.json ( await Api.getAccount ( req.params.username ) )
		} else {
			res.json ( null )
		}
	}
)

router.post (
	'/accounts/admin/:username',
	async (
		req : ApiRequest,
		res : Response
	) => {
		if ( req.account.isAdmin ) {
			res.json ( await Api.setAccount (
				req.params.username,
				req.body // holy fuck I hope the client knows what it's doing
			) )
		} else {
			res.json ( false )
		}
	}
)

router.post (
	'/accounts/checkPassword',
	async (
		req : ApiRequest,
		res : Response
	) => {
		if ( req.body.hasOwnProperty ( 'password' ) ) {
			res.json ( await Api.validateCredentials (
				req.account.username,
				req.body.password
			) )
		} else {
			res.json ( null )
		}
	}
)

router.get (
	'/bugReports',
	async (
		req : ApiRequest,
		res : Response
	) => {
		if ( req.account.isAdmin ) {
			res.json ( await Api.getBugReports () )
		}
	}
)

router.post (
	'/bugReports/:id',
	async (
		req : ApiRequest,
		res : Response
	) => {
		if ( req.account.isAdmin ) {
			res.json ( await Api.setBugReport (
				req.params.id,
				req.body
			) )
		}
	}
)

function signature ( body ) {
	return crypto.createHmac (
		'sha1',
		config.secret
	).update ( body ).digest ( 'hex' )
}

router.post (
	'/github',
	async (
		req : ApiRequest,
		res : Response
	) => {
		if (
			req.headers.hasOwnProperty ( 'X-GitHub-Event' ) &&
			req.headers.hasOwnProperty ( 'X-GitHub-Delivery' ) &&
			req.headers.hasOwnProperty ( 'X-Hub-Signature' ) &&
			req.headers.hasOwnProperty ( 'User-Agent' )
		) {
			if (
				( <string> req.headers[ 'X-GitHub-Event' ] ) === 'push' &&
				( <string> req.headers[ 'X-Hub-Signature' ] ) === signature ( req.rawBody ) &&
				( <string> req.headers[ 'User-Agent' ] ).startsWith ( 'GitHub-Hookshot/' )
			) {
				exec (
					'git pull',
					async (
						err : Error,
						stdout : string,
						stderr : string
					) => {
						if ( err ) {
							res.status ( 500 )
							res.json ( false )
						} else {
							res.json ( true ) // respond before the server closes

							await safeShutdown ()
						}
					}
				)
			}
		}
	}
)

router.use (
	(
		err : Error,
		req : Request,
		res : Response,
		next : NextFunction
	) => {
		res.json ( err )
	}
)

app.use (
	'/api',
	router
)

process.on (
	'unhandledRejection',
	e => console.log ( e )
)

process.on (
	'SIGINT',
	async () => {
		debug ( 'received SIGINT' )
		await safeShutdown ()
	}
)

app.use ( express.static ( 'app' ) )

app.get (
	'*',
	(
		req : Request,
		res : Response
	) => {
		res.sendFile ( path.resolve (
			__dirname,
			'./app/index.html'
		) )
	}
)

if ( fs.existsSync ( './privatekey.pem' ) && fs.existsSync ( './certificate.crt' ) ) {
	if ( port ) {
		servers.push (
			net.createServer (
				( con ) => {
					con.once (
						'data',
						( buffer ) => {
							// If `buffer` starts with 22, it's a TLS handshake
							const proxyPort = port + ( buffer[ 0 ] === 22 ? 1 : 2 )
							const proxy = net.createConnection (
								proxyPort,
								'localhost',
								() => {
									proxy.write ( buffer )
									con.pipe ( proxy ).pipe ( con )
								}
							)
						}
					)
				}
			).listen (
				port,
				'0.0.0.0'
			)
		)
	}

	servers.push (
		https.createServer (
			{
				key  : fs.readFileSync ( './privatekey.pem' ),
				cert : fs.readFileSync ( './certificate.crt' )
			},
			app
		).listen (
			( port || 442 ) + 1, // fancy way of saying port + 1 or 443
			port ? 'localhost' : '0.0.0.0'
		)
	)

	servers.push (
		http.createServer (
			(
				req : IncomingMessage,
				res : ServerResponse
			) => {
				res.writeHead (
					301,
					{
						Location : 'https://' + req.headers.host + req.url
					}
				)

				res.end ()
			}
		).listen (
			( port || 78 ) + 2, // fancy way of saying port + 2 or 80
			port ? 'localhost' : '0.0.0.0'
		)
	)
} else {
	servers.push (
		app.listen (
			port || 80,
			'0.0.0.0'
		)
	)
}