import { RichText, useBlockProps } from '@wordpress/block-editor';

/**
 * Native <details>: opens and closes without any script, with the keyboard and
 * screen readers' own support.
 */
export default function save( { attributes } ) {
	const { anchor, eyebrow, heading, headingLevel, items } = attributes;
	const headingId = `${ anchor || 'rj-faq' }-heading`;

	return (
		<section { ...useBlockProps.save( { className: 'rj-faq', 'aria-labelledby': headingId } ) }>
			<div className="rj-faq__head">
				<RichText.Content tagName="span" className="rj-eyebrow" value={ eyebrow } />
				<RichText.Content tagName={ `h${ headingLevel }` } id={ headingId } className="rj-faq__title" value={ heading } />
			</div>
			<div className="rj-faq__list">
				{ items.map( ( item, index ) => (
					<details key={ index } className="rj-faq__item">
						<summary className="rj-faq__question">
							<RichText.Content value={ item.question } />
						</summary>
						<RichText.Content tagName="p" className="rj-faq__answer" value={ item.answer } />
					</details>
				) ) }
			</div>
		</section>
	);
}
