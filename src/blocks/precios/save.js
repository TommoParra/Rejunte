import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	return <section { ...useInnerBlocksProps.save( useBlockProps.save( { className: 'rj-precios', 'aria-label': attributes.label } ) ) } />;
}
