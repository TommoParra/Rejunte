import { RichText, useBlockProps } from '@wordpress/block-editor';

import { RjImage } from '../../shared/image';

export default function save( { attributes } ) {
	const { anchor, headingLevel, eyebrow, heading, text, chips, buttonLabel, buttonUrl, image, photoAnchor } = attributes;
	const headingId = `${ anchor || 'rj-encargos' }-heading`;

	return (
		<section { ...useBlockProps.save( { className: 'rj-encargos', 'aria-labelledby': headingId } ) }>
			<div className="rj-encargos__panel">
				<div className="rj-encargos__copy">
					<RichText.Content tagName="span" className="rj-eyebrow" value={ eyebrow } />
					<RichText.Content tagName={ `h${ headingLevel }` } id={ headingId } className="rj-encargos__title" value={ heading } />
					<RichText.Content tagName="p" className="rj-encargos__text" value={ text } />
					{ chips.length > 0 && (
						<ul className="rj-chips">
							{ chips.map( ( chip, index ) => (
								<RichText.Content key={ index } tagName="li" value={ chip } />
							) ) }
						</ul>
					) }
					{ buttonLabel && (
						<a className="rj-button" href={ buttonUrl }>
							<RichText.Content value={ buttonLabel } />
						</a>
					) }
				</div>
				<div id={ photoAnchor || undefined } className="rj-encargos__photo">
					<RjImage image={ image } ratio="4 / 5" sizes="(max-width: 62rem) 100vw, 460px" />
				</div>
			</div>
		</section>
	);
}
