import { registerBlockType } from '@wordpress/blocks';

import metadata from './block.json';
import Edit from './edit';
import './style.scss';

// Rendered on the server from the product's data (render.php).
registerBlockType( metadata.name, { edit: Edit, save: () => null } );
