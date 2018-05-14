import * as express                          from 'express'
import { NextFunction, Request, Response }   from 'express'
import { Api }                               from './api'
import { BugReport, ClientProject, Project } from './types'
import * as path                             from 'path'
import * as bodyParser                       from 'body-parser'
import * as https                            from 'https'
import * as fs                               from 'fs'
import * as net                              from 'net'
import * as http                             from 'http'
import { IncomingMessage, ServerResponse }   from 'http'

const app = express ()

app.use ( bodyParser.json () )

const port   = 5015,
      router = express.Router ()

const noAuthRoutes = [
	'/accounts/auth',
	'/accounts/new',
	'/'
]

router.use (
	(
		req : Request,
		res : Response,
		next : NextFunction
	) => {
		const censored = JSON.parse ( JSON.stringify ( req.body ) )

		if ( censored.hasOwnProperty ( 'password' ) ) {
			censored.password = '[censored]'
		}

		console.log ( req.ip + ': ' + req.method + ' /api' + req.url + ': ' + JSON.stringify ( censored ) )

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
			res.write ( 'Fuck off, CORS Preflight.' )
			res.end ()
		} else {
			const headers = req.headers

			if ( !headers.hasOwnProperty ( 'token' ) ) {
				if ( noAuthRoutes.indexOf ( req.url ) !== -1 ) {
					res.status ( 200 )
					next ()
				} else if ( req.url.startsWith ( '/projects/published/' ) && req.url.length > 20 ) {
					res.status ( 200 )
					next ()
				} else {
					res.json ( null )
				}
			} else {
				Api.validateToken ( <string> headers.token ).then ( () => next () ).catch ( () => res.json ( null ) )
			}
		}
	} )

router.post (
	'/accounts/auth',
	(
		req : Request,
		res : Response
	) => {
		const body = req.body

		if ( body.hasOwnProperty ( 'username' ) && body.hasOwnProperty ( 'password' ) ) {
			Api.authenticate (
				body.username,
				body.password
			).then (
				token => {
					res.json ( token )
				} ).catch ( () => res.json ( null ) )
		} else {
			res.json ( null )
		}
	}
)

router.get (
	'/accounts/check',
	(
		req : Request,
		res : Response
	) => {
		// this is not in the noAuthRoutes list, so the authorization check will automatically return null for us if the token's invalid

		res.json ( true )
	}
)

router.post (
	'/accounts/new',
	(
		req : Request,
		res : Response
	) => {
		const body = req.body

		if ( body.hasOwnProperty ( 'username' ) && body.hasOwnProperty ( 'password' ) ) {
			Api.createAccount (
				body.username,
				body.password
			).then ( () => {
				Api.token ( body.username ).then (
					( token : string ) => {
						res.json ( token )
					} ).catch ( () => res.json ( true ) )
			} ).catch ( () => res.json ( false ) )
		} else {
			res.json ( null )
		}
	}
)

router.post (
	'/accounts/logout',
	(
		req : Request,
		res : Response
	) => {
		Api.getOwner ( <string> req.headers.token ).then (
			( username : string ) => {
				Api.logoutAccount ( username ).then ( res.json.bind ( res ) ).catch ( res.json.bind ( res ) )
			} ).catch ( res.json.bind ( res ) )
	}
)

router.get (
	'/projects',
	(
		req : Request,
		res : Response
	) => {
		Api.getOwner ( <string> req.headers.token ).then (
			( username : string ) => {
				Api.getProjects ( username ).then (
					( projects : Project[] ) => {
						res.json ( projects )
					}
				).catch ( res.json.bind ( res ) )
			} ).catch ( res.json.bind ( res ) )
	}
)

router.post (
	'/projects/new',
	(
		req : Request,
		res : Response
	) => {
		if ( req.body.hasOwnProperty ( 'name' ) ) {
			Api.getOwner ( <string> req.headers.token ).then (
				( username : string ) => {
					Api.newProject (
						username,
						<string> req.body.name
					).then ( () => res.json ( true ) ).catch ( res.json.bind ( res ) )
				} ).catch ( res.json.bind ( res ) )
		} else {
			res.json ( null )
		}
	}
)

router.post (
	'/projects/rename/:id',
	(
		req : Request,
		res : Response
	) => {
		if ( req.body.hasOwnProperty ( 'name' ) ) {
			Api.getOwner ( <string> req.headers.token ).then (
				( username : string ) => {
					Api.renameProject (
						username,
						+req.params.id,
						<string> req.body.name
					).then ( () => res.json ( true ) ).catch ( res.json.bind ( res ) )
				} ).catch ( res.json.bind ( res ) )
		} else {
			res.json ( null )
		}
	}
)

router.post (
	'/projects/delete/:id',
	(
		req : Request,
		res : Response
	) => {
		if ( req.body.hasOwnProperty ( 'name' ) ) {
			Api.getOwner ( <string> req.headers.token ).then (
				( username : string ) => {
					Api.deleteProject (
						username,
						+req.params.id
					).then ( () => res.json ( true ) ).catch ( res.json.bind ( res ) )
				} ).catch ( res.json.bind ( res ) )
		} else {
			res.json ( null )
		}
	}
)

router.get (
	'/projects/:id',
	(
		req : Request,
		res : Response
	) => {
		Api.getOwner ( <string> req.headers.token ).then (
			( username : string ) => {
				Api.getProject (
					username,
					+req.params.id
				).then ( ( project : ClientProject ) => res.json ( project ) ).catch ( res.json.bind ( res ) )
			} ).catch ( () => res.json ( null ) )
	}
)

router.post (
	'/projects/:id',
	(
		req : Request,
		res : Response
	) => {
		if ( req.body.hasOwnProperty ( 'code' ) ) {
			Api.getOwner ( <string> req.headers.token ).then (
				( username : string ) => {
					Api.setProjectCode (
						username,
						+req.params.id,
						req.body.code
					).then ( res.json.bind ( res ) ).catch ( res.json.bind ( res ) )
				} ).catch ( res.json.bind ( res ) )
		} else {
			res.json ( false )
		}
	}
)

router.post (
	'/projects/move/:id',
	(
		req : Request,
		res : Response
	) => {
		if ( req.body.hasOwnProperty ( 'delta' ) ) {
			Api.getOwner ( <string> req.headers.token ).then (
				( username : string ) => {
					Api.moveProject (
						username,
						+req.params.id,
						+req.body.delta
					).then ( res.json.bind ( res ) ).catch ( res.json.bind ( res ) )
				} ).catch ( () => res.json ( false ) )
		} else {
			res.json ( false )
		}
	}
)

router.get (
	'/editorOptions',
	(
		req : Request,
		res : Response
	) => {
		Api.getOwner ( <string> req.headers.token ).then (
			( username : string ) => {
				Api.getEditorOptions (
					username
				).then ( res.json.bind ( res ) ).catch ( res.json.bind ( res ) )
			} ).catch ( res.json.bind ( res ) )
	}
)

router.post (
	'/editorOptions',
	(
		req : Request,
		res : Response
	) => {
		if ( req.body.hasOwnProperty ( 'options' ) ) {
			Api.getOwner ( <string> req.headers.token ).then (
				( username : string ) => {
					Api.setEditorOptions (
						username,
						req.body.options
					).then ( res.json.bind ( res ) ).catch ( res.json.bind ( res ) )
				} ).catch ( () => res.json ( false ) )
		} else {
			res.json ( false )
		}
	}
)

router.post (
	'/editorOptions/reset',
	(
		req : Request,
		res : Response
	) => {
		Api.getOwner ( <string> req.headers.token ).then (
			( username : string ) => {
				Api.resetEditorOptions (
					username
				).then ( res.json.bind ( res ) ).catch ( res.json.bind ( res ) )
			} ).catch ( () => res.json ( false ) )
	}
)

