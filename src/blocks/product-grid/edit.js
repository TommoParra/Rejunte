import { InspectorControls, RichText, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, RangeControl, SelectControl, ToggleControl } from '@wordpress/components';
import { store as coreStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import ServerSideRender from '@wordpress/server-side-render';

import { html } from '../../shared/text';

/**
 * The cards are the server's own output, so they look exactly as on the site;
 * the heading above them is edited in place.
 */
export default function Edit( { attributes, setAttributes, isSelected, context: { postId } } ) {
	const { source, category, count, eyebrow, heading, showCategories } = attributes;
	const terms = useSelect( ( select ) => select( coreStore ).getEntityRecords( 'taxonomy', 'product_cat', { per_page: 100 } ), [] );
	const categories = terms ?? [];

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Qué productos', 'rejunte' ) }>
					<SelectControl
						__nextHasNoMarginBottom
						label={ __( 'Mostrar', 'rejunte' ) }
						value={ source }
						options={ [
							{ value: 'query', label: __( 'Los de la página (tienda, categoría, búsqueda)', 'rejunte' ) },
							{ value: 'related', label: __( 'Relacionados con este producto', 'rejunte' ) },
							{ value: 'latest', label: __( 'Los primeros de la vitrina', 'rejunte' ) },
							{ value: 'category', label: __( 'Los de una categoría', 'rejunte' ) },
						] }
						onChange={ ( value ) => setAttributes( { source: value } ) }
					/>
					{ 'category' === source && (
						<SelectControl
							__nextHasNoMarginBottom
							label={ __( 'Categoría', 'rejunte' ) }
							value={ String( category ) }
							options={ [ { value: '0', label: '—' }, ...categories.map( ( term ) => ( { value: String( term.id ), label: term.name } ) ) ] }
							onChange={ ( value ) => setAttributes( { category: Number( value ) } ) }
						/>
					) }
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __( 'Mostrar las categorías encima', 'rejunte' ) }
						checked={ showCategories }
						onChange={ ( value ) => setAttributes( { showCategories: value } ) }
					/>
					{ 'query' !== source && (
						<RangeControl __nextHasNoMarginBottom label={ __( 'Cantidad', 'rejunte' ) } value={ count } min={ 1 } max={ 12 } onChange={ ( value ) => setAttributes( { count: value } ) } />
					) }
				</PanelBody>
			</InspectorControls>

			<section { ...useBlockProps( { className: 'rj-products' } ) }>
				{ ( isSelected || eyebrow || heading ) && (
					<div className="rj-products__head">
						<RichText tagName="span" className="rj-eyebrow" value={ eyebrow } allowedFormats={ [] } placeholder={ __( 'Antetítulo (opcional)', 'rejunte' ) } onChange={ ( value ) => setAttributes( { eyebrow: html( value ) } ) } />
						<RichText tagName="h2" className="rj-products__title" value={ heading } allowedFormats={ [] } placeholder={ __( 'Título (opcional)', 'rejunte' ) } onChange={ ( value ) => setAttributes( { heading: html( value ) } ) } />
					</div>
				) }
				<div className="rj-products__preview" inert="">
					<ServerSideRender
						block="rejunte/product-grid"
						attributes={ { ...attributes, eyebrow: '', heading: '', isPreview: true } }
						urlQueryArgs={ postId ? { post_id: postId } : {} }
					/>
				</div>
			</section>
		</>
	);
}
