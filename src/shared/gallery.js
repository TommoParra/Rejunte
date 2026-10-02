/**
 * "La tanda" curved gallery — the motion, shared by the site and the editor.
 *
 * Ported from the prototype's RejunteGallery (itself an adaptation of nxui's
 * Circular Gallery): items ride a curved path with distance-based scaling and
 * eased momentum, driven by drag, horizontal wheel, arrow keys and buttons, as
 * CSS transforms over real DOM. The vertical wheel is deliberately left alone so
 * the page always scrolls.
 */

export const SPACING = 292;

/**
 * Signed distance of an item from the centre, wrapped so the strip loops.
 *
 * @param {number} index  Item index.
 * @param {number} offset Current offset.
 * @param {number} count  Item count.
 * @return {number} Distance.
 */
export function distance( index, offset, count ) {
	const half = count / 2;
	let d = index - offset;
	while ( d > half ) {
		d -= count;
	}
	while ( d < -half ) {
		d += count;
	}
	return d;
}

/**
 * Inline style for an item at a given distance. Also used by save() to render
 * the resting state, so the gallery looks finished before any script runs.
 *
 * @param {number} d    Signed distance from centre.
 * @param {number} bend Curvature.
 * @return {Object} Style object.
 */
export function placement( d, bend ) {
	const near = Math.abs( d );
	return {
		transform: `translate3d(${ ( d * SPACING ).toFixed( 2 ) }px, ${ ( bend * d * d * 9 ).toFixed( 2 ) }px, 0) rotate(${ ( d * -4.2 ).toFixed( 2 ) }deg) scale(${ Math.max( 0.55, 1 - near * 0.11 ).toFixed( 3 ) })`,
		zIndex: String( Math.max( 0, 40 - Math.round( near * 10 ) ) ),
		opacity: String( near > 2.6 ? 0 : 1 ),
		visibility: near > 2.9 ? 'hidden' : 'visible',
	};
}

/**
 * Attach the motion to a rendered gallery.
 *
 * @param {HTMLElement} root                  The .rj-gallery element.
 * @param {Object}      options
 * @param {number}      [options.bend]        Curvature.
 * @param {number}      [options.scrollSpeed] Drag/wheel multiplier.
 * @param {number}      [options.scrollEase]  Easing per frame.
 * @param {Function}    [options.onActive]    Called with (index, item) when the centred item changes.
 * @return {{ step: Function, refresh: Function, destroy: Function }} Controller.
 */
export function createGallery( root, { bend = 2.2, scrollSpeed = 1, scrollEase = 0.085, onActive } = {} ) {
	const stage = root.querySelector( '.rj-gallery__stage' );
	const reduced = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

	let offset = 0;
	let target = 0;
	let dragging = false;
	let frame = 0;
	let pointerId = null;
	let dragStartX = 0;
	let dragStartOffset = 0;
	let active = -1;

	const items = () => [ ...root.querySelectorAll( '.rj-gallery__item' ) ];

	function render() {
		const list = items();
		const count = list.length;
		if ( ! count ) {
			return;
		}
		list.forEach( ( item, index ) => Object.assign( item.style, placement( distance( index, offset, count ), bend ) ) );

		const current = ( ( Math.round( offset ) % count ) + count ) % count;
		list.forEach( ( item, index ) => {
			if ( index === current ) {
				item.setAttribute( 'aria-current', 'true' );
			} else {
				item.removeAttribute( 'aria-current' );
			}
		} );
		if ( current !== active ) {
			active = current;
			onActive?.( current, list[ current ] );
		}
	}

	// The loop only runs while there is movement left to render.
	function tick() {
		const delta = target - offset;
		if ( Math.abs( delta ) < 0.0005 ) {
			offset = target;
			render();
			if ( ! dragging ) {
				frame = 0;
				return;
			}
		} else {
			offset += reduced ? delta : delta * scrollEase;
			render();
		}
		frame = window.requestAnimationFrame( tick );
	}

	function ensureLoop() {
		if ( ! frame ) {
			frame = window.requestAnimationFrame( tick );
		}
	}

	function step( by ) {
		target += by;
		ensureLoop();
	}

	function onPointerDown( event ) {
		if ( event.button !== 0 || event.target.closest( 'button, [contenteditable="true"]' ) ) {
			return;
		}
		pointerId = event.pointerId;
		dragging = true;
		dragStartX = event.clientX;
		dragStartOffset = target;
		stage.dataset.dragging = 'true';
		stage.setPointerCapture( event.pointerId );
		ensureLoop();
	}

	function onPointerMove( event ) {
		if ( ! dragging || event.pointerId !== pointerId ) {
			return;
		}
		target = dragStartOffset - ( ( event.clientX - dragStartX ) / SPACING ) * scrollSpeed;
		ensureLoop();
	}

	function onPointerUp( event ) {
		if ( event.pointerId !== pointerId ) {
			return;
		}
		dragging = false;
		pointerId = null;
		stage.dataset.dragging = 'false';
		target = Math.round( target );
		ensureLoop();
	}

	// Horizontal intent only: the page must keep its vertical scroll.
	function onWheel( event ) {
		if ( Math.abs( event.deltaX ) <= Math.abs( event.deltaY ) ) {
			return;
		}
		event.preventDefault();
		target += ( event.deltaX / SPACING ) * scrollSpeed;
		ensureLoop();
	}

	function onKeydown( event ) {
		if ( event.target !== stage ) {
			return;
		}
		if ( event.key === 'ArrowLeft' ) {
			event.preventDefault();
			event.stopPropagation();
			step( -1 );
		} else if ( event.key === 'ArrowRight' ) {
			event.preventDefault();
			event.stopPropagation();
			step( 1 );
		}
	}

	stage.addEventListener( 'pointerdown', onPointerDown );
	stage.addEventListener( 'pointermove', onPointerMove );
	stage.addEventListener( 'pointerup', onPointerUp );
	stage.addEventListener( 'pointercancel', onPointerUp );
	stage.addEventListener( 'wheel', onWheel, { passive: false } );
	stage.addEventListener( 'keydown', onKeydown );

	render();

	return {
		step,
		/**
		 * Re-render after items were added, removed or reordered, optionally
		 * centring a given index.
		 *
		 * @param {number} [index] Item to centre.
		 */
		refresh( index ) {
			if ( typeof index === 'number' ) {
				offset = index;
				target = index;
			}
			active = -1;
			render();
		},
		destroy() {
			window.cancelAnimationFrame( frame );
			frame = 0;
			stage.removeEventListener( 'pointerdown', onPointerDown );
			stage.removeEventListener( 'pointermove', onPointerMove );
			stage.removeEventListener( 'pointerup', onPointerUp );
			stage.removeEventListener( 'pointercancel', onPointerUp );
			stage.removeEventListener( 'wheel', onWheel );
			stage.removeEventListener( 'keydown', onKeydown );
		},
	};
}
