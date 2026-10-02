import { BlockControls, InspectorControls, RichText, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, TextControl, ToolbarGroup } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import { AddButton, AltTextControl, EditableImage, HeadingLevelControl, LinkButton, RemoveButton, list } from '../../shared/editor';
import { html } from '../../shared/text';

export default function Edit( { attributes, setAttributes, isSelected } ) {
	const { eyebrow, heading, text, chips, buttonLabel, buttonUrl, image, photoAnchor } = attributes;
	const [ focus, setFocus ] = useState( null );
	const set = ( key ) => ( value ) => setAttributes( { [ key ]: html( value ) } );
	const setChips = ( next ) => setAttributes( { chips: next } );

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					{ 'button' === focus && (
						<LinkButton
							label={ __( 'Destino del botón', 'rejunte' ) }
							url={ buttonUrl }
							onChange={ ( url ) => setAttributes( { buttonUrl: url } ) }
						/>
					) }
				</ToolbarGroup>
			</BlockControls>

			<InspectorControls>
				<PanelBody title={ __( 'Título', 'rejunte' ) } initialOpen={ false }>
					<HeadingLevelControl value={ attributes.headingLevel } onChange={ ( headingLevel ) => setAttributes( { headingLevel } ) } />
				</PanelBody>
				<PanelBody title={ __( 'Foto', 'rejunte' ) }>
					<AltTextControl image={ image } onChange={ ( next ) => setAttributes( { image: next } ) } />
					<TextControl
						__nextHasNoMarginBottom
						label={ __( 'Ancla de la foto', 'rejunte' ) }
						help={ __( 'Para enlazar directo a la foto, como «El taller» en la cabecera (#taller).', 'rejunte' ) }
						value={ photoAnchor }
						onChange={ ( value ) => setAttributes( { photoAnchor: value.replace( /[^\w-]/g, '' ) } ) }
					/>
				</PanelBody>
				<PanelBody title={ __( 'Botón', 'rejunte' ) } initialOpen={ false }>
					<TextControl
						__nextHasNoMarginBottom
						label={ __( 'Enlace', 'rejunte' ) }
						help={ __( 'Por ejemplo https://wa.me/34600000000 para abrir WhatsApp.', 'rejunte' ) }
						value={ buttonUrl }
						onChange={ ( value ) => setAttributes( { buttonUrl: value } ) }
					/>
				</PanelBody>
			</InspectorControls>

			<section { ...useBlockProps( { className: 'rj-encargos' } ) }>
				<div className="rj-encargos__panel">
					<div className="rj-encargos__copy">
						<RichText tagName="span" className="rj-eyebrow" value={ eyebrow } allowedFormats={ [] } placeholder={ __( 'Antetítulo', 'rejunte' ) } onFocus={ () => setFocus( null ) } onChange={ set( 'eyebrow' ) } />
						<RichText tagName={ `h${ attributes.headingLevel }` } className="rj-encargos__title" value={ heading } allowedFormats={ [] } placeholder={ __( 'Título', 'rejunte' ) } onFocus={ () => setFocus( null ) } onChange={ set( 'heading' ) } />
						<RichText tagName="p" className="rj-encargos__text" value={ text } allowedFormats={ [ 'core/bold', 'core/italic' ] } placeholder={ __( 'Texto', 'rejunte' ) } onFocus={ () => setFocus( null ) } onChange={ set( 'text' ) } />
						<ul className="rj-chips">
							{ chips.map( ( chip, index ) => (
								<li key={ index } className="rj-edit-list-item">
									<RichText
										tagName="span"
										value={ chip }
										allowedFormats={ [] }
										placeholder={ __( 'Sabor', 'rejunte' ) }
										onFocus={ () => setFocus( null ) }
										onChange={ ( value ) => setChips( list.set( chips, index, html( value ) ) ) }
									/>
									{ isSelected && <RemoveButton label={ __( 'Quitar', 'rejunte' ) } onClick={ () => setChips( list.remove( chips, index ) ) } /> }
								</li>
							) ) }
							{ isSelected && <AddButton label={ __( 'Añadir sabor', 'rejunte' ) } onClick={ () => setChips( [ ...chips, '' ] ) } /> }
						</ul>
						<RichText
							tagName="span"
							className="rj-button"
							value={ buttonLabel }
							allowedFormats={ [] }
							withoutInteractiveFormatting
							placeholder={ __( 'Botón', 'rejunte' ) }
							onFocus={ () => setFocus( 'button' ) }
							onChange={ set( 'buttonLabel' ) }
						/>
					</div>
					<div className="rj-encargos__photo">
						<EditableImage
							image={ image }
							ratio="4 / 5"
							isSelected={ isSelected }
							onChange={ ( next ) => setAttributes( { image: next } ) }
						/>
					</div>
				</div>
			</section>
		</>
	);
}
