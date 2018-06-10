import { Converter } from 'showdown'

const converter = new Converter ()

converter.setFlavor ( 'github' )

export function _md2html ( code : string ) {
	return converter.makeHtml ( code )
}

export function md2html (
	code : string,
	title : string,
	dark : boolean = false
) {
	// Preserve indentation
	// @formatter:off
	return '' +
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
						`margin:0 auto${ dark ? ';' : '' }` +
					(dark ?
						'background-color:#212121;' +
						'color:rgba(255,255,255,0.87)' : '') +
					'}' +

					'pre{' +
						'font-family:\'Overpass Mono\',monospace;' +
						'display:block;' +
						'padding:1em;' +
						`background-color:#${ dark ? '282828' : 'fafafa' };` +
						'border-radius:0.5em' +
					'}' +

					'body.dark{' +
						'background-color:#212121;' +
						'color:rgba(255,255,255,0.87)' +
					'}' +

					'body.dark pre{' +
						'background-color:#282828' +
					'}' +
				'</style>' +
			'</head>' +
			'<body>' +
				_md2html ( code ) +
			'</body>' +
		'</html>'
	// @formatter:on
}