/**
 * Every "add to the order" button on the page: price cards, product grids and
 * the product page. Buttons are marked `data-rj-add`, carry the product (or, with
 * no store, a card key) as their value, and swap their label for the count
 * already in the order ("Sumado · 2").
 *
 * Several view modules import this; it binds once per page.
 */
import { announce, getCart } from './cart';

const FLAG = '__rejunteOrderButtons';

function nameOf( button ) {
	const described = button.getAttribute( 'aria-describedby' );
	return ( described && document.getElementById( described )?.textContent.trim() ) || button.dataset.name || '';
}

function render( items ) {
	for ( const button of document.querySelectorAll( 'button[data-rj-add]' ) ) {
		if ( button.disabled ) {
			continue;
		}
		const quantity = items[ button.value ] || 0;
		button.textContent = quantity ? `${ button.dataset.labelAdded } · ${ quantity }` : button.dataset.label;
	}
}

export function initOrderButtons() {
	if ( window[ FLAG ] ) {
		return;
	}
	window[ FLAG ] = true;

	const cart = getCart();
	cart.subscribe( ( { items } ) => render( items ) );

	document.addEventListener( 'click', async ( event ) => {
		const button = event.target.closest( 'button[data-rj-add]' );
		if ( ! button || button.disabled ) {
			return;
		}
		event.preventDefault();
		if ( 'true' === button.getAttribute( 'aria-busy' ) ) {
			return;
		}

		const field = button.form?.querySelector( '[name="quantity"]' );
		const quantity = Math.max( 1, parseInt( field?.value, 10 ) || 1 );

		button.setAttribute( 'aria-busy', 'true' );
		try {
			const { items } = await cart.add( button.value, quantity );
			const template = cart.config.i18n?.added || '%1$s: %2$s en el pedido';
			announce( template.replace( '%1$s', nameOf( button ) ).replace( '%2$s', String( items[ button.value ] || 0 ) ) );
		} catch ( error ) {
			// The store refused (sold out, for instance). Submitting the form lets
			// the cart page show the store's own message.
			if ( button.form ) {
				button.removeAttribute( 'aria-busy' );
				button.form.requestSubmit( button );
				return;
			}
			announce( error.message );
		}
		button.removeAttribute( 'aria-busy' );
	} );
}
