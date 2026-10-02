/**
 * Values both edit() and save() derive from the tile's attributes.
 */

/**
 * @param {string} span '' | '2x1' | '2x2'.
 * @return {{ ratio: string, sizes: string }} Image slot settings for the span.
 */
export function imageSlot( span ) {
	if ( '2x2' === span || '2x1' === span ) {
		return { ratio: '2x1' === span ? '2 / 1' : '1 / 1', sizes: '(max-width: 62rem) 100vw, 50vw' };
	}
	return { ratio: '1 / 1', sizes: '(max-width: 34rem) 100vw, (max-width: 62rem) 50vw, 25vw' };
}

/**
 * Word tiles get the red spotlight, the others a white one.
 *
 * @param {string} variant Tile variant.
 * @return {string} Glow class.
 */
export function glowClass( variant ) {
	return `rj-tile__glow rj-tile__glow--${ 'word' === variant ? 'red' : 'light' }`;
}
