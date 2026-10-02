import { BlockControls, InspectorControls, store as blockEditorStore, useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import { createBlock } from '@wordpress/blocks';
import { PanelBody, TextControl, ToolbarButton, ToolbarGroup } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

const TEMPLATE = [ [ 'rejunte/price-card' ], [ 'rejunte/price-card' ], [ 'rejunte/price-card' ] ];

export default function Edit( { attributes, setAttributes, clientId } ) {
	const count = useSelect( ( select ) => select( blockEditorStore ).getBlockCount( clientId ), [ clientId ] );
	const { insertBlock } = useDispatch( blockEditorStore );

	const innerBlocksProps = useInnerBlocksProps( useBlockProps( { className: 'rj-precios' } ), {
		allowedBlocks: [ 'rejunte/price-card' ],
		template: TEMPLATE,
		orientation: 'horizontal',
		renderAppender: false,
	} );

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						icon="plus-alt2"
						label={ __( 'Añadir tarjeta', 'rejunte' ) }
						onClick={ () => insertBlock( createBlock( 'rejunte/price-card' ), count, clientId ) }
					/>
				</ToolbarGroup>
			</BlockControls>
			<InspectorControls>
				<PanelBody title={ __( 'Accesibilidad', 'rejunte' ) }>
					<TextControl
						__nextHasNoMarginBottom
						label={ __( 'Nombre de la sección', 'rejunte' ) }
						help={ __( 'La sección no tiene título visible; así la anuncia un lector de pantalla.', 'rejunte' ) }
						value={ attributes.label }
						onChange={ ( value ) => setAttributes( { label: value } ) }
					/>
				</PanelBody>
			</InspectorControls>
			<section { ...innerBlocksProps } />
		</>
	);
}
