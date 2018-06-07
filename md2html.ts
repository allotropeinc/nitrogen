import { Converter } from 'showdown'

const converter = new Converter ()

converter.setFlavor ( 'github' )

export function md2html ( code : string, title : string ) {
	return '' +
		'<!doctype html>' +
		'<html>' +
			'<head>' +
				'<title>' +
					title +
				'</title>' +
				'<style type="text/css">' +
					'@import url(\'https://fonts.googleapis.com/css?family=Overpass\');' +
					'@import url(\'https://fonts.googleapis.com/css?family=Overpass+Mono&subset=latin-ext\');' +

					'body{' +
						'font-family:Overpass,sans-serif;' +
						'max-width:80ch;' +
						'padding:1em;' +
						'margin:0 auto' +
					'}' +

					'pre{' +
						'font-family:\'Overpass Mono\',monospace' +
					'}' +
				'</style>' +
			'</head>' +
			'<body>' +
				converter.makeHtml ( code ) +
			'</body>' +
		'</html>'
}