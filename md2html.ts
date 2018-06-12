import { Converter }                           from 'showdown'
import * as Prism                              from 'prismjs'
import * as loadLanguages                      from 'prismjs/components/index'
import { Cheerio, CheerioAPI, CheerioElement } from './cheerio'
import * as splitHtml                          from './splitHtml'

loadLanguages ()

declare var require : any

let cheerio : CheerioAPI

if ( typeof window !== 'undefined' ) {
	cheerio = ( <any> window ).cheerio // already browserified
} else {
	cheerio = eval('require(\'cheerio\');'); // needed to avoid Webpack trying to convert `cheerio` to a browser module
}

const converter = new Converter ()

converter.setFlavor ( 'github' )

export function _md2html ( code : string ) {
	return converter.makeHtml ( code )
}

export function _highlight (
	code : string,
	language : string
) {
	if ( Prism.languages.hasOwnProperty ( language ) ) {
		return Prism.highlight (
			code,
			Prism.languages[ language ],
			language
		)
	} else {
		return code
	}
}

export function _post ( code : string ) {
	const $ = cheerio.load ( code )

	$ ( 'pre > code' ).each (
		(
			index : number,
			elem : CheerioElement | Cheerio
		) => {
			elem = $ ( elem )

			let language

			try {
				language = elem.attr ( 'class' ).split ( ' ' )[ 0 ]

				if ( language === 'html' ) {
					language = 'markup'
				}
			} catch {}

			const lines = ( <string[]> splitHtml (
				_highlight (
					elem.text (),
					language
				).replace (
					/\n/g,
					'<div class="split"></div>'
				),
				'div.split'
			) ).filter (
				(
					_,
					i
				) => {
					return i % 2 === 0
				}
			)

			elem.text ( '' )

			const table = $ ( '<table>' ).appendTo ( elem )

			for ( let i = 0 ; i < lines.length ; i++ ) {
				table.append (
					$ ( '<tr>' ).append (
						$ ( '<td class="line-num">' ).text ( ( i + 1 ).toString () )
					).append (
						$ ( '<td class="line">' ).html ( lines[ i ] )
					)
				)
			}
		}
	)

	return $.html ()
}

