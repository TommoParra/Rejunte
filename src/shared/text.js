/**
 * Rich text values arrive as strings or RichTextData depending on the
 * WordPress version; attributes always store the HTML string.
 *
 * @param {string|Object} value RichText value.
 * @return {string} HTML.
 */
export function html( value ) {
	if ( value === undefined || value === null ) {
		return '';
	}
	return typeof value === 'string' ? value : value.toHTMLString?.() ?? String( value );
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#039': "'", '#39': "'" };

/**
 * Plain text of an HTML string, with <br> read as a space. Pure string work so
 * save() stays deterministic.
 *
 * @param {string} value HTML.
 * @return {string} Text.
 */
export function plain( value ) {
	return html( value )
		.replace( /<br\s*\/?>/gi, ' ' )
		.replace( /<[^>]*>/g, '' )
		.replace( /&(#?\w+);/g, ( match, name ) => ENTITIES[ name ] ?? match )
		.replace( /\s+/g, ' ' )
		.trim();
}

/**
 * A stable id fragment from a label: "Torta de crema" → "torta-de-crema".
 *
 * @param {string} value Text or HTML.
 * @return {string} Slug.
 */
export function slug( value ) {
	return plain( value )
		.toLowerCase()
		.normalize( 'NFD' )
		.replace( /[\u0300-\u036f]/g, '' )
		.replace( /[^a-z0-9]+/g, '-' )
		.replace( /^-+|-+$/g, '' );
}

/**
 * "14" → "14 €", "9.5" → "9,50 €": the store's format, Spanish separators,
 * no decimals when the amount is whole.
 *
 * @param {string|number} value Amount.
 * @return {string} Formatted price, or '' when not a number.
 */
export function euros( value ) {
	const amount = Number( String( value ?? '' ).replace( ',', '.' ) );
	if ( '' === String( value ?? '' ).trim() || Number.isNaN( amount ) ) {
		return '';
	}
	const whole = Number.isInteger( amount );
	return `${ amount.toLocaleString( 'es-ES', { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2, useGrouping: amount >= 10000 } ) } €`;
}
