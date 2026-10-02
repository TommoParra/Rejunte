import { BlockControls, InspectorControls, MediaUpload, MediaUploadCheck, RichText, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, RangeControl, TextControl, ToolbarButton, ToolbarGroup } from '@wordpress/components';
import { useLayoutEffect, useRef, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

import { AltTextControl, HeadingLevelControl, list } from '../../shared/editor';
import { createGallery } from '../../shared/gallery';
import { RjImage, imageFromMedia } from '../../shared/image';
import { html } from '../../shared/text';

/**
 * The gallery moves in the editor exactly as on the site (same engine). The
 * photo in the centre is the one being edited: its caption is typed under the
 * gallery, its image and alt text change from the controls on it and in the
 * sidebar, and it can be moved or removed from the toolbar.
 */
export default function Edit( { attributes, setAttributes, isSelected } ) {
	const { eyebrow, heading, hint, items, label, prevLabel, nextLabel, bend, scrollSpeed, scrollEase } = attributes;
	const root = useRef( null );
	const engine = useRef( null );
	const [ active, setActive ] = useState( 0 );

	const current = items[ active ];
	const setItems = ( next ) => setAttributes( { items: next } );
	const set = ( key ) => ( value ) => setAttributes( { [ key ]: html( value ) } );

	// Layout effects, so items are placed before the first paint.
	useLayoutEffect( () => {
		if ( ! root.current ) {
			return undefined;
		}
		engine.current = createGallery( root.current, {
			bend,
			scrollSpeed,
			scrollEase,
			onActive: ( index ) => setActive( index ),
		} );
		return () => engine.current?.destroy();
	}, [ bend, scrollSpeed, scrollEase ] );

	// React re-creates items when they change; place them again, centring the
	// one just added or moved.
	const centre = useRef( null );
	useLayoutEffect( () => {
		const index = centre.current;
		centre.current = null;
		engine.current?.refresh( typeof index === 'number' ? Math.min( index, Math.max( 0, items.length - 1 ) ) : undefined );
	}, [ items ] );

	const moveTo = ( from, to ) => {
		const target = ( to + items.length ) % items.length;
		centre.current = target;
		setItems( list.move( items, from, target ) );
	};

	const addPhotos = ( media ) => {
		const added = ( Array.isArray( media ) ? media : [ media ] ).map( ( item ) => ( { ...imageFromMedia( item ), caption: '' } ) );
		const index = items.length ? active + 1 : 0;
		centre.current = index;
		setItems( [ ...items.slice( 0, index ), ...added, ...items.slice( index ) ] );
	};

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<MediaUploadCheck>
						<MediaUpload
							allowedTypes={ [ 'image' ] }
							multiple
							onSelect={ addPhotos }
							render={ ( { open } ) => (
								<ToolbarButton icon="plus-alt2" label={ __( 'Añadir fotos', 'rejunte' ) } onClick={ open } />
							) }
						/>
					</MediaUploadCheck>
				</ToolbarGroup>
				{ current && (
					<ToolbarGroup>
						<ToolbarButton
							icon="arrow-left-alt2"
							label={ __( 'Mover la foto a la izquierda', 'rejunte' ) }
							onClick={ () => moveTo( active, active - 1 ) }
						/>
						<ToolbarButton
							icon="arrow-right-alt2"
							label={ __( 'Mover la foto a la derecha', 'rejunte' ) }
							onClick={ () => moveTo( active, active + 1 ) }
						/>
						<ToolbarButton
							icon="trash"
							label={ __( 'Quitar esta foto', 'rejunte' ) }
							onClick={ () => {
								centre.current = Math.max( 0, active - 1 );
								setItems( list.remove( items, active ) );
							} }
						/>
					</ToolbarGroup>
				) }
			</BlockControls>

			<InspectorControls>
				<PanelBody title={ __( 'Título', 'rejunte' ) } initialOpen={ false }>
					<HeadingLevelControl value={ attributes.headingLevel } onChange={ ( headingLevel ) => setAttributes( { headingLevel } ) } />
				</PanelBody>
				{ current && (
					<PanelBody
						title={ sprintf(
							/* translators: 1: position, 2: total. */
							__( 'Foto %1$d de %2$d', 'rejunte' ),
							active + 1,
							items.length
						) }
					>
						<AltTextControl image={ current } onChange={ ( next ) => setItems( list.set( items, active, next ) ) } />
					</PanelBody>
				) }
				<PanelBody title={ __( 'Movimiento', 'rejunte' ) } initialOpen={ false }>
					<RangeControl
						__nextHasNoMarginBottom
						label={ __( 'Curvatura', 'rejunte' ) }
						value={ bend }
						min={ 0 }
						max={ 4 }
						step={ 0.1 }
						onChange={ ( value ) => setAttributes( { bend: value } ) }
					/>
					<RangeControl
						__nextHasNoMarginBottom
						label={ __( 'Velocidad de arrastre', 'rejunte' ) }
						value={ scrollSpeed }
						min={ 0.5 }
						max={ 2 }
						step={ 0.1 }
						onChange={ ( value ) => setAttributes( { scrollSpeed: value } ) }
					/>
					<RangeControl
						__nextHasNoMarginBottom
						label={ __( 'Suavidad', 'rejunte' ) }
						value={ scrollEase }
						min={ 0.02 }
						max={ 0.3 }
						step={ 0.005 }
						onChange={ ( value ) => setAttributes( { scrollEase: value } ) }
					/>
				</PanelBody>
				<PanelBody title={ __( 'Accesibilidad', 'rejunte' ) } initialOpen={ false }>
					<TextControl __nextHasNoMarginBottom label={ __( 'Descripción de la galería', 'rejunte' ) } value={ label } onChange={ ( value ) => setAttributes( { label: value } ) } />
					<TextControl __nextHasNoMarginBottom label={ __( 'Botón anterior', 'rejunte' ) } value={ prevLabel } onChange={ ( value ) => setAttributes( { prevLabel: value } ) } />
					<TextControl __nextHasNoMarginBottom label={ __( 'Botón siguiente', 'rejunte' ) } value={ nextLabel } onChange={ ( value ) => setAttributes( { nextLabel: value } ) } />
				</PanelBody>
			</InspectorControls>

			<section { ...useBlockProps( { className: 'rj-tanda' } ) }>
				<div className="rj-tanda__head">
					<RichText tagName="span" className="rj-eyebrow" value={ eyebrow } allowedFormats={ [] } placeholder={ __( 'Antetítulo', 'rejunte' ) } onChange={ set( 'eyebrow' ) } />
					<RichText tagName={ `h${ attributes.headingLevel }` } className="rj-tanda__title" value={ heading } allowedFormats={ [] } placeholder={ __( 'Título', 'rejunte' ) } onChange={ set( 'heading' ) } />
				</div>
				<div className="rj-gallery" ref={ root }>
					<div className="rj-gallery__stage" data-dragging="false" role="group" aria-label={ label } tabIndex="0">
						<ul className="rj-gallery__track">
							{ items.map( ( item, index ) => (
								<li key={ `${ item.id || item.url || 'empty' }-${ index }` } className="rj-gallery__item">
									<RjImage image={ item } ratio="5 / 6.6" loading="eager">
										{ isSelected && index === active && (
											<MediaUploadCheck>
												<span className="rj-edit-image__actions">
													<MediaUpload
														allowedTypes={ [ 'image' ] }
														value={ item.id }
														onSelect={ ( media ) => setItems( list.set( items, index, { ...imageFromMedia( media ), caption: item.caption } ) ) }
														render={ ( { open } ) => (
															<button type="button" className="rj-edit-chip" onClick={ open }>
																{ __( 'Cambiar foto', 'rejunte' ) }
															</button>
														) }
													/>
												</span>
											</MediaUploadCheck>
										) }
									</RjImage>
								</li>
							) ) }
						</ul>
					</div>
					<div className="rj-gallery__controls">
						<button type="button" className="rj-gallery__prev" aria-label={ prevLabel } onClick={ () => engine.current?.step( -1 ) }>
							←
						</button>
						{ current ? (
							<RichText
								tagName="p"
								className="rj-gallery__caption"
								value={ current.caption }
								allowedFormats={ [] }
								placeholder={ __( 'Pie de foto', 'rejunte' ) }
								onChange={ ( caption ) => setItems( list.patch( items, active, { caption: html( caption ) } ) ) }
							/>
						) : (
							<p className="rj-gallery__caption">{ __( 'Añadí fotos desde la barra de herramientas', 'rejunte' ) }</p>
						) }
						<button type="button" className="rj-gallery__next" aria-label={ nextLabel } onClick={ () => engine.current?.step( 1 ) }>
							→
						</button>
					</div>
				</div>
				<RichText tagName="span" className="rj-tanda__hint" value={ hint } allowedFormats={ [] } placeholder={ __( 'Indicación', 'rejunte' ) } onChange={ set( 'hint' ) } />
			</section>
		</>
	);
}
