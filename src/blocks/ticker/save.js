import { RichText, useBlockProps } from '@wordpress/block-editor';
import { Fragment } from '@wordpress/element';

/**
 * Two identical passes of the words; the rail slides by exactly one pass, so
 * the loop has no seam. Hidden from assistive technology: it repeats the
 * gallery's captions and would only be read as noise.
 */
export default function save( { attributes } ) {
	const { items, duration } = attributes;
	const style = 34 === duration ? undefined : { '--rj-ticker-duration': `${ duration }s` };

	return (
		<div { ...useBlockProps.save( { className: 'rj-ticker', 'aria-hidden': 'true', style } ) }>
			<div className="rj-ticker__rail">
				{ [ 0, 1 ].map( ( pass ) => (
					<span key={ pass } className="rj-ticker__group">
						{ items.map( ( item, index ) => (
							<Fragment key={ index }>
								<RichText.Content tagName="span" value={ item } />
								<span className="rj-ticker__sep">✦</span>
							</Fragment>
						) ) }
					</span>
				) ) }
			</div>
		</div>
	);
}
