import { InspectorControls, RichText, useBlockProps } from '@wordpress/block-editor';
import { Notice, PanelBody, TextControl } from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import { ProductPicker, hasStore, productPrice, useProduct } from '../../shared/editor/product';
import { euros, html } from '../../shared/text';

const stripParagraphs = ( value ) => ( value || '' ).replace( /<\/?p[^>]*>/g, '' ).trim();

/**
 * Linked to a product, the price shown is the store's and cannot be typed
 * here (it is changed on the product). Everything else stays editable in place:
 * the card's words are the front page's, not the product page's.
 */
export default function Edit( { attributes, setAttributes } ) {
	const { productId, url, kicker, name, body, price, buttonLabel, addedLabel } = attributes;
	const product = useProduct( productId );
	const set = ( key ) => ( value ) => setAttributes( { [ key ]: html( value ) } );

	// Keep the saved price and link in step with the store.
	useEffect( () => {
		if ( ! product ) {
			return;
		}
		const live = productPrice( product );
		const next = {};
		if ( live && live !== price ) {
			next.price = live;
		}
		if ( product.permalink && product.permalink !== url ) {
			next.url = product.permalink;
		}
		if ( Object.keys( next ).length ) {
			setAttributes( next );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ product ] );

	const choose = ( chosen ) => {
		if ( ! chosen ) {
			setAttributes( { productId: 0, url: '' } );
			return;
		}
		setAttributes( {
			productId: chosen.id,
			url: chosen.permalink || '',
			price: productPrice( chosen ) || price,
			name: name || chosen.name || '',
			body: body || stripParagraphs( chosen.short_description ),
		} );
	};

	return (
		<>
			<InspectorControls>
				{ hasStore() && (
					<PanelBody title={ __( 'Producto', 'rejunte' ) }>
						<ProductPicker
							value={ productId }
							onChange={ choose }
							help={ __( 'El precio y el botón pasan a ser los de la tienda: «Sumar» lo añade al carrito.', 'rejunte' ) }
						/>
						{ productId > 0 && null === product && (
							<Notice status="warning" isDismissible={ false }>
								{ __( 'Ese producto ya no existe en la tienda.', 'rejunte' ) }
							</Notice>
						) }
					</PanelBody>
				) }
				<PanelBody title={ __( 'Botón', 'rejunte' ) } initialOpen={ false }>
					<TextControl
						__nextHasNoMarginBottom
						label={ __( 'Texto después de sumar', 'rejunte' ) }
						help={ __( 'Se muestra con la cantidad: «Sumado · 2».', 'rejunte' ) }
						value={ addedLabel }
						onChange={ ( value ) => setAttributes( { addedLabel: value } ) }
					/>
					{ ! productId && (
						<TextControl
							__nextHasNoMarginBottom
							label={ __( 'Enlace del nombre', 'rejunte' ) }
							value={ url }
							onChange={ ( value ) => setAttributes( { url: value } ) }
						/>
					) }
				</PanelBody>
			</InspectorControls>

			<article { ...useBlockProps( { className: 'rj-price' } ) }>
				<RichText tagName="span" className="rj-price__kicker" value={ kicker } allowedFormats={ [] } placeholder={ __( 'Presentación', 'rejunte' ) } onChange={ set( 'kicker' ) } />
				<RichText tagName="h3" className="rj-price__name" value={ name } allowedFormats={ [] } placeholder={ __( 'Nombre', 'rejunte' ) } onChange={ set( 'name' ) } />
				<RichText tagName="p" className="rj-price__body" value={ body } allowedFormats={ [ 'core/bold', 'core/italic' ] } placeholder={ __( 'Descripción', 'rejunte' ) } onChange={ set( 'body' ) } />
				<div className="rj-price__foot">
					{ productId ? (
						<span className="rj-price__amount" title={ __( 'Precio de la tienda', 'rejunte' ) }>
							{ euros( price ) || '—' }
						</span>
					) : (
						<span className="rj-price__amount">
							<RichText
								tagName="span"
								value={ price }
								allowedFormats={ [] }
								placeholder="0"
								onChange={ ( value ) => setAttributes( { price: html( value ).replace( /[^\d.,]/g, '' ) } ) }
							/>
							{ ' €' }
						</span>
					) }
					<RichText
						tagName="span"
						className="rj-button rj-button--ghost"
						value={ buttonLabel }
						allowedFormats={ [] }
						withoutInteractiveFormatting
						placeholder={ __( 'Sumar', 'rejunte' ) }
						onChange={ set( 'buttonLabel' ) }
					/>
				</div>
			</article>
		</>
	);
}
