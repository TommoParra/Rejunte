/**
 * Adds motion to every "La tanda" gallery on the page.
 */
import { createGallery } from '../../shared/gallery';

// A data attribute as a number; 0 is a valid value (a flat gallery).
const number = ( value, fallback ) => {
	const parsed = parseFloat( value );
	return Number.isFinite( parsed ) ? parsed : fallback;
};

for ( const root of document.querySelectorAll( '.rj-gallery' ) ) {
	const caption = root.querySelector( '.rj-gallery__caption' );
	const gallery = createGallery( root, {
		bend: number( root.dataset.bend, 2.2 ),
		scrollSpeed: number( root.dataset.scrollSpeed, 1 ),
		scrollEase: number( root.dataset.scrollEase, 0.085 ),
		onActive: ( index, item ) => {
			if ( caption && item ) {
				caption.textContent = item.dataset.caption || '';
			}
		},
	} );
	root.querySelector( '.rj-gallery__prev' )?.addEventListener( 'click', () => gallery.step( -1 ) );
	root.querySelector( '.rj-gallery__next' )?.addEventListener( 'click', () => gallery.step( 1 ) );
}
