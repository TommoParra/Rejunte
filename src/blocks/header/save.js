import { RichText, useBlockProps } from '@wordpress/block-editor';

import { RjImage } from '../../shared/image';
import { plain } from '../../shared/text';

/**
 * The header as the prototype draws it. The order button is a link: it goes to
 * the shop while the order is empty and to the cart once it is not (the server
 * and view.js keep its label and destination current).
 */
export default function save( { attributes } ) {
	const { logo, brand, brandUrl, navLabel, links, ctaLabel, ctaUrl, menuOpenLabel, menuCloseLabel } = attributes;
	const label = plain( ctaLabel );

	const items = links.map( ( link, index ) => (
		<li key={ index }>
			<a className="rj-nav__link" href={ link.url }>
				<RichText.Content value={ link.label } />
			</a>
		</li>
	) );

	return (
		<header { ...useBlockProps.save( { className: 'rj-nav', 'data-open': 'false' } ) }>
			<div className="rj-nav__bar">
				<a className="rj-nav__brand" href={ brandUrl || '/' }>
					<RjImage
						className="rj-nav__mark"
						image={ logo }
						brand="logo-mark"
						alt=""
						ratio="1 / 1"
						fit="contain"
						tone="surface"
						loading="eager"
					/>
					<RichText.Content tagName="span" className="rj-nav__name" value={ brand } />
				</a>
				<nav className="rj-nav__links" aria-label={ navLabel }>
					<ul>{ items }</ul>
				</nav>
				<a className="rj-nav__cta" href={ ctaUrl || '/' } data-label={ label }>
					{ label }
				</a>
				<button
					type="button"
					className="rj-nav__burger"
					aria-expanded="false"
					aria-controls="rj-nav-panel"
					data-label-open={ menuOpenLabel }
					data-label-close={ menuCloseLabel }
				>
					<span aria-hidden="true">
						<i></i>
						<i></i>
						<i></i>
					</span>
					<span className="screen-reader-text">{ menuOpenLabel }</span>
				</button>
			</div>
			<div id="rj-nav-panel" className="rj-nav__panel" hidden>
				<ul>{ items }</ul>
			</div>
		</header>
	);
}
