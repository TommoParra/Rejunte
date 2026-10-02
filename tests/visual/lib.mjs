/**
 * Shared settings for the visual and behaviour checks.
 *
 *   REJUNTE_URL    the WordPress site (default https://rejunte.local:8890)
 *   PROTOTYPE_URL  the Vue prototype, for pixel comparisons
 *   WP_CLI         how to run WP-CLI for the editor checks (default "wp")
 *
 * Output (screenshots, diffs) goes to tests/visual/output/.
 */
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export { chromium, firefox, webkit } from 'playwright'
export { default as sharp } from 'sharp'

export const BASE = ( process.env.REJUNTE_URL || 'https://rejunte.local:8890' ).replace( /\/$/, '' )
export const PROTOTYPE = process.env.PROTOTYPE_URL || 'http://127.0.0.1:3999/portfolio/rejunte?preview=true'

const here = fileURLToPath( new URL( '.', import.meta.url ) )
process.chdir( here )
mkdirSync( 'output', { recursive: true } )

/**
 * Answer the cookie notice up front, so the banner never sits over what a
 * test clicks. (The accessibility check leaves it, to audit it too.)
 *
 * @param {import('playwright').BrowserContext} context Browser context.
 */
export async function prepare( context ) {
	const response = await context.request.get( BASE + '/' )
	const match = ( await response.text() ).match( /<script type="application\/json" id="rj-consent-config">(.*?)<\/script>/s )
	if ( ! match ) {
		return
	}
	const { cookie, version } = JSON.parse( match[ 1 ] )
	const { hostname } = new URL( BASE )
	await context.addCookies( [ { name: cookie, value: encodeURIComponent( JSON.stringify( { v: version, c: {} } ) ), domain: hostname, path: '/' } ] )
}
