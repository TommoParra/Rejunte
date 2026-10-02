/**
 * Cursor effects for every bento on the page.
 */
import { createBento } from '../../shared/bento';

for ( const root of document.querySelectorAll( '.rj-bento' ) ) {
	createBento( root );
}
