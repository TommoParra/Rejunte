import { BlockControls, InspectorControls, RichText, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, TextControl, ToolbarDropdownMenu, ToolbarGroup } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { AltTextControl, EditableImage } from '../../shared/editor';
import { html, plain } from '../../shared/text';
import { glowClass, imageSlot } from './shared';

const VARIANTS = [
	{ value: 'image', title: __( 'Foto', 'rejunte' ), icon: 'format-image' },
	{ value: 'word', title: __( 'Palabra', 'rejunte' ), icon: 'editor-textcolor' },
	{ value: 'deep', title: __( 'Dato destacado', 'rejunte' ), icon: 'info' },
];

const SPANS = [
	{ value: '', title: __( '1 × 1', 'rejunte' ) },
	{ value: '2x1', title: __( '2 × 1 (ancho)', 'rejunte' ) },
	{ value: '2x2', title: __( '2 × 2 (grande)', 'rejunte' ) },
];

export default function Edit( { attributes, setAttributes, isSelected } ) {
	const { variant, span, image, word, wordSize, label, kicker, display } = attributes;
	const slot = imageSlot( span );
	const set = ( key ) => ( value ) => setAttributes( { [ key ]: html( value ) } );
	const current = VARIANTS.find( ( item ) => item.value === variant ) || VARIANTS[ 0 ];

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarDropdownMenu
						icon={ current.icon }
						label={ __( 'Tipo de pieza', 'rejunte' ) }
						controls={ VARIANTS.map( ( item ) => ( {
							title: item.title,
							icon: item.icon,
							isActive: item.value === variant,
							onClick: () => setAttributes( { variant: item.value } ),
						} ) ) }
					/>
					<ToolbarDropdownMenu
						icon="editor-expand"
						label={ __( 'Tamaño en el mosaico', 'rejunte' ) }
						controls={ SPANS.map( ( item ) => ( {
							title: item.title,
							isActive: item.value === span,
							onClick: () => setAttributes( { span: item.value } ),
						} ) ) }
					/>
					{ 'word' === variant && (
						<ToolbarDropdownMenu
							icon="editor-textcolor"
							label={ __( 'Tamaño de la palabra', 'rejunte' ) }
							controls={ [
								{ title: __( 'Normal', 'rejunte' ), isActive: 'normal' === wordSize, onClick: () => setAttributes( { wordSize: 'normal' } ) },
								{ title: __( 'Grande', 'rejunte' ), isActive: 'big' === wordSize, onClick: () => setAttributes( { wordSize: 'big' } ) },
							] }
						/>
					) }
				</ToolbarGroup>
			</BlockControls>

			<InspectorControls>
				{ 'image' === variant && (
					<PanelBody title={ __( 'Foto', 'rejunte' ) }>
						<AltTextControl image={ image } onChange={ ( next ) => setAttributes( { image: next } ) } />
					</PanelBody>
				) }
				{ 'word' === variant && (
					<PanelBody title={ __( 'Accesibilidad', 'rejunte' ) }>
						<TextControl
							__nextHasNoMarginBottom
							label={ __( 'Cómo se lee', 'rejunte' ) }
							help={ __( 'La palabra se parte en sílabas para el ojo; esto es lo que oye un lector de pantalla.', 'rejunte' ) }
							value={ label }
							placeholder={ plain( word ) }
							onChange={ ( value ) => setAttributes( { label: value } ) }
						/>
					</PanelBody>
				) }
			</InspectorControls>

			<div
				{ ...useBlockProps( {
					className: `rj-tile rj-tile--${ variant }`,
					'data-bento-card': '',
					'data-span': span || undefined,
				} ) }
			>
				{ 'image' === variant && (
					<EditableImage
						image={ image }
						ratio={ slot.ratio }
						isSelected={ isSelected }
						onChange={ ( next ) => setAttributes( { image: next } ) }
					/>
				) }
				{ 'word' === variant && (
					<RichText
						tagName="span"
						className={ `rj-tile__word${ 'big' === wordSize ? ' rj-tile__word--big' : '' }` }
						value={ word }
						allowedFormats={ [] }
						placeholder={ __( 'PALABRA', 'rejunte' ) }
						onChange={ set( 'word' ) }
					/>
				) }
				{ 'deep' === variant && (
					<>
						<RichText tagName="span" className="rj-tile__kicker" value={ kicker } allowedFormats={ [] } placeholder={ __( 'Antetítulo', 'rejunte' ) } onChange={ set( 'kicker' ) } />
						<RichText tagName="span" className="rj-tile__display" value={ display } allowedFormats={ [] } placeholder={ __( 'Dato', 'rejunte' ) } onChange={ set( 'display' ) } />
					</>
				) }
				<span data-bento-glow="" className={ glowClass( variant ) } aria-hidden="true"></span>
			</div>
		</>
	);
}