router.post (
	'/accounts/delete',
	(
		req : Request,
		res : Response
	) => {
		const body = req.body

		if ( body.hasOwnProperty ( 'password' ) ) {
			Api.getOwner ( <string> req.headers.token ).then (
				(
					username : string
				) => {
					Api.deleteAccount (
						username,
						body.password
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

router.get (
	'/projects/published/:publishToken',
	(
		req : Request,
		res : Response
	) => {
		res.header (
			'Content-Type',
			'text/html'
		)

		Api.getPublished ( req.params.publishToken ).then ( ( project : Project ) => {
			/* res.json(project.code) */
			res.end (
				project.code,
				'utf8'
			)
		} ).catch ( () => {
			res.end (
				'This project does not exist or has been unpublished. Ask the author for a new link.',
				'utf8'
			)
		} )
	}
)

router.post (
	'/projects/:id/unpublish',
	(
		req : Request,
		res : Response
	) => {
		Api.getOwner ( <string> req.headers.token ).then ( ( username : string ) => {
			Api.unpublish (
				username,
				+req.params.id
			).then ( res.json.bind ( res ) ).catch ( res.json.bind ( res ) )
		} ).catch ( () => res.json ( false ) )
	}
)

router.post (
	'/projects/:id/publish',
	(
		req : Request,
		res : Response
	) => {
		Api.getOwner ( <string> req.headers.token ).then ( ( username : string ) => {
			Api.publish (
				username,
				+req.params.id
			).then ( res.json.bind ( res ) ).catch ( res.json.bind ( res ) )
		} ).catch ( res.json.bind ( res ) )
	}
)

router.post (
	'/bugReport',
	(
		req : Request,
		res : Response
	) => {
		if ( req.body.hasOwnProperty ( 'username' ) && req.body.hasOwnProperty ( 'title' ) && req.body.hasOwnProperty ( 'summary' ) && req.body.hasOwnProperty ( 'steps' ) && req.body.hasOwnProperty ( 'comments' ) ) {
			Api.getOwner ( <string> req.headers.token ).then ( ( username : string ) => {
				req.body.username = username // I don't care what the client says, their token will prove who they are

				Api.submitBugReport (
					username,
					<BugReport> {
						username : req.body.username,
						title    : req.body.title,
						summary  : req.body.summary,
						steps    : req.body.steps,
						comments : req.body.comments,
						read     : false
					}
				).then ( res.json.bind ( res ) ).catch ( res.json.bind ( res ) )
			} )
		} else {
			res.json ( false )
		}
	}
)

router.post (
	'/accounts/changePassword',
	(
		req : Request,
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
	(
		req : Request,
		res : Response
	) => {
		if ( req.body.hasOwnProperty ( 'username' ) && req.body.hasOwnProperty ( 'password' ) ) {
			Api.getOwner ( <string> req.headers.token ).then (
				(
					username : string
				) => {
					Api.changeUsername (
						username,
						req.body.username,
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

router.get (
	'/isAdmin',
	(
		req : Request,
		res : Response
	) => {
		Api.getOwner ( <string> req.headers.token ).then (
			( username : string ) => {
				Api.isAdmin ( username ).then (
					res.json.bind ( res )
				).catch (
					res.json.bind ( res )
				)
			}
		).catch (
			() => res.json ( false )
		)
	}
)

router.get (
	'/accounts',
	(
		req : Request,
		res : Response
	) => {
		Api.getOwner ( <string> req.headers.token ).then (
			( username : string ) => {
				Api.isAdmin ( username ).then (
					() => {
						Api.getAccounts ().then (
							res.json.bind ( res )
						).catch (
							res.json.bind ( res )
						)
					}
				).catch (
					() => res.json ( null )
				)
			}
		).catch (
			res.json.bind ( res )
		)
	}
)

router.get (
	'/accounts/admin/:username',
	(
		req : Request,
		res : Response
	) => {
		Api.getOwner ( <string> req.headers.token ).then (
			( username : string ) => {
				Api.isAdmin ( username ).then (
					() => {
						Api.getAccount (
							req.params.username
						).then (
							res.json.bind ( res )
						).catch (
							res.json.bind ( res )
						)
					}
				).catch (
					() => res.json ( null )
				)
			}
		).catch (
			res.json.bind ( res )
		)
	}
)

router.post (
	'/accounts/admin/:username',
	(
		req : Request,
		res : Response
	) => {
		Api.getOwner ( <string> req.headers.token ).then (
			( username : string ) => {
				Api.isAdmin ( username ).then (
					() => {
						Api.setAccount (
							req.params.username,
							req.body // holy fuck I hope the client knows what it's doing
						).then (
							res.json.bind ( res )
						).catch (
							res.json.bind ( res )
						)
					}
				).catch (
					res.json.bind ( res )
				)
			}
		).catch (
			() => res.json ( false )
		)
	}
)

router.post (
	'/accounts/checkPassword',
	(
		req : Request,
		res : Response
	) => {
		if ( req.body.hasOwnProperty ( 'password' ) ) {
			Api.getOwner ( <string> req.headers.token ).then (
				( username : string ) => {
					Api.validateCredentials (
						username,
						req.body.password
					).then (
						res.json.bind ( res )
					).catch (
						res.json.bind ( res )
					)
				}
			).catch (
				res.json.bind ( res )
			)
		} else {
			res.json ( null )
		}
	}
)

router.get (
	'/bugReports',
	(
		req : Request,
		res : Response
	) => {
		Api.getOwner ( <string> req.headers.token ).then (
			( username : string ) => {
				Api.isAdmin ( username ).then (
					() => {
						Api.getBugReports ().then (
							res.json.bind ( res )
						).catch (
							res.json.bind ( res )
						)
					}
				).catch (
					() => res.json ( null )
				)
			}
		).catch (
			res.json.bind ( res )
		)
	}
)

router.post (
	'/bugReports/:id',
	(
		req : Request,
		res : Response
	) => {
		Api.getOwner ( <string> req.headers.token ).then (
			( username : string ) => {
				Api.isAdmin ( username ).then (
					() => {
						Api.setBugReport (
							req.params.id,
							req.body
						).then (
							res.json.bind ( res )
						).catch (
							res.json.bind ( res )
						)
					}
				).catch (
					res.json.bind ( res )
				)
			}
		).catch (
			() => res.json ( false )
		)
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

	https.createServer (
		{
			key  : fs.readFileSync ( './privatekey.pem' ),
			cert : fs.readFileSync ( './certificate.crt' )
		},
		app
	).listen (
		port + 1,
		'localhost'
	)

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
		port + 2,
		'localhost'
	)
} else {
	app.listen (
		port,
		'0.0.0.0'
	)
}