import { RichText, useBlockProps } from '@wordpress/block-editor';

import { euros, plain, slug } from '../../shared/text';

/**
 * Linked to a product, "Sumar" is a real add-to-cart form: it works without
 * JavaScript, and view.js upgrades it to an in-place add. The server refreshes
 * the price, link and form target from the product on every render.
 */
export default function save( { attributes } ) {
	const { productId, url, kicker, name, body, price, buttonLabel, addedLabel } = attributes;
	const key = productId ? String( productId ) : slug( name );
	const nameId = `rj-price-${ key }`;
	const label = plain( buttonLabel );

	const button = (
		<button
			type={ productId ? 'submit' : 'button' }
			name={ productId ? 'add-to-cart' : undefined }
			value={ key }
			className="rj-button rj-button--ghost"
			aria-describedby={ nameId }
			data-rj-add=""
			data-label={ label }
			data-label-added={ plain( addedLabel ) }
		>
			{ label }
		</button>
	);

	return (
		<article { ...useBlockProps.save( { className: 'rj-price' } ) }>
			<RichText.Content tagName="span" className="rj-price__kicker" value={ kicker } />
			<h3 className="rj-price__name" id={ nameId }>
				{ url ? (
					<a href={ url }>
						<RichText.Content value={ name } />
					</a>
				) : (
					<RichText.Content value={ name } />
				) }
			</h3>
			<RichText.Content tagName="p" className="rj-price__body" value={ body } />
			<div className="rj-price__foot">
				<span className="rj-price__amount">{ euros( price ) }</span>
				{ productId ? (
					<form className="rj-price__form" method="post">
						{ button }
					</form>
				) : (
					button
				) }
			</div>
		</article>
	);
}
