import { InspectorControls, RichText, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, RangeControl } from '@wordpress/components';
import { Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import { AddButton, RemoveButton, list } from '../../shared/editor';
import { html } from '../../shared/text';

/**
 * The cinta holds still while selected so its words can be edited where they
 * are; the second pass mirrors the first.
 */
export default function Edit( { attributes, setAttributes, isSelected } ) {
	const { items, duration } = attributes;
	const setItems = ( next ) => setAttributes( { items: next } );
	const style = 34 === duration ? undefined : { '--rj-ticker-duration': `${ duration }s` };

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Movimiento', 'rejunte' ) }>
					<RangeControl
						__nextHasNoMarginBottom
						label={ __( 'Segundos por vuelta', 'rejunte' ) }
						value={ duration }
						min={ 10 }
						max={ 90 }
						onChange={ ( value ) => setAttributes( { duration: value } ) }
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...useBlockProps( { className: 'rj-ticker', style } ) }>
				<div className="rj-ticker__rail">
					<span className="rj-ticker__group">
						{ items.map( ( item, index ) => (
							<Fragment key={ index }>
								<span className="rj-edit-list-item">
									<RichText
										tagName="span"
										value={ item }
										allowedFormats={ [] }
										placeholder={ __( 'Palabra', 'rejunte' ) }
										onChange={ ( value ) => setItems( list.set( items, index, html( value ) ) ) }
									/>
									{ isSelected && (
										<RemoveButton label={ __( 'Quitar', 'rejunte' ) } onClick={ () => setItems( list.remove( items, index ) ) } />
									) }
								</span>
								<span className="rj-ticker__sep">✦</span>
							</Fragment>
						) ) }
						{ isSelected && <AddButton label={ __( 'Añadir palabra', 'rejunte' ) } onClick={ () => setItems( [ ...items, '' ] ) } /> }
					</span>
					<span className="rj-ticker__group" aria-hidden="true">
						{ items.map( ( item, index ) => (
							<Fragment key={ index }>
								<RichText.Content tagName="span" value={ item } />
								<span className="rj-ticker__sep">✦</span>
							</Fragment>
						) ) }
					</span>
				</div>
			</div>
		</>
	);
}
