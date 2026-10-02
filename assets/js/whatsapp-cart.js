/**
 * Cart page, with orders closing on WhatsApp.
 *
 * - The proceed button reads "Pedir por WhatsApp" and links to WhatsApp with the
 *   order. The link comes from the server with every Store API cart response
 *   (extensions.rejunte.whatsapp_url), so it follows each change in the cart.
 * - Above it, in WooCommerce's order-summary slot: the pickup day (saved through
 *   the Store API and written into the message), what happens on tapping the
 *   button, the terms of sale, and a way to copy the order for anyone without
 *   WhatsApp.
 *
 * Plain script on WordPress globals (no build step): wc.blocksCheckout,
 * wp.plugins, wp.element, wp.data.
 */
( function () {
	var config = window.rejunteWhatsApp || {};
	var i18n = config.i18n || {};
	var checkout = window.wc && window.wc.blocksCheckout;
	if ( ! checkout || ! checkout.registerCheckoutFilters ) {
		return;
	}

	function extension( cart ) {
		return ( cart && cart.extensions && cart.extensions.rejunte ) || {};
	}

	checkout.registerCheckoutFilters( 'rejunte', {
		proceedToCheckoutButtonLabel: function ( value ) {
			return config.label || value;
		},
		proceedToCheckoutButtonLink: function ( value, extensions, args ) {
			return extension( args && args.cart ).whatsapp_url || config.url || value;
		},
	} );

	var plugins = window.wp && window.wp.plugins;
	var element = window.wp && window.wp.element;
	var data = window.wp && window.wp.data;
	if ( ! plugins || ! element || ! data || ! checkout.ExperimentalOrderMeta ) {
		return;
	}
	var h = element.createElement;

	function OrderNote() {
		var ext = data.useSelect( function ( select ) {
			return extension( select( 'wc/store/cart' ).getCartData() );
		}, [] );
		var busyState = element.useState( false );
		var copiedState = element.useState( false );
		var options = ext.pickup_options || [];
		var text = ext.whatsapp_url ? decodeURIComponent( ext.whatsapp_url.split( '?text=' )[ 1 ] || '' ) : '';

		var choose = function ( event ) {
			busyState[ 1 ]( true );
			Promise.resolve( checkout.extensionCartUpdate( { namespace: 'rejunte', data: { pickup: event.target.value } } ) ).finally( function () {
				busyState[ 1 ]( false );
			} );
		};
		var copy = function () {
			if ( navigator.clipboard ) {
				navigator.clipboard.writeText( text ).then( function () {
					copiedState[ 1 ]( true );
				} );
			}
		};

		return h(
			checkout.ExperimentalOrderMeta,
			null,
			h(
				'div',
				{ className: 'rj-cart-extra' },
				options.length
					? h(
						'div',
						{ className: 'rj-cart-extra__field' },
						h( 'label', { htmlFor: 'rj-pickup', className: 'rj-cart-extra__label' }, i18n.pickup ),
						h(
							'select',
							{ id: 'rj-pickup', className: 'rj-cart-extra__select', value: ext.pickup || '', disabled: busyState[ 0 ], onChange: choose },
							h( 'option', { value: '' }, i18n.choose ),
							options.map( function ( option ) {
								return h( 'option', { key: option.value, value: option.value }, option.label );
							} )
						)
					)
					: null,
				h(
					'p',
					{ className: 'rj-cart-extra__note' },
					i18n.note,
					config.termsUrl ? ' ' : null,
					config.termsUrl ? h( 'a', { href: config.termsUrl }, i18n.terms ) : null
				),
				text
					? h(
						'p',
						{ className: 'rj-cart-extra__fallback' },
						h( 'button', { type: 'button', className: 'rj-cart-extra__copy', onClick: copy }, copiedState[ 0 ] ? i18n.copied : i18n.copy ),
						' ',
						i18n.call,
						' ',
						h( 'a', { href: 'tel:' + ext.phone_tel }, ext.phone ),
						'.'
					)
					: null,
				h( 'span', { className: 'screen-reader-text', 'aria-live': 'polite' }, copiedState[ 0 ] ? i18n.copied : '' )
			)
		);
	}

	plugins.registerPlugin( 'rejunte-whatsapp-order', { render: OrderNote, scope: 'woocommerce-checkout' } );
} )();
