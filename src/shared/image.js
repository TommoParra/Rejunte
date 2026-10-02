/**
 * The image slot, shared by save() and edit() so both render identical markup.
 *
 * Translated from the prototype's RejunteImage: a box with a fixed aspect ratio
 * and a tone behind it. With an image it renders a plain <img>; WordPress adds
 * srcset at render time from the `wp-image-{id}` class. With none it renders
 * the labelled placeholder, so a section keeps its shape either way.
 *
 * An image attribute has the shape { id, url, alt, width, height }.
 */

/**
 * @param {Object}  props
 * @param {Object}  [props.image]         Image attribute.
 * @param {string}  [props.alt]           Alt text override (else image.alt).
 * @param {string}  [props.ratio]         CSS aspect-ratio.
 * @param {string}  [props.fit]           'cover' | 'contain'.
 * @param {string}  [props.tone]          'mid' | 'surface' | 'deep'.
 * @param {string}  [props.brand]         Theme brand image key used when no image is set.
 * @param {string}  [props.brandUrl]      Editor only: resolved URL of that brand image.
 * @param {string}  [props.sizes]         `sizes` attribute for srcset.
 * @param {string}  [props.loading]       'lazy' | 'eager'.
 * @param {string}  [props.fetchPriority] 'high' for the LCP image.
 * @param {string}  [props.className]     Extra classes on the slot.
 * @param {Object}  [props.children]      Editor controls rendered inside the slot.
 */
export function RjImage( {
	image,
	alt,
	ratio = '3 / 4',
	fit = 'cover',
	tone = 'mid',
	brand,
	brandUrl,
	sizes,
	loading = 'lazy',
	fetchPriority,
	className,
	children,
} ) {
	const text = alt ?? image?.alt ?? '';
	const classes = [ 'rj-image', className ].filter( Boolean ).join( ' ' );
	const shared = {
		alt: text,
		loading: 'eager' === loading ? undefined : loading,
		decoding: 'high' === fetchPriority ? undefined : 'async',
		fetchpriority: fetchPriority,
	};

	let content;
	if ( image?.url ) {
		content = (
			<img
				className={ [ 'rj-image__img', image.id ? `wp-image-${ image.id }` : '' ].filter( Boolean ).join( ' ' ) }
				src={ image.url }
				width={ image.width || undefined }
				height={ image.height || undefined }
				sizes={ sizes }
				{ ...shared }
			/>
		);
	} else if ( brand ) {
		// The server fills in src for the theme's own file (see inc/blocks.php).
		content = (
			<img
				className="rj-image__img"
				data-rj-brand={ brandUrl ? undefined : brand }
				src={ brandUrl }
				{ ...shared }
			/>
		);
	} else {
		content = (
			<span className="rj-image__placeholder">
				<span className="rj-image__mark" aria-hidden="true">✳</span>
				<span className="rj-image__label">{ text }</span>
			</span>
		);
	}

	return (
		<div
			className={ classes }
			data-tone={ tone }
			data-fit={ 'contain' === fit ? 'contain' : undefined }
			style={ { aspectRatio: ratio } }
		>
			{ content }
			{ children }
		</div>
	);
}

/**
 * Normalise a media-library selection into an image attribute.
 *
 * @param {Object} media Media object from MediaUpload.
 * @return {Object} Image attribute.
 */
export function imageFromMedia( media ) {
	if ( ! media?.url ) {
		return {};
	}
	return {
		id: media.id,
		url: media.url,
		alt: media.alt || '',
		width: media.width || media.media_details?.width,
		height: media.height || media.media_details?.height,
	};
}
