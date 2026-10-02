import { RichText, useBlockProps } from '@wordpress/block-editor';

import { RjImage } from '../../shared/image';
import { glowClass, imageSlot } from './shared';

export default function save( { attributes } ) {
	const { variant, span, image, word, wordSize, label, kicker, display } = attributes;
	const slot = imageSlot( span );

	return (
		<div
			{ ...useBlockProps.save( {
				className: `rj-tile rj-tile--${ variant }`,
				'data-bento-card': '',
				'data-span': span || undefined,
			} ) }
		>
			{ 'image' === variant && <RjImage image={ image } ratio={ slot.ratio } sizes={ slot.sizes } /> }
			{ 'word' === variant && (
				<>
					{ /* Split into syllables for the eye; read as one word. */ }
					<RichText.Content
						tagName="span"
						className={ `rj-tile__word${ 'big' === wordSize ? ' rj-tile__word--big' : '' }` }
						aria-hidden={ label ? 'true' : undefined }
						value={ word }
					/>
					{ label && <span className="screen-reader-text">{ label }</span> }
				</>
			) }
			{ 'deep' === variant && (
				<>
					<RichText.Content tagName="span" className="rj-tile__kicker" value={ kicker } />
					<RichText.Content tagName="span" className="rj-tile__display" value={ display } />
				</>
			) }
			<span data-bento-glow="" className={ glowClass( variant ) } aria-hidden="true"></span>
		</div>
	);
}
