import { BlockControls, InspectorControls, RichText, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, ToolbarGroup } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import { AltTextControl, EditableImage, LinkButton } from '../../shared/editor';
import { html } from '../../shared/text';

export default function Edit( { attributes, setAttributes, isSelected } ) {
	const { image, eyebrow, heading, lead, primaryLabel, primaryUrl, secondaryLabel, secondaryUrl } = attributes;
	const [ focus, setFocus ] = useState( null );
	const set = ( key ) => ( value ) => setAttributes( { [ key ]: html( value ) } );

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					{ 'primary' === focus && (
						<LinkButton
							label={ __( 'Destino del botón', 'rejunte' ) }
							url={ primaryUrl }
							onChange={ ( url ) => setAttributes( { primaryUrl: url } ) }
						/>
					) }
					{ 'secondary' === focus && (
						<LinkButton
							label={ __( 'Destino del enlace', 'rejunte' ) }
							url={ secondaryUrl }
							onChange={ ( url ) => setAttributes( { secondaryUrl: url } ) }
						/>
					) }
				</ToolbarGroup>
			</BlockControls>

			<InspectorControls>
				<PanelBody title={ __( 'Imagen', 'rejunte' ) }>
					<AltTextControl image={ image } onChange={ ( next ) => setAttributes( { image: next } ) } />
				</PanelBody>
			</InspectorControls>

			<section { ...useBlockProps( { className: 'rj-hero' } ) }>
				<div className="rj-hero__lockup">
					<EditableImage
						image={ image }
						brand="logo"
						ratio="1 / 1"
						fit="contain"
						tone="surface"
						isSelected={ isSelected }
						onChange={ ( next ) => setAttributes( { image: { alt: image.alt, ...next } } ) }
					/>
				</div>
				<div className="rj-hero__copy">
					<RichText
						tagName="span"
						className="rj-eyebrow"
						value={ eyebrow }
						allowedFormats={ [] }
						placeholder={ __( 'Antetítulo', 'rejunte' ) }
						onFocus={ () => setFocus( null ) }
						onChange={ set( 'eyebrow' ) }
					/>
					<RichText
						tagName="h1"
						className="rj-hero__title"
						value={ heading }
						allowedFormats={ [ 'core/italic' ] }
						placeholder={ __( 'Titular', 'rejunte' ) }
						onFocus={ () => setFocus( null ) }
						onChange={ set( 'heading' ) }
					/>
					<RichText
						tagName="p"
						className="rj-hero__lead"
						value={ lead }
						allowedFormats={ [ 'core/bold', 'core/italic' ] }
						placeholder={ __( 'Entradilla', 'rejunte' ) }
						onFocus={ () => setFocus( null ) }
						onChange={ set( 'lead' ) }
					/>
					<div className="rj-hero__actions">
						<RichText
							tagName="span"
							className="rj-button"
							value={ primaryLabel }
							allowedFormats={ [] }
							withoutInteractiveFormatting
							placeholder={ __( 'Botón', 'rejunte' ) }
							onFocus={ () => setFocus( 'primary' ) }
							onChange={ set( 'primaryLabel' ) }
						/>
						<RichText
							tagName="span"
							className="rj-link"
							value={ secondaryLabel }
							allowedFormats={ [] }
							withoutInteractiveFormatting
							placeholder={ __( 'Enlace', 'rejunte' ) }
							onFocus={ () => setFocus( 'secondary' ) }
							onChange={ set( 'secondaryLabel' ) }
						/>
					</div>
				</div>
			</section>
		</>
	);
}
