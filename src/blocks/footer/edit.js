import { InspectorControls, RichText, useBlockProps } from '@wordpress/block-editor';
import { Button, PanelBody, SelectControl, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { AddButton, AltTextControl, EditableImage, RemoveButton, list } from '../../shared/editor';
import { html } from '../../shared/text';
import { columnsStyle } from './save';

/**
 * Lines accept links (Ctrl/Cmd + K): an Instagram line links to the profile, a
 * phone line to tel:. Those links, the address and the hours are read back by
 * the theme for structured data, so typing them here is all it takes.
 */
export default function Edit( { attributes, setAttributes, isSelected } ) {
	const { logo, name, description, columns, country, legal, cookiesLabel } = attributes;
	const setLegal = ( next ) => setAttributes( { legal: next } );
	const set = ( key ) => ( value ) => setAttributes( { [ key ]: html( value ) } );
	const setColumns = ( next ) => setAttributes( { columns: next } );
	const setLines = ( index, lines ) => setColumns( list.patch( columns, index, { lines } ) );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Logo', 'rejunte' ) }>
					<AltTextControl
						image={ logo }
						onChange={ ( next ) => setAttributes( { logo: next } ) }
						help={ __( 'El logo va junto al nombre escrito, así que es decorativo: déjalo vacío.', 'rejunte' ) }
					/>
				</PanelBody>
				<PanelBody title={ __( 'Columnas', 'rejunte' ) } initialOpen={ false }>
					<Button variant="secondary" onClick={ () => setColumns( [ ...columns, { label: '', lines: [ '' ] } ] ) }>
						{ __( 'Añadir columna', 'rejunte' ) }
					</Button>
				</PanelBody>
				<PanelBody title={ __( 'Enlaces legales', 'rejunte' ) } initialOpen={ false }>
					{ legal.map( ( link, index ) => (
						<TextControl
							__nextHasNoMarginBottom
							key={ index }
							label={ html( link.label ) || __( 'Enlace', 'rejunte' ) }
							value={ link.url }
							onChange={ ( url ) => setLegal( list.patch( legal, index, { url } ) ) }
						/>
					) ) }
					<p className="components-base-control__help">
						{ __( '«Configurar cookies» vuelve a abrir el aviso de cookies; vacío, no se muestra.', 'rejunte' ) }
					</p>
				</PanelBody>
				<PanelBody title={ __( 'Datos para buscadores', 'rejunte' ) } initialOpen={ false }>
					<p>
						{ __( 'La dirección (calle y una línea «código postal + ciudad»), el horario («Jueves a domingo», «16 a 20 h»), el teléfono y los enlaces a redes se leen de las líneas del pie.', 'rejunte' ) }
					</p>
					<SelectControl
						__nextHasNoMarginBottom
						label={ __( 'País', 'rejunte' ) }
						value={ country }
						options={ [
							{ value: 'ES', label: 'España' },
							{ value: 'AR', label: 'Argentina' },
							{ value: 'PT', label: 'Portugal' },
							{ value: 'FR', label: 'Francia' },
						] }
						onChange={ ( value ) => setAttributes( { country: value } ) }
					/>
				</PanelBody>
			</InspectorControls>

			<footer { ...useBlockProps( { className: 'rj-foot', style: columnsStyle( columns ) } ) }>
				<div className="rj-foot__brand">
					<EditableImage
						className="rj-foot__mark"
						image={ logo }
						brand="logo-mark-light"
						alt=""
						ratio="1 / 1"
						fit="contain"
						tone="deep"
						isSelected={ isSelected }
						onChange={ ( next ) => setAttributes( { logo: next } ) }
					/>
					<RichText tagName="span" className="rj-foot__name" value={ name } allowedFormats={ [] } placeholder={ __( 'Marca', 'rejunte' ) } onChange={ set( 'name' ) } />
					<RichText tagName="p" className="rj-foot__text" value={ description } allowedFormats={ [ 'core/bold', 'core/italic', 'core/link' ] } placeholder={ __( 'Descripción', 'rejunte' ) } onChange={ set( 'description' ) } />
				</div>
				{ columns.map( ( column, index ) => (
					<div key={ index } className="rj-foot__col rj-edit-list-item">
						<RichText
							tagName="h2"
							className="rj-foot__label"
							value={ column.label }
							allowedFormats={ [] }
							placeholder={ __( 'Título', 'rejunte' ) }
							onChange={ ( value ) => setColumns( list.patch( columns, index, { label: html( value ) } ) ) }
						/>
						{ ( column.lines || [] ).map( ( line, lineIndex ) => (
							<div key={ lineIndex } className="rj-edit-list-item">
								<RichText
									tagName="p"
									className="rj-foot__line"
									value={ line }
									allowedFormats={ [ 'core/link', 'core/bold' ] }
									placeholder={ __( 'Línea', 'rejunte' ) }
									onChange={ ( value ) => setLines( index, list.set( column.lines, lineIndex, html( value ) ) ) }
								/>
								{ isSelected && (
									<RemoveButton label={ __( 'Quitar línea', 'rejunte' ) } onClick={ () => setLines( index, list.remove( column.lines, lineIndex ) ) } />
								) }
							</div>
						) ) }
						{ isSelected && (
							<>
								<AddButton label={ __( 'Añadir línea', 'rejunte' ) } onClick={ () => setLines( index, [ ...( column.lines || [] ), '' ] ) } />
								<RemoveButton label={ __( 'Quitar columna', 'rejunte' ) } onClick={ () => setColumns( list.remove( columns, index ) ) } />
							</>
						) }
					</div>
				) ) }
				<div className="rj-foot__legal">
					<ul className="rj-foot__links">
						{ legal.map( ( link, index ) => (
							<li key={ index } className="rj-edit-list-item">
								<RichText
									tagName="span"
									className="rj-foot__link"
									value={ link.label }
									allowedFormats={ [] }
									withoutInteractiveFormatting
									placeholder={ __( 'Enlace', 'rejunte' ) }
									onChange={ ( value ) => setLegal( list.patch( legal, index, { label: html( value ) } ) ) }
								/>
								{ isSelected && <RemoveButton label={ __( 'Quitar enlace', 'rejunte' ) } onClick={ () => setLegal( list.remove( legal, index ) ) } /> }
							</li>
						) ) }
						{ isSelected && (
							<li>
								<AddButton label={ __( 'Añadir enlace', 'rejunte' ) } onClick={ () => setLegal( [ ...legal, { label: '', url: '/' } ] ) } />
							</li>
						) }
					</ul>
					<RichText
						tagName="span"
						className="rj-foot__cookies"
						value={ cookiesLabel }
						allowedFormats={ [] }
						withoutInteractiveFormatting
						placeholder={ __( 'Configurar cookies', 'rejunte' ) }
						onChange={ ( value ) => setAttributes( { cookiesLabel: html( value ) } ) }
					/>
				</div>
			</footer>
		</>
	);
}
