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

/**
 * "Alfajores de maicena: 2 en el pedido · Ver pedido": a short confirmation
 * near the order button. It is the page's polite live region too, so screen
 * readers hear it once. Stays while hovered or focused.
 */
let toast = null;
let toastTimer = 0;

function createToast( config ) {
	toast = document.createElement( 'div' );
	toast.className = 'rj-toast';
	toast.setAttribute( 'role', 'status' );
	toast.hidden = true;
	toast.innerHTML = '<span class="rj-toast__text"></span>';
	if ( config.cartUrl ) {
		const link = document.createElement( 'a' );
		link.className = 'rj-toast__link';
		link.href = config.cartUrl;
		link.textContent = config.i18n?.view || 'Ver pedido';
		toast.append( link );
	}
	const close = document.createElement( 'button' );
	close.type = 'button';
	close.className = 'rj-toast__close';
	close.setAttribute( 'aria-label', config.i18n?.close || 'Cerrar' );
	close.textContent = '×';
	close.addEventListener( 'click', () => ( toast.hidden = true ) );
	toast.append( close );
	toast.addEventListener( 'pointerenter', () => window.clearTimeout( toastTimer ) );
	toast.addEventListener( 'focusin', () => window.clearTimeout( toastTimer ) );
	toast.addEventListener( 'pointerleave', () => hideSoon() );
	document.body.append( toast );
}

function hideSoon() {
	window.clearTimeout( toastTimer );
	toastTimer = window.setTimeout( () => {
		if ( ! toast.contains( document.activeElement ) ) {
			toast.hidden = true;
		}
	}, 5000 );
}

function showToast( message ) {
	toast.querySelector( '.rj-toast__text' ).textContent = message;
	toast.hidden = false;
	hideSoon();
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
	createToast( cart.config );
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
			showToast( template.replace( '%1$s', nameOf( button ) ).replace( '%2$s', String( items[ button.value ] || 0 ) ) );
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
