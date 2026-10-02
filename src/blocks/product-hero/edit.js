import { InspectorControls, RichText, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { store as coreStore, useEntityProp } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

import { AddButton, EditableImage, RemoveButton, list } from '../../shared/editor';
import { productPrice, useProduct } from '../../shared/editor/product';
import { RjImage } from '../../shared/image';
import { euros, html } from '../../shared/text';

const stripParagraphs = ( value ) => html( value ).replace( /<\/?p[^>]*>/g, '' ).trim();

/**
 * Editing a product shows its page as it is: the name, presentation, short
 * description and photo are the product's own fields, edited in place. The
 * price comes from the store (it is set in "Product data" below). In the site
 * editor, with no product to show, it draws the same layout with placeholders.
 */
export default function Edit( { attributes, setAttributes, isSelected, context: { postId, postType } } ) {
	const { chips, buttonLabel, shopLabel } = attributes;
	const isProduct = 'product' === postType && !! postId;

	const [ title, setTitle ] = useEntityProp( 'postType', 'product', 'title', isProduct ? postId : undefined );
	const [ excerpt, setExcerpt ] = useEntityProp( 'postType', 'product', 'excerpt', isProduct ? postId : undefined );
	const [ meta, setMeta ] = useEntityProp( 'postType', 'product', 'meta', isProduct ? postId : undefined );
	const [ featured, setFeatured ] = useEntityProp( 'postType', 'product', 'featured_media', isProduct ? postId : undefined );
	const [ categories ] = useEntityProp( 'postType', 'product', 'product_cat', isProduct ? postId : undefined );

	const media = useSelect( ( select ) => ( featured ? select( coreStore ).getMedia( featured, { context: 'view' } ) : null ), [ featured ] );
	const category = useSelect(
		( select ) => ( categories?.length ? select( coreStore ).getEntityRecord( 'taxonomy', 'product_cat', categories[ 0 ] ) : null ),
		[ categories ]
	);
	const product = useProduct( isProduct ? postId : 0 );
	const thumbs = product?.images?.length > 1 ? product.images : [];

	const image = media
		? { id: media.id, url: media.source_url, alt: media.alt_text, width: media.media_details?.width, height: media.media_details?.height }
		: {};
	const price = euros( productPrice( product ) );
	const setChips = ( next ) => setAttributes( { chips: next } );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Textos de la plantilla', 'rejunte' ) }>
					<TextControl __nextHasNoMarginBottom label={ __( 'Botón', 'rejunte' ) } value={ buttonLabel } onChange={ ( value ) => setAttributes( { buttonLabel: value } ) } />
					<TextControl __nextHasNoMarginBottom label={ __( 'Botón con el producto ya en el pedido', 'rejunte' ) } value={ attributes.addedLabel } onChange={ ( value ) => setAttributes( { addedLabel: value } ) } />
					<TextControl __nextHasNoMarginBottom label={ __( 'Nombre de la tienda en las migas', 'rejunte' ) } value={ shopLabel } onChange={ ( value ) => setAttributes( { shopLabel: value } ) } />
				</PanelBody>
			</InspectorControls>

			<section { ...useBlockProps( { className: 'rj-product' } ) }>
				<div className="rj-product__media">
					{ isProduct ? (
						<EditableImage
							className="rj-product__photo"
							image={ image }
							alt={ image.alt || title }
							ratio="4 / 5"
							isSelected={ isSelected }
							onChange={ ( next ) => setFeatured( next?.id || 0 ) }
						/>
					) : (
						<RjImage className="rj-product__photo" image={ {} } alt={ __( 'Foto del producto', 'rejunte' ) } ratio="4 / 5" />
					) }
					{ thumbs.length > 0 && (
						<ul className="rj-product__thumbs">
							{ thumbs.map( ( thumb, index ) => (
								<li key={ thumb.id }>
									<span className="rj-product__thumb" aria-pressed={ 0 === index ? 'true' : 'false' }>
										<img className="rj-product__thumb-img" src={ thumb.thumbnail } alt="" />
									</span>
								</li>
							) ) }
						</ul>
					) }
				</div>

				<div className="rj-product__copy">
					<nav className="rj-product__crumbs" aria-label={ __( 'Migas de pan', 'rejunte' ) }>
						<ol>
							<li>
								<span>{ shopLabel }</span>
							</li>
							<li>
								<span>{ category?.name || __( 'Categoría', 'rejunte' ) }</span>
							</li>
						</ol>
					</nav>

					{ isProduct ? (
						<>
							<RichText tagName="h1" className="rj-product__title" value={ title } allowedFormats={ [] } placeholder={ __( 'Nombre del producto', 'rejunte' ) } onChange={ ( value ) => setTitle( html( value ) ) } />
							<RichText
								tagName="span"
								className="rj-price__kicker rj-product__kicker"
								value={ meta?.rejunte_kicker || '' }
								allowedFormats={ [] }
								placeholder={ __( 'Presentación (docena, 18 cm…)', 'rejunte' ) }
								onChange={ ( value ) => setMeta( { ...meta, rejunte_kicker: html( value ) } ) }
							/>
							<div className="rj-product__lead">
								<RichText tagName="p" value={ stripParagraphs( excerpt ) } allowedFormats={ [ 'core/bold', 'core/italic' ] } placeholder={ __( 'Descripción corta', 'rejunte' ) } onChange={ ( value ) => setExcerpt( html( value ) ) } />
							</div>
						</>
					) : (
						<>
							<h1 className="rj-product__title">{ __( 'Nombre del producto', 'rejunte' ) }</h1>
							<span className="rj-price__kicker rj-product__kicker">{ __( 'Presentación', 'rejunte' ) }</span>
							<div className="rj-product__lead">
								<p>{ __( 'La descripción corta del producto.', 'rejunte' ) }</p>
							</div>
						</>
					) }

					<div className="rj-product__buy">
						<span className="rj-product__amount" title={ __( 'Precio de la tienda: se cambia en «Datos del producto»', 'rejunte' ) }>
							{ price || '— €' }
						</span>
						<div className="rj-product__form">
							<div className="rj-qty">
								<span className="rj-qty__step">−</span>
								<span className="rj-qty__input">1</span>
								<span className="rj-qty__step">+</span>
							</div>
							<RichText tagName="span" className="rj-button" value={ buttonLabel } allowedFormats={ [] } withoutInteractiveFormatting onChange={ ( value ) => setAttributes( { buttonLabel: html( value ) } ) } />
						</div>
					</div>

					<ul className="rj-chips">
						{ chips.map( ( chip, index ) => (
							<li key={ index } className="rj-edit-list-item">
								<RichText tagName="span" value={ chip } allowedFormats={ [] } placeholder={ __( 'Dato', 'rejunte' ) } onChange={ ( value ) => setChips( list.set( chips, index, html( value ) ) ) } />
								{ isSelected && <RemoveButton label={ __( 'Quitar', 'rejunte' ) } onClick={ () => setChips( list.remove( chips, index ) ) } /> }
							</li>
						) ) }
						{ isSelected && <AddButton label={ __( 'Añadir dato', 'rejunte' ) } onClick={ () => setChips( [ ...chips, '' ] ) } /> }
					</ul>
				</div>
			</section>
		</>
	);
}
