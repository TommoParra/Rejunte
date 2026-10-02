/**
 * WooCommerce helpers for the editor: product search and live product data,
 * both through the public Store API.
 */
import apiFetch from '@wordpress/api-fetch';
import { ComboboxControl } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Whether the store is active (the theme passes its URLs only when it is).
 *
 * @return {boolean} Active.
 */
export function hasStore() {
	return !! window.rejunteTheme?.shop;
}

/**
 * Price of a Store API product as a decimal string ("14", "9.5").
 *
 * @param {Object} product Store API product.
 * @return {string} Price.
 */
export function productPrice( product ) {
	const prices = product?.prices;
	if ( ! prices?.price ) {
		return '';
	}
	return String( Number( prices.price ) / 10 ** ( prices.currency_minor_unit ?? 2 ) );
}

/**
 * Fetch one product, kept fresh while the block is open.
 *
 * @param {number} id Product ID.
 * @return {Object|null|undefined} Product, null when missing, undefined while loading.
 */
export function useProduct( id ) {
	const [ product, setProduct ] = useState( undefined );

	useEffect( () => {
		if ( ! id ) {
			setProduct( null );
			return undefined;
		}
		let cancelled = false;
		apiFetch( { path: `/wc/store/v1/products/${ id }` } )
			.then( ( data ) => ! cancelled && setProduct( data ) )
			.catch( () => ! cancelled && setProduct( null ) );
		return () => {
			cancelled = true;
		};
	}, [ id ] );

	return product;
}

/**
 * Searchable product picker.
 *
 * @param {Object}   props
 * @param {number}   props.value    Selected product ID.
 * @param {Function} props.onChange Receives the Store API product, or null.
 * @param {string}   [props.label]  Field label.
 * @param {string}   [props.help]   Help text.
 */
export function ProductPicker( { value, onChange, label, help } ) {
	const [ options, setOptions ] = useState( [] );
	const [ products, setProducts ] = useState( {} );
	const [ search, setSearch ] = useState( '' );
	const selected = useProduct( value );

	useEffect( () => {
		let cancelled = false;
		const query = new URLSearchParams( { per_page: '20', search } );
		apiFetch( { path: `/wc/store/v1/products?${ query }` } )
			.then( ( list ) => {
				if ( cancelled ) {
					return;
				}
				setProducts( ( known ) => ( { ...known, ...Object.fromEntries( list.map( ( item ) => [ item.id, item ] ) ) } ) );
				setOptions( list.map( ( item ) => ( { value: String( item.id ), label: item.name } ) ) );
			} )
			.catch( () => {} );
		return () => {
			cancelled = true;
		};
	}, [ search ] );

	// Keep the current product selectable even when it is not in the results.
	const all = selected && ! options.some( ( option ) => option.value === String( selected.id ) )
		? [ { value: String( selected.id ), label: selected.name }, ...options ]
		: options;

	return (
		<ComboboxControl
			__nextHasNoMarginBottom
			__next40pxDefaultSize
			label={ label || __( 'Producto de la tienda', 'rejunte' ) }
			help={ help }
			value={ value ? String( value ) : null }
			options={ all }
			onFilterValueChange={ setSearch }
			onChange={ ( next ) => onChange( next ? products[ next ] || ( selected?.id === Number( next ) ? selected : { id: Number( next ) } ) : null ) }
		/>
	);
}
