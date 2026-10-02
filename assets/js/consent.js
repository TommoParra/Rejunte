/**
 * Cookie banner and consent-gated loading.
 *
 * Public API for anything that needs consent:
 *   window.rejunteConsent.get()          → { analytics: true, … } or null
 *   window.rejunteConsent.on( cat, fn )  → runs fn once that category is accepted
 *   window.rejunteConsent.open()         → shows the banner again
 */
( function () {
	var configElement = document.getElementById( 'rj-consent-config' );
	var banner = document.getElementById( 'rj-consent' );
	if ( ! configElement || ! banner ) {
		return;
	}
	var config = JSON.parse( configElement.textContent );
	var root = document.documentElement;
	var listeners = {};
	var loaded = {};

	function read() {
		var match = document.cookie.match( new RegExp( '(?:^|; )' + config.cookie + '=([^;]*)' ) );
		if ( ! match ) {
			return null;
		}
		try {
			var data = JSON.parse( decodeURIComponent( match[ 1 ] ) );
			return data && data.v === config.version ? data.c || {} : null;
		} catch ( e ) {
			return null;
		}
	}

	function write( choice ) {
		var value = encodeURIComponent( JSON.stringify( { v: config.version, c: choice, t: new Date().toISOString().slice( 0, 10 ) } ) );
		var secure = location.protocol === 'https:' ? '; Secure' : '';
		// 13 months, the maximum the AEPD considers reasonable.
		document.cookie = config.cookie + '=' + value + '; Max-Age=' + 60 * 60 * 24 * 395 + '; Path=/; SameSite=Lax' + secure;
	}

	function load( choice ) {
		( config.services || [] ).forEach( function ( service ) {
			if ( ! choice[ service.category ] || loaded[ service.id ] ) {
				return;
			}
			loaded[ service.id ] = true;
			if ( service.src ) {
				var script = document.createElement( 'script' );
				script.async = true;
				script.src = service.src;
				document.head.appendChild( script );
			}
			if ( service.inline ) {
				var inline = document.createElement( 'script' );
				inline.textContent = service.inline;
				document.head.appendChild( inline );
			}
		} );
		Object.keys( listeners ).forEach( function ( category ) {
			if ( choice[ category ] ) {
				listeners[ category ].splice( 0 ).forEach( function ( fn ) {
					fn();
				} );
			}
		} );
		document.dispatchEvent( new CustomEvent( 'rejunte:consent', { detail: choice } ) );
	}

	// While the banner is up, focused elements scroll into view above it.
	function reserve( visible ) {
		root.style.setProperty( '--rj-consent-h', visible ? banner.offsetHeight + 16 + 'px' : '0px' );
	}

	function show() {
		banner.hidden = false;
		reserve( true );
	}

	function hide() {
		banner.hidden = true;
		reserve( false );
	}

	function decide( choice ) {
		write( choice );
		hide();
		load( choice );
	}

	var form = banner.querySelector( '.rj-consent__choices' );
	var configure = banner.querySelector( '[data-consent="configure"]' );
	var save = banner.querySelector( '[data-consent="save"]' );
	var categories = form ? Array.prototype.map.call( form.querySelectorAll( 'input[name]' ), function ( input ) {
		return input.name;
	} ) : [];
	var all = function ( value ) {
		var choice = {};
		categories.forEach( function ( name ) {
			choice[ name ] = value;
		} );
		return choice;
	};

	banner.addEventListener( 'click', function ( event ) {
		var button = event.target.closest( '[data-consent]' );
		if ( ! button ) {
			return;
		}
		var action = button.getAttribute( 'data-consent' );
		if ( action === 'accept' ) {
			decide( all( true ) );
		} else if ( action === 'reject' || action === 'ok' ) {
			decide( all( false ) );
		} else if ( action === 'configure' ) {
			var open = form.hidden;
			form.hidden = ! open;
			save.hidden = ! open;
			configure.setAttribute( 'aria-expanded', String( open ) );
			reserve( true );
			if ( open ) {
				form.querySelector( 'input[name]' ).focus();
			}
		} else if ( action === 'save' ) {
			var choice = {};
			categories.forEach( function ( name ) {
				choice[ name ] = form.elements[ name ].checked;
			} );
			decide( choice );
		}
	} );

	// "Configurar cookies" anywhere on the page reopens the banner.
	document.addEventListener( 'click', function ( event ) {
		if ( event.target.closest( '[data-rj-consent-open]' ) ) {
			event.preventDefault();
			show();
			banner.querySelector( 'button' ).focus();
		}
	} );
	root.classList.add( 'rj-consent-ready' );

	window.rejunteConsent = {
		get: read,
		on: function ( category, fn ) {
			var choice = read();
			if ( choice && choice[ category ] ) {
				fn();
			} else {
				( listeners[ category ] = listeners[ category ] || [] ).push( fn );
			}
		},
		open: show,
	};

	var stored = read();
	if ( stored ) {
		hide();
		load( stored );
	} else {
		show();
	}
} )();
