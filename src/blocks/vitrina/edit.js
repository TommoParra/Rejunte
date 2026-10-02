import { BlockControls, InspectorControls, RichText, store as blockEditorStore, useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import { createBlock } from '@wordpress/blocks';
import { PanelBody, RangeControl, ToggleControl, ToolbarButton, ToolbarGroup } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

import { HeadingLevelControl } from '../../shared/editor';
import { html } from '../../shared/text';
import { bentoStyle } from './effects';

const TEMPLATE = [
	[ 'rejunte/bento-tile', { variant: 'image', span: '2x2' } ],
	[ 'rejunte/bento-tile', { variant: 'word' } ],
	[ 'rejunte/bento-tile', { variant: 'deep' } ],
	[ 'rejunte/bento-tile', { variant: 'image' } ],
];

/**
 * The mosaic is drawn as the plain resting grid while editing (the cursor
 * effects would fight with clicking into tiles). Tiles are inner blocks, so
 * they move, duplicate and delete with the usual block tools.
 */
export default function Edit( { attributes, setAttributes, clientId } ) {
	const { eyebrow, heading, text, spotlightRadius, enableSpotlight, enableBorderGlow, enableTilt, enableMagnetism, clickEffect } = attributes;
	const set = ( key ) => ( value ) => setAttributes( { [ key ]: html( value ) } );
	const count = useSelect( ( select ) => select( blockEditorStore ).getBlockCount( clientId ), [ clientId ] );
	const { insertBlock } = useDispatch( blockEditorStore );

	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'rj-bento', 'data-enhanced': 'false', style: bentoStyle( attributes ) },
		{
			allowedBlocks: [ 'rejunte/bento-tile' ],
			template: TEMPLATE,
			orientation: 'horizontal',
			renderAppender: false,
		}
	);

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						icon="plus-alt2"
						label={ __( 'Añadir mosaico', 'rejunte' ) }
						onClick={ () => insertBlock( createBlock( 'rejunte/bento-tile', { variant: 'word' } ), count, clientId ) }
					/>
				</ToolbarGroup>
			</BlockControls>

			<InspectorControls>
				<PanelBody title={ __( 'Título', 'rejunte' ) } initialOpen={ false }>
					<HeadingLevelControl value={ attributes.headingLevel } onChange={ ( headingLevel ) => setAttributes( { headingLevel } ) } />
				</PanelBody>
				<PanelBody title={ __( 'Efectos del mosaico', 'rejunte' ) }>
					<ToggleControl __nextHasNoMarginBottom label={ __( 'Foco que sigue al cursor', 'rejunte' ) } checked={ enableSpotlight } onChange={ ( value ) => setAttributes( { enableSpotlight: value } ) } />
					<ToggleControl __nextHasNoMarginBottom label={ __( 'Brillo en el borde al acercarse', 'rejunte' ) } checked={ enableBorderGlow } onChange={ ( value ) => setAttributes( { enableBorderGlow: value } ) } />
					<ToggleControl __nextHasNoMarginBottom label={ __( 'Inclinación', 'rejunte' ) } checked={ enableTilt } onChange={ ( value ) => setAttributes( { enableTilt: value } ) } />
					<ToggleControl __nextHasNoMarginBottom label={ __( 'Atracción hacia el cursor', 'rejunte' ) } checked={ enableMagnetism } onChange={ ( value ) => setAttributes( { enableMagnetism: value } ) } />
					<ToggleControl __nextHasNoMarginBottom label={ __( 'Onda al hacer clic', 'rejunte' ) } checked={ clickEffect } onChange={ ( value ) => setAttributes( { clickEffect: value } ) } />
					<RangeControl __nextHasNoMarginBottom label={ __( 'Radio del foco (px)', 'rejunte' ) } value={ spotlightRadius } min={ 120 } max={ 600 } step={ 10 } onChange={ ( value ) => setAttributes( { spotlightRadius: value } ) } />
					<p className="components-base-control__help">
						{ __( 'Los efectos solo se ven en la página, con ratón, y nunca si el visitante pidió movimiento reducido.', 'rejunte' ) }
					</p>
				</PanelBody>
			</InspectorControls>

			<section { ...useBlockProps( { className: 'rj-vitrina' } ) }>
				<div className="rj-vitrina__head">
					<div>
						<RichText tagName="span" className="rj-eyebrow" value={ eyebrow } allowedFormats={ [] } placeholder={ __( 'Antetítulo', 'rejunte' ) } onChange={ set( 'eyebrow' ) } />
						<RichText tagName={ `h${ attributes.headingLevel }` } className="rj-vitrina__title" value={ heading } allowedFormats={ [] } placeholder={ __( 'Título', 'rejunte' ) } onChange={ set( 'heading' ) } />
					</div>
					<RichText tagName="p" className="rj-vitrina__text" value={ text } allowedFormats={ [ 'core/bold', 'core/italic' ] } placeholder={ __( 'Texto', 'rejunte' ) } onChange={ set( 'text' ) } />
				</div>
				<div { ...innerBlocksProps } />
			</section>
		</>
	);
}
