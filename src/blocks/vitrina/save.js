import { RichText, useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

import { bentoStyle } from './effects';

export default function save( { attributes } ) {
	const { anchor, headingLevel, eyebrow, heading, text, clickEffect } = attributes;
	const headingId = `${ anchor || 'rj-vitrina' }-heading`;

	return (
		<section { ...useBlockProps.save( { className: 'rj-vitrina', 'aria-labelledby': headingId } ) }>
			<div className="rj-vitrina__head">
				<div>
					<RichText.Content tagName="span" className="rj-eyebrow" value={ eyebrow } />
					<RichText.Content tagName={ `h${ headingLevel }` } id={ headingId } className="rj-vitrina__title" value={ heading } />
				</div>
				<RichText.Content tagName="p" className="rj-vitrina__text" value={ text } />
			</div>
			<div
				{ ...useInnerBlocksProps.save( {
					className: 'rj-bento',
					'data-enhanced': 'false',
					'data-click': clickEffect ? undefined : 'false',
					style: bentoStyle( attributes ),
				} ) }
			/>
		</section>
	);
}
