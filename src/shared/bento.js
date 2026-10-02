/**
 * "La vitrina" bento — cursor spotlight, proximity border glow, tilt,
 * magnetism and click ripple. Ported from the prototype's RejunteBento (an
 * adaptation of nxui's Magic Bento).
 *
 * Only enhances on devices with a fine pointer and no reduced-motion
 * preference; everyone else gets the plain grid, which is also exactly how the
 * grid looks at rest.
 */

/**
 * @param {HTMLElement} root The .rj-bento element.
 * @return {Function|undefined} Cleanup, or undefined when not enhanced.
 */
export function createBento( root ) {
	if ( window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches ) {
		return undefined;
	}
	if ( ! window.matchMedia( '(hover: hover) and (pointer: fine)' ).matches ) {
		return undefined;
	}
	root.dataset.enhanced = 'true';

	const cards = () => [ ...root.querySelectorAll( '[data-bento-card]' ) ];
	let frame = 0;
	let last = null;

	// Pointer moves arrive faster than frames; measure and write once per frame.
	function apply() {
		frame = 0;
		const event = last;
		for ( const card of cards() ) {
			const rect = card.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;
			const cx = rect.left + rect.width / 2;
			const cy = rect.top + rect.height / 2;
			const near = Math.max( 0, 1 - Math.hypot( event.clientX - cx, event.clientY - cy ) / 520 );
			const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
			const tiltX = inside ? ( ( y - rect.height / 2 ) / rect.height ) * -7 : 0;
			const tiltY = inside ? ( ( x - rect.width / 2 ) / rect.width ) * 7 : 0;
			const pull = inside ? 5 : 0;

			card.style.setProperty( '--mx', `${ ( x / rect.width ) * 100 }%` );
			card.style.setProperty( '--my', `${ ( y / rect.height ) * 100 }%` );
			card.style.setProperty( '--near', near.toFixed( 3 ) );
			card.style.setProperty( '--tilt-x', `${ tiltX.toFixed( 2 ) }deg` );
			card.style.setProperty( '--tilt-y', `${ tiltY.toFixed( 2 ) }deg` );
			card.style.setProperty( '--mag-x', `${ ( inside ? ( ( x - rect.width / 2 ) / rect.width ) * pull : 0 ).toFixed( 2 ) }px` );
			card.style.setProperty( '--mag-y', `${ ( inside ? ( ( y - rect.height / 2 ) / rect.height ) * pull : 0 ).toFixed( 2 ) }px` );
		}
	}

	const onMove = ( event ) => {
		last = event;
		if ( ! frame ) {
			frame = window.requestAnimationFrame( apply );
		}
	};

	const onLeave = () => {
		window.cancelAnimationFrame( frame );
		frame = 0;
		for ( const card of cards() ) {
			card.style.setProperty( '--near', '0' );
			card.style.setProperty( '--tilt-x', '0deg' );
			card.style.setProperty( '--tilt-y', '0deg' );
			card.style.setProperty( '--mag-x', '0px' );
			card.style.setProperty( '--mag-y', '0px' );
		}
	};

	const onDown = ( event ) => {
		const card = event.target.closest( '[data-bento-card]' );
		if ( ! card ) {
			return;
		}
		const rect = card.getBoundingClientRect();
		const ripple = document.createElement( 'span' );
		ripple.className = 'rj-bento__ripple';
		ripple.style.left = `${ event.clientX - rect.left }px`;
		ripple.style.top = `${ event.clientY - rect.top }px`;
		card.append( ripple );
		window.setTimeout( () => ripple.remove(), 620 );
	};

	root.addEventListener( 'pointermove', onMove );
	root.addEventListener( 'pointerleave', onLeave );
	if ( root.dataset.click !== 'false' ) {
		root.addEventListener( 'pointerdown', onDown );
	}

	return () => {
		window.cancelAnimationFrame( frame );
		root.removeEventListener( 'pointermove', onMove );
		root.removeEventListener( 'pointerleave', onLeave );
		root.removeEventListener( 'pointerdown', onDown );
		root.dataset.enhanced = 'false';
	};
}
