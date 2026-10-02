/**
 * Cart page: the proceed button reads "Pedir por WhatsApp" and links to
 * WhatsApp with the order. The link comes from the server with every Store API
 * cart response (extensions.rejunte.whatsapp_url), so it follows each change
 * of quantity or item. WooCommerce re-applies these filters whenever the cart
 * changes.
 */
( function () {
	var config = window.rejunteWhatsApp || {};
	var checkout = window.wc && window.wc.blocksCheckout;
	if ( ! checkout || ! checkout.registerCheckoutFilters ) {
		return;
	}

	checkout.registerCheckoutFilters( 'rejunte', {
		proceedToCheckoutButtonLabel: function ( value ) {
			return config.label || value;
		},
		proceedToCheckoutButtonLink: function ( value, extensions, args ) {
			var cart = args && args.cart;
			var url = cart && cart.extensions && cart.extensions.rejunte && cart.extensions.rejunte.whatsapp_url;
			return url || config.url || value;
		},
	} );
} )();
