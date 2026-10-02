/**
 * Editor building blocks shared by every Rejunte block.
 *
 * The design goal is that editing a block looks exactly like the page: these
 * controls either sit outside the content (toolbar, sidebar) or float over it
 * only while the block is selected.
 */
import * as blockEditor from '@wordpress/block-editor';
import { Popover, SelectControl, TextareaControl, ToolbarButton } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import { RjImage, imageFromMedia } from '../image';

const { MediaUpload, MediaUploadCheck } = blockEditor;
const LinkControl = blockEditor.LinkControl || blockEditor.__experimentalLinkControl;

/**
 * URL of one of the theme's own brand images, for slots that fall back to them.
 *
 * @param {string} key Brand image key.
 * @return {string|undefined} URL.
 */
export function brandUrl( key ) {
	return window.rejunteTheme?.brand?.[ key ]?.url;
}

/**
 * An image slot that can be changed in place.
 *
 * @param {Object}   props
 * @param {Object}   props.image      Image attribute.
 * @param {Function} props.onChange   Receives the new image attribute.
 * @param {boolean}  props.isSelected Show the controls.
 * @param {string}   [props.brand]    Theme brand image used when empty.
 */
export function EditableImage( { image = {}, onChange, isSelected, brand, ...props } ) {
	return (
		<RjImage
			image={ image }
			brand={ brand }
			brandUrl={ brand && ! image?.url ? brandUrl( brand ) : undefined }
			loading="eager"
			{ ...props }
		>
			{ isSelected && (
				<MediaUploadCheck>
					<span className="rj-edit-image__actions">
						<MediaUpload
							allowedTypes={ [ 'image' ] }
							value={ image?.id }
							onSelect={ ( media ) => onChange( imageFromMedia( media ) ) }
							render={ ( { open } ) => (
								<button type="button" className="rj-edit-chip" onClick={ open }>
									{ image?.url ? __( 'Cambiar imagen', 'rejunte' ) : __( 'Elegir imagen', 'rejunte' ) }
								</button>
							) }
						/>
						{ image?.url && (
							<button
								type="button"
								className="rj-edit-chip rj-edit-chip--light"
								onClick={ () => onChange( {} ) }
							>
								{ brand ? __( 'Usar la del tema', 'rejunte' ) : __( 'Quitar', 'rejunte' ) }
							</button>
						) }
					</span>
				</MediaUploadCheck>
			) }
		</RjImage>
	);
}

/**
 * Sidebar field for an image's alternative text.
 *
 * @param {Object}   props
 * @param {Object}   props.image    Image attribute.
 * @param {Function} props.onChange Receives the updated image attribute.
 * @param {string}   [props.label]  Field label.
 * @param {string}   [props.help]   Help text.
 */
export function AltTextControl( { image = {}, onChange, label, help } ) {
	return (
		<TextareaControl
			__nextHasNoMarginBottom
			label={ label || __( 'Texto alternativo', 'rejunte' ) }
			help={ help || __( 'Describe la foto para quien no la ve. Déjalo vacío si es decorativa.', 'rejunte' ) }
			value={ image.alt || '' }
			onChange={ ( alt ) => onChange( { ...image, alt } ) }
		/>
	);
}

/**
 * Toolbar button that edits a URL with core's link control.
 *
 * @param {Object}   props
 * @param {string}   props.url      Current URL.
 * @param {Function} props.onChange Receives the new URL.
 * @param {string}   [props.label]  Button label.
 */
export function LinkButton( { url, onChange, label } ) {
	const [ open, setOpen ] = useState( false );
	const [ anchor, setAnchor ] = useState( null );

	return (
		<>
			<ToolbarButton
				ref={ setAnchor }
				icon="admin-links"
				label={ label || __( 'Enlace', 'rejunte' ) }
				isPressed={ open || !! url }
				onClick={ () => setOpen( ( value ) => ! value ) }
			/>
			{ open && (
				<Popover anchor={ anchor } placement="bottom" shift onClose={ () => setOpen( false ) }>
					<LinkControl
						value={ { url } }
						settings={ [] }
						forceIsEditingLink={ ! url }
						onChange={ ( next ) => onChange( next?.url ?? '' ) }
						onRemove={ () => {
							onChange( '' );
							setOpen( false );
						} }
					/>
				</Popover>
			) }
		</>
	);
}

/**
 * Heading level of a section's title. A section that opens a page carries the
 * page's only H1; anywhere else it is an H2.
 *
 * @param {Object}   props
 * @param {number}   props.value    1 or 2.
 * @param {Function} props.onChange Receives the new level.
 */
export function HeadingLevelControl( { value, onChange } ) {
	return (
		<SelectControl
			__nextHasNoMarginBottom
			label={ __( 'Nivel del título', 'rejunte' ) }
			help={ __( 'H1 solo si esta sección abre la página: cada página tiene un único H1.', 'rejunte' ) }
			value={ String( value ) }
			options={ [
				{ value: '1', label: __( 'H1 · título de la página', 'rejunte' ) },
				{ value: '2', label: __( 'H2 · sección', 'rejunte' ) },
			] }
			onChange={ ( next ) => onChange( Number( next ) ) }
		/>
	);
}

/**
 * Small floating "×" to remove an item from an inline list.
 *
 * @param {Object}   props
 * @param {Function} props.onClick Remove handler.
 * @param {string}   props.label   Accessible label.
 */
export function RemoveButton( { onClick, label } ) {
	return (
		<button
			type="button"
			className="rj-edit-chip rj-edit-chip--round rj-edit-chip--remove"
			aria-label={ label }
			title={ label }
			onClick={ onClick }
		>
			×
		</button>
	);
}

/**
 * "+" chip to add an item to an inline list.
 *
 * @param {Object}   props
 * @param {Function} props.onClick   Add handler.
 * @param {string}   props.label     Accessible label.
 * @param {string}   [props.className] Extra class.
 */
export function AddButton( { onClick, label, className } ) {
	return (
		<button
			type="button"
			className={ [ 'rj-edit-chip rj-edit-chip--round rj-edit-add', className ].filter( Boolean ).join( ' ' ) }
			aria-label={ label }
			title={ label }
			onClick={ onClick }
		>
			+
		</button>
	);
}

/**
 * Immutable array helpers for list attributes.
 */
export const list = {
	set: ( items, index, value ) => items.map( ( item, i ) => ( i === index ? value : item ) ),
	patch: ( items, index, patch ) => items.map( ( item, i ) => ( i === index ? { ...item, ...patch } : item ) ),
	remove: ( items, index ) => items.filter( ( _, i ) => i !== index ),
	insert: ( items, index, value ) => [ ...items.slice( 0, index ), value, ...items.slice( index ) ],
	move: ( items, from, to ) => {
		if ( to < 0 || to >= items.length ) {
			return items;
		}
		const next = [ ...items ];
		const [ item ] = next.splice( from, 1 );
		next.splice( to, 0, item );
		return next;
	},
};
