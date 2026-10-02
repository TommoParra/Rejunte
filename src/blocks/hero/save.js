import { RichText, useBlockProps } from '@wordpress/block-editor';

import { RjImage } from '../../shared/image';

export default function save( { attributes } ) {
	const { image, eyebrow, heading, lead, primaryLabel, primaryUrl, secondaryLabel, secondaryUrl } = attributes;

	return (
		<section { ...useBlockProps.save( { className: 'rj-hero' } ) }>
			<div className="rj-hero__lockup">
				{ /* The largest thing above the fold: fetched first, never lazy. */ }
				<RjImage
					image={ image }
					brand="logo"
					ratio="1 / 1"
					fit="contain"
					tone="surface"
					sizes="(max-width: 40rem) 260px, 460px"
					loading="eager"
					fetchPriority="high"
				/>
			</div>
			<div className="rj-hero__copy">
				<RichText.Content tagName="span" className="rj-eyebrow" value={ eyebrow } />
				<RichText.Content tagName="h1" className="rj-hero__title" value={ heading } />
				<RichText.Content tagName="p" className="rj-hero__lead" value={ lead } />
				<div className="rj-hero__actions">
					{ primaryLabel && (
						<a className="rj-button" href={ primaryUrl }>
							<RichText.Content value={ primaryLabel } />
						</a>
					) }
					{ secondaryLabel && (
						<a className="rj-link" href={ secondaryUrl }>
							<RichText.Content value={ secondaryLabel } />
						</a>
					) }
				</div>
			</div>
		</section>
	);
}
