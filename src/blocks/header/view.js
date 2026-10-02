/**
 * Header behaviour: the phone menu disclosure and the live order count.
 */
import { getCart } from '../../shared/cart';

const header = document.querySelector( '.rj-nav' );

if ( header ) {
	const burger = header.querySelector( '.rj-nav__burger' );
	const panel = header.querySelector( '.rj-nav__panel' );
	const burgerLabel = burger?.querySelector( '.screen-reader-text' );
	const cta = header.querySelector( '.rj-nav__cta' );

	const setOpen = ( open ) => {
		header.dataset.open = String( open );
		burger.setAttribute( 'aria-expanded', String( open ) );
		panel.hidden = ! open;
		burgerLabel.textContent = open ? burger.dataset.labelClose : burger.dataset.labelOpen;
	};

	if ( burger && panel ) {
		burger.addEventListener( 'click', () => setOpen( header.dataset.open !== 'true' ) );

		// Following a link closes the menu.
		panel.addEventListener( 'click', ( event ) => {
			if ( event.target.closest( 'a' ) ) {
				setOpen( false );
			}
		} );

		document.addEventListener( 'keydown', ( event ) => {
			if ( event.key === 'Escape' && header.dataset.open === 'true' ) {
				setOpen( false );
				burger.focus();
			}
		} );

		// Widening to desktop leaves no menu to have open.
		window.matchMedia( '(min-width: 62.0625rem)' ).addEventListener( 'change', ( event ) => {
			if ( event.matches ) {
				setOpen( false );
			}
		} );
	}

	getCart()?.subscribe( ( { count } ) => {
		const label = cta.dataset.label;
		cta.textContent = count ? `${ label } · ${ count }` : label;
		if ( count && cta.dataset.cartUrl ) {
			cta.href = cta.dataset.cartUrl;
		}
	} );
}
