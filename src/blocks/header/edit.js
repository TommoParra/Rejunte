import { BlockControls, InspectorControls, RichText, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, TextControl, ToolbarGroup } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

import { AddButton, AltTextControl, EditableImage, LinkButton, RemoveButton, list } from '../../shared/editor';
import { html } from '../../shared/text';

/**
 * Edits in place: the brand, every link label and the order button are typed
 * where they appear. The link being edited gets a link control in the toolbar.
 */
export default function Edit( { attributes, setAttributes, isSelected } ) {
	const { logo, brand, brandUrl, navLabel, links, ctaLabel, ctaUrl, menuOpenLabel, menuCloseLabel } = attributes;
	const [ open, setOpen ] = useState( false );
	const [ focus, setFocus ] = useState( null );

	const setLinks = ( next ) => setAttributes( { links: next } );

	const renderLinks = ( prefix ) => (
		<ul>
			{ links.map( ( link, index ) => (
				<li key={ index } className="rj-edit-list-item">
					<RichText
						tagName="span"
						className="rj-nav__link"
						value={ link.label }
						allowedFormats={ [] }
						withoutInteractiveFormatting
						placeholder={ __( 'Enlace', 'rejunte' ) }
						identifier={ `${ prefix }-${ index }` }
						onFocus={ () => setFocus( index ) }
						onChange={ ( label ) => setLinks( list.patch( links, index, { label: html( label ) } ) ) }
					/>
					{ isSelected && (
						<RemoveButton
							label={ __( 'Quitar enlace', 'rejunte' ) }
							onClick={ () => setLinks( list.remove( links, index ) ) }
						/>
					) }
				</li>
			) ) }
			{ isSelected && (
				<li>
					<AddButton
						label={ __( 'Añadir enlace', 'rejunte' ) }
						onClick={ () => setLinks( [ ...links, { label: '', url: '/#' } ] ) }
					/>
				</li>
			) }
		</ul>
	);

	const focusedLink = typeof focus === 'number' ? links[ focus ] : null;

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					{ focusedLink && (
						<LinkButton
							label={ sprintf(
								/* translators: %s: link label. */
								__( 'Destino de «%s»', 'rejunte' ),
								focusedLink.label
							) }
							url={ focusedLink.url }
							onChange={ ( url ) => setLinks( list.patch( links, focus, { url } ) ) }
						/>
					) }
					{ 'cta' === focus && (
						<LinkButton
							label={ __( 'Destino del botón de pedido', 'rejunte' ) }
							url={ ctaUrl }
							onChange={ ( url ) => setAttributes( { ctaUrl: url } ) }
						/>
					) }
				</ToolbarGroup>
			</BlockControls>

			<InspectorControls>
				<PanelBody title={ __( 'Logo', 'rejunte' ) }>
					<AltTextControl
						image={ logo }
						onChange={ ( next ) => setAttributes( { logo: next } ) }
						help={ __( 'El logo va junto al nombre escrito, así que es decorativo: déjalo vacío.', 'rejunte' ) }
					/>
					<TextControl
						__nextHasNoMarginBottom
						label={ __( 'Enlace de la marca', 'rejunte' ) }
						value={ brandUrl }
						onChange={ ( value ) => setAttributes( { brandUrl: value } ) }
					/>
				</PanelBody>
				<PanelBody title={ __( 'Enlaces y botón', 'rejunte' ) } initialOpen={ false }>
					{ links.map( ( link, index ) => (
						<TextControl
							__nextHasNoMarginBottom
							key={ index }
							label={ html( link.label ) || __( 'Enlace', 'rejunte' ) }
							value={ link.url }
							onChange={ ( url ) => setLinks( list.patch( links, index, { url } ) ) }
						/>
					) ) }
					<TextControl
						__nextHasNoMarginBottom
						label={ __( 'Botón de pedido (con el pedido vacío)', 'rejunte' ) }
						help={ __( 'Con productos en el pedido, el botón lleva al carrito.', 'rejunte' ) }
						value={ ctaUrl }
						onChange={ ( value ) => setAttributes( { ctaUrl: value } ) }
					/>
				</PanelBody>
				<PanelBody title={ __( 'Accesibilidad', 'rejunte' ) } initialOpen={ false }>
					<TextControl
						__nextHasNoMarginBottom
						label={ __( 'Nombre de la navegación', 'rejunte' ) }
						value={ navLabel }
						onChange={ ( value ) => setAttributes( { navLabel: value } ) }
					/>
					<TextControl
						__nextHasNoMarginBottom
						label={ __( 'Botón de menú: abrir', 'rejunte' ) }
						value={ menuOpenLabel }
						onChange={ ( value ) => setAttributes( { menuOpenLabel: value } ) }
					/>
					<TextControl
						__nextHasNoMarginBottom
						label={ __( 'Botón de menú: cerrar', 'rejunte' ) }
						value={ menuCloseLabel }
						onChange={ ( value ) => setAttributes( { menuCloseLabel: value } ) }
					/>
				</PanelBody>
			</InspectorControls>

			<header { ...useBlockProps( { className: 'rj-nav', 'data-open': open ? 'true' : 'false' } ) }>
				<div className="rj-nav__bar">
					<div className="rj-nav__brand">
						<EditableImage
							className="rj-nav__mark"
							image={ logo }
							brand="logo-mark"
							alt=""
							ratio="1 / 1"
							fit="contain"
							tone="surface"
							isSelected={ isSelected }
							onChange={ ( next ) => setAttributes( { logo: next } ) }
						/>
						<RichText
							tagName="span"
							className="rj-nav__name"
							value={ brand }
							allowedFormats={ [] }
							placeholder={ __( 'Marca', 'rejunte' ) }
							onFocus={ () => setFocus( 'brand' ) }
							onChange={ ( value ) => setAttributes( { brand: html( value ) } ) }
						/>
					</div>
					<nav className="rj-nav__links" aria-label={ navLabel }>
						{ renderLinks( 'bar' ) }
					</nav>
					<RichText
						tagName="span"
						className="rj-nav__cta"
						value={ ctaLabel }
						allowedFormats={ [] }
						withoutInteractiveFormatting
						placeholder={ __( 'Pedir', 'rejunte' ) }
						onFocus={ () => setFocus( 'cta' ) }
						onChange={ ( value ) => setAttributes( { ctaLabel: html( value ) } ) }
					/>
					<button
						type="button"
						className="rj-nav__burger"
						aria-expanded={ open ? 'true' : 'false' }
						onClick={ () => setOpen( ! open ) }
					>
						<span aria-hidden="true">
							<i></i>
							<i></i>
							<i></i>
						</span>
						<span className="screen-reader-text">{ open ? menuCloseLabel : menuOpenLabel }</span>
					</button>
				</div>
				<div className="rj-nav__panel" hidden={ ! open }>
					{ renderLinks( 'panel' ) }
				</div>
			</header>
		</>
	);
}
