/**
 * CSS custom properties for the bento's effects. Only values that differ from
 * the stylesheet's defaults are written, so a default block saves no inline style.
 *
 * @param {Object} attributes Block attributes.
 * @return {Object|undefined} Style object.
 */
export function bentoStyle( attributes ) {
	const { glowColor, spotlightRadius, enableSpotlight, enableBorderGlow, enableTilt, enableMagnetism } = attributes;
	const style = {};
	if ( glowColor && '160 18 43' !== glowColor ) {
		style[ '--glow' ] = glowColor;
	}
	if ( 300 !== spotlightRadius ) {
		style[ '--spot' ] = `${ spotlightRadius }px`;
	}
	if ( ! enableSpotlight ) {
		style[ '--spotlight-on' ] = 0;
	}
	if ( ! enableBorderGlow ) {
		style[ '--border-glow-on' ] = 0;
	}
	if ( ! enableTilt ) {
		style[ '--tilt-on' ] = 0;
	}
	if ( ! enableMagnetism ) {
		style[ '--magnet-on' ] = 0;
	}
	return Object.keys( style ).length ? style : undefined;
}
