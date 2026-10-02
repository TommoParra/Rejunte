/**
 * Product page: quantity stepper, photo switcher and in-place add to order.
 */
import { initOrderButtons } from '../../shared/order-buttons';

initOrderButtons();

for ( const product of document.querySelectorAll( '.rj-product' ) ) {
	// Stepper: the number field works on its own; the buttons nudge it.
	const field = product.querySelector( '.rj-qty__input' );
	for ( const step of product.querySelectorAll( '.rj-qty__step' ) ) {
		step.addEventListener( 'click', () => {
			const min = Number( field.min ) || 1;
			const max = Number( field.max ) || Infinity;
			const next = ( parseInt( field.value, 10 ) || min ) + Number( step.dataset.step );
			field.value = String( Math.min( max, Math.max( min, next ) ) );
			field.dispatchEvent( new Event( 'change', { bubbles: true } ) );
		} );
	}

	// Thumbnails swap the main photo.
	const main = product.querySelector( '.rj-product__photo img' );
	const thumbs = [ ...product.querySelectorAll( '.rj-product__thumb' ) ];
	for ( const thumb of thumbs ) {
		thumb.addEventListener( 'click', () => {
			if ( ! main ) {
				return;
			}
			main.srcset = thumb.dataset.srcset || '';
			main.src = thumb.dataset.src;
			main.alt = thumb.dataset.alt || '';
			for ( const other of thumbs ) {
				other.setAttribute( 'aria-pressed', String( other === thumb ) );
			}
		} );
	}
}