export function md2html (
	code : string,
	title : string,
	dark : boolean = false
) {
	// Preserve indentation
	// @formatter:off
	return _post (
		'<!doctype html>' +
		'<html>' +
			'<head>' +
				'<title>' +
					title +
				'</title>' +
				'<link rel="stylesheet" href="https://necolas.github.io/normalize.css/8.0.0/normalize.css">' +
				'<style type="text/css">' +
					'@import url(\'https://fonts.googleapis.com/css?family=Overpass\');' +
					'@import url(\'https://fonts.googleapis.com/css?family=Overpass+Mono&subset=latin-ext\');' +

					'body{' +
						'font-family:Overpass,sans-serif;' +
						'max-width:80ch;' +
						'padding:1em;' +
						'line-height:1.5;' +
						'margin:0 auto;' +
						'-webkit-font-smoothing:antialiased;' +
						'-moz-osx-font-smoothing:antialiased;' +
					( dark ?
						'background-color:#212121;' +
						'color:rgba(255,255,255,0.87)' :

						// light

						'background-color:#ffffff;' +
						'color:rgba(0,0,0,0.87)'
					) +
					'}' +

					'pre{' +
						'font-family:\'Overpass Mono\',monospace;' +
						'display:block;' +
						'padding:1em;' +
						`background-color:#${ dark ? '282828' : 'fafafa' };` +
						'border-radius:0.5em;' +
						'overflow:hidden;' +
						'white-space:pre-wrap' +
					'}' +

					'pre table{' +
						'max-width:100%' +
					'}' +

					'pre td{' +
						'padding:0' +
					'}' +

					'pre .line-num{' +
						'opacity:0.25;' +
						'padding-right:1em;' +
						'vertical-align:top;' +
						'text-align:right' +
					'}' +

					'pre {' +
						`color:${ dark ? '#ccc' : '#000' };` +
						`background:${ dark ? '#2d2d2d' : '#f5f2f0' };` +

						'-moz-tab-size:4;' +
						'-o-tab-size:4;' +
						'tab-size:4;' +

						'-webkit-hyphens:none;' +
						'-moz-hyphens:none;' +
						'-ms-hyphens:none;' +
						'hyphens:none' +
					'}' +

				( dark ?
					'.token.comment,' +
					'.token.block-comment,' +
					'.token.prolog,' +
					'.token.doctype,' +
					'.token.cdata {' +
						'color:#999' +
					'}' +

					'.token.punctuation {' +
						'color:#ccc' +
					'}' +

					'.token.tag,' +
					'.token.attr-name,' +
					'.token.namespace,' +
					'.token.deleted {' +
						'color:#e2777a' +
					'}' +

					'.token.function-name {' +
						'color:#6196cc' +
					'}' +

					'.token.boolean,' +
					'.token.number,' +
					'.token.function {' +
						'color:#f08d49' +
					'}' +

					'.token.property,' +
					'.token.class-name,' +
					'.token.constant,' +
					'.token.symbol {' +
						'color:#f8c555' +
					'}' +

					'.token.selector,' +
					'.token.important,' +
					'.token.atrule,' +
					'.token.keyword,' +
					'.token.builtin {' +
						'color:#cc99cd' +
					'}' +

					'.token.string,' +
					'.token.char,' +
					'.token.attr-value,' +
					'.token.regex,' +
					'.token.variable {' +
						'color:#7ec699' +
					'}' +

					'.token.operator,' +
					'.token.entity,' +
					'.token.url {' +
						'color:#67cdcc' +
					'}' +

					'.token.important,' +
					'.token.bold {' +
						'font-weight:bold' +
					'}' +

					'.token.italic {' +
						'font-style:italic' +
					'}' +

					'.token.entity {' +
						'cursor:help' +
					'}' +

					'.token.inserted {' +
						'color:green' +
					'}' :

					// light

					'.token.comment,' +
					'.token.prolog,' +
					'.token.doctype,' +
					'.token.cdata {' +
						'color: slategray' +
					'}' +

					'.token.punctuation {' +
						'color: #999' +
					'}' +

					'.namespace {' +
						'opacity: .7' +
					'}' +

					'.token.property,' +
					'.token.tag,' +
					'.token.boolean,' +
					'.token.number,' +
					'.token.constant,' +
					'.token.symbol,' +
					'.token.deleted {' +
						'color: #905' +
					'}' +

					'.token.selector,' +
					'.token.attr-name,' +
					'.token.string,' +
					'.token.char,' +
					'.token.builtin,' +
					'.token.inserted {' +
						'color: #690' +
					'}' +

					'.token.operator,' +
					'.token.entity,' +
					'.token.url,' +
					'.language-css .token.string,' +
					'.style .token.string {' +
						'color: #9a6e3a;' +
						'background: rgba(255,255,255,0.5)' +
					'}' +

					'.token.atrule,' +
					'.token.attr-value,' +
					'.token.keyword {' +
						'color: #07a' +
					'}' +

					'.token.function,' +
					'.token.class-name {' +
						'color: #DD4A68' +
					'}' +

					'.token.regex,' +
					'.token.important,' +
					'.token.variable {' +
						'color: #e90' +
					'}' +

					'.token.important,' +
					'.token.bold {' +
						'font-weight: bold' +
					'}' +
					'.token.italic {' +
						'font-style: italic' +
					'}' +

					'.token.entity {' +
						'cursor: help' +
					'}'
				) +
				'</style>' +
			'</head>' +
			'<body>' +
				_md2html ( code ) +
			'</body>' +
		'</html>'
	)
	// @formatter:on
}