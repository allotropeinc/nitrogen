export interface Project {
	id : number
	name : string
	code : string
	publishToken? : string
	/**
	 * 0: HTML
	 * 1: Markdown
	 */
	type : number
}
