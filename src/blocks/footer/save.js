import { RichText, useBlockProps } from '@wordpress/block-editor';

import { RjImage } from '../../shared/image';

export function columnsStyle( columns ) {
	return 2 === columns.length ? undefined : { '--rj-foot-cols': columns.length };
}

export default function save( { attributes } ) {
	const { logo, name, description, columns } = attributes;

	return (
		<footer { ...useBlockProps.save( { className: 'rj-foot', style: columnsStyle( columns ) } ) }>
			<div className="rj-foot__brand">
				<RjImage
					className="rj-foot__mark"
					image={ logo }
					brand="logo-mark-light"
					alt=""
					ratio="1 / 1"
					fit="contain"
					tone="deep"
				/>
				<RichText.Content tagName="span" className="rj-foot__name" value={ name } />
				<RichText.Content tagName="p" className="rj-foot__text" value={ description } />
			</div>
			{ columns.map( ( column, index ) => (
				<div key={ index } className="rj-foot__col">
					<RichText.Content tagName="h2" className="rj-foot__label" value={ column.label } />
					{ ( column.lines || [] ).map( ( line, lineIndex ) => (
						<RichText.Content key={ lineIndex } tagName="p" className="rj-foot__line" value={ line } />
					) ) }
				</div>
			) ) }
		</footer>
	);
}
