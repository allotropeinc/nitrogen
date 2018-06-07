import { Converter } from 'showdown'

const converter = new Converter ()

converter.setFlavor ( 'github' )

export function md2html ( code : string ) {
	return '<!doctype html>' +
		'<html>' +
		'<head>' +
		'<title>Markdown</title>' +
		'<link rel="stylesheet" type="text/css" href="/assets/md.css">' +
		'</head>' +
		'<body>' +
		converter.makeHtml ( code ) +
		'</body>' +
		'</html>'
}