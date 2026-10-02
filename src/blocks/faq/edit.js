import { InspectorControls, RichText, useBlockProps } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { AddButton, HeadingLevelControl, RemoveButton, list } from '../../shared/editor';
import { html } from '../../shared/text';

/**
 * Every answer shows open while editing, so questions and answers are typed
 * where they appear; on the site they open on demand.
 */
export default function Edit( { attributes, setAttributes, isSelected } ) {
	const { eyebrow, heading, headingLevel, items } = attributes;
	const setItems = ( next ) => setAttributes( { items: next } );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Título', 'rejunte' ) } initialOpen={ false }>
					<HeadingLevelControl value={ headingLevel } onChange={ ( value ) => setAttributes( { headingLevel: value } ) } />
				</PanelBody>
			</InspectorControls>

			<section { ...useBlockProps( { className: 'rj-faq' } ) }>
				<div className="rj-faq__head">
					<RichText tagName="span" className="rj-eyebrow" value={ eyebrow } allowedFormats={ [] } placeholder={ __( 'Antetítulo', 'rejunte' ) } onChange={ ( value ) => setAttributes( { eyebrow: html( value ) } ) } />
					<RichText tagName={ `h${ headingLevel }` } className="rj-faq__title" value={ heading } allowedFormats={ [] } placeholder={ __( 'Título', 'rejunte' ) } onChange={ ( value ) => setAttributes( { heading: html( value ) } ) } />
				</div>
				<div className="rj-faq__list">
					{ items.map( ( item, index ) => (
						<div key={ index } className="rj-faq__item rj-edit-list-item" data-open="true">
							<RichText
								tagName="div"
								className="rj-faq__question"
								value={ item.question }
								allowedFormats={ [] }
								placeholder={ __( 'Pregunta', 'rejunte' ) }
								onChange={ ( value ) => setItems( list.patch( items, index, { question: html( value ) } ) ) }
							/>
							<RichText
								tagName="p"
								className="rj-faq__answer"
								value={ item.answer }
								allowedFormats={ [ 'core/bold', 'core/italic', 'core/link' ] }
								placeholder={ __( 'Respuesta', 'rejunte' ) }
								onChange={ ( value ) => setItems( list.patch( items, index, { answer: html( value ) } ) ) }
							/>
							{ isSelected && <RemoveButton label={ __( 'Quitar pregunta', 'rejunte' ) } onClick={ () => setItems( list.remove( items, index ) ) } /> }
						</div>
					) ) }
					{ isSelected && <AddButton label={ __( 'Añadir pregunta', 'rejunte' ) } onClick={ () => setItems( [ ...items, { question: '', answer: '' } ] ) } /> }
				</div>
			</section>
		</>
	);
}
