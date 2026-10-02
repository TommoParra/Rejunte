/**
 * The order, backed by the WooCommerce cart through the Store API.
 *
 * The header's "Pedir · N" and each card's "Sumado · N" are rendered by the
 * server with the cart as it is, so nothing is fetched on load. This module
 * only talks to the store when someone adds something, and tells every
 * listener on the page through a `rejunte:cart` event.
 *
 * Without WooCommerce it falls back to what the prototype did: an in-page
 * count that lives until the page is left.
 *
 * Several view modules bundle this file; the store itself is a single instance
 * on `window`, so they share one nonce and one cart.
 */

const KEY = '__rejunteCart';

function summarise( cart ) {
	const items = {};
	for ( const item of cart.items || [] ) {
		items[ item.id ] = ( items[ item.id ] || 0 ) + item.quantity;
	}
	return { count: cart.items_count || 0, items };
}

function subscribe( callback ) {
	const handler = ( event ) => callback( event.detail );
	document.addEventListener( 'rejunte:cart', handler );
	return () => document.removeEventListener( 'rejunte:cart', handler );
}

function publishSummary( summary ) {
	document.dispatchEvent( new CustomEvent( 'rejunte:cart', { detail: summary } ) );
	return summary;
}

// No store on the page: count in memory, as the prototype did.
function createLocal() {
	const items = {};
	return {
		config: {},
		async refresh() {
			return { count: 0, items };
		},
		async add( id, quantity = 1 ) {
			items[ id ] = ( items[ id ] || 0 ) + quantity;
			const count = Object.values( items ).reduce( ( total, value ) => total + value, 0 );
			return publishSummary( { count, items: { ...items } } );
		},
		subscribe,
	};
}

function create() {
	const element = document.getElementById( 'rejunte-store' );
	if ( ! element ) {
		return createLocal();
	}

	let config;
	try {
		config = JSON.parse( element.textContent );
	} catch {
		return createLocal();
	}

	let nonce = config.nonce;

	async function request( path, { method = 'GET', body } = {}, retry = true ) {
		const headers = { Accept: 'application/json' };
		if ( body ) {
			headers[ 'Content-Type' ] = 'application/json';
		}
		if ( method !== 'GET' && nonce ) {
			headers.Nonce = nonce;
		}

		const response = await fetch( config.api + path, {
			method,
			headers,
			credentials: 'same-origin',
			body: body ? JSON.stringify( body ) : undefined,
		} );

		// The store hands out a fresh nonce with every response; a page served
		// before the visitor had a session carries one that will not validate.
		const fresh = response.headers.get( 'Nonce' );
		if ( fresh ) {
			nonce = fresh;
		}

		const data = await response.json().catch( () => null );
		if ( ! response.ok ) {
			if ( retry && data?.code === 'woocommerce_rest_invalid_nonce' ) {
				return request( path, { method, body }, false );
			}
			const error = new Error( data?.message || response.statusText );
			error.data = data;
			throw error;
		}
		return data;
	}

	function publish( cart ) {
		return publishSummary( summarise( cart ) );
	}

	return {
		config,
		/** Re-read the cart (after a back/forward cache restore, for instance). */
		async refresh() {
			return publish( await request( 'cart' ) );
		},
		/**
		 * @param {number} id       Product ID.
		 * @param {number} quantity Units to add.
		 */
		async add( id, quantity = 1 ) {
			const product = Number( id );
			if ( ! Number.isInteger( product ) || product <= 0 ) {
				throw new Error( 'Not a store product' );
			}
			return publish( await request( 'cart/add-item', { method: 'POST', body: { id: product, quantity } } ) );
		},
		/**
		 * Receives { count, items } on every change; returns an unsubscribe.
		 */
		subscribe,
	};
}

/**
 * The shared store: WooCommerce's cart when the store is active, an in-page
 * count otherwise.
 *
 * @return {Object} Store.
 */
export function getCart() {
	if ( ! ( KEY in window ) ) {
		window[ KEY ] = create();
		// Pages restored from the back/forward cache show the cart as it was.
		window.addEventListener( 'pageshow', ( event ) => {
			if ( event.persisted && window[ KEY ].config.api ) {
				window[ KEY ].refresh().catch( () => {} );
			}
		} );
	}
	return window[ KEY ];
}

/**
 * Announce a message to screen readers through the page's live region.
 *
 * @param {string} message Text to announce.
 */
export function announce( message ) {
	let region = document.getElementById( 'rejunte-live' );
	if ( ! region ) {
		region = document.createElement( 'p' );
		region.id = 'rejunte-live';
		region.className = 'rj-live';
		region.setAttribute( 'role', 'status' );
		document.body.append( region );
	}
	region.textContent = '';
	window.setTimeout( () => {
		region.textContent = message;
	}, 50 );
}
