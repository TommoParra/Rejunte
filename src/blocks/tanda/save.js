import { RichText, useBlockProps } from '@wordpress/block-editor';

import { distance, placement } from '../../shared/gallery';
import { RjImage } from '../../shared/image';
import { plain } from '../../shared/text';

/**
 * Saved at rest: every item carries the transform it has before anyone drags,
 * so the curve is drawn by HTML and CSS alone and the script only adds motion.
 */
export default function save( { attributes } ) {
	const { anchor, headingLevel, eyebrow, heading, hint, items, label, prevLabel, nextLabel, bend, scrollSpeed, scrollEase } = attributes;
	const headingId = `${ anchor || 'rj-tanda' }-heading`;

	return (
		<section { ...useBlockProps.save( { className: 'rj-tanda', 'aria-labelledby': headingId } ) }>
			<div className="rj-tanda__head">
				<RichText.Content tagName="span" className="rj-eyebrow" value={ eyebrow } />
				<RichText.Content tagName={ `h${ headingLevel }` } id={ headingId } className="rj-tanda__title" value={ heading } />
			</div>
			<div className="rj-gallery" data-bend={ bend } data-scroll-speed={ scrollSpeed } data-scroll-ease={ scrollEase }>
				<div className="rj-gallery__stage" data-dragging="false" role="group" aria-label={ label } tabIndex="0">
					<ul className="rj-gallery__track">
						{ items.map( ( item, index ) => (
							<li
								key={ index }
								className="rj-gallery__item"
								style={ placement( distance( index, 0, items.length ), bend ) }
								aria-current={ 0 === index ? 'true' : undefined }
								data-caption={ plain( item.caption ) }
							>
								<RjImage image={ item } ratio="5 / 6.6" sizes="250px" />
							</li>
						) ) }
					</ul>
				</div>
				<div className="rj-gallery__controls">
					<button type="button" className="rj-gallery__prev" aria-label={ prevLabel }>
						←
					</button>
					<p className="rj-gallery__caption" aria-live="polite">
						{ plain( items[ 0 ]?.caption ) }
					</p>
					<button type="button" className="rj-gallery__next" aria-label={ nextLabel }>
						→
					</button>
				</div>
			</div>
			<RichText.Content tagName="span" className="rj-tanda__hint" value={ hint } />
		</section>
	);
}
