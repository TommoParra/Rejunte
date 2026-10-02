// Admin session for Playwright without touching the password: WP-CLI creates a
// session token for user 1 and signs auth cookies with it; `logout()` destroys it.
import { execFileSync } from 'node:child_process'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const wp = (code) => execFileSync(`${here}/wp`, ['eval', code], { encoding: 'utf8' })

export function login() {
  const json = wp(`
    $expiration = time() + 4 * HOUR_IN_SECONDS;
    $token = WP_Session_Tokens::get_instance( 1 )->create( $expiration );
    echo wp_json_encode( array(
      'token' => $token,
      'cookies' => array(
        array( 'name' => SECURE_AUTH_COOKIE, 'value' => wp_generate_auth_cookie( 1, $expiration, 'secure_auth', $token ) ),
        array( 'name' => LOGGED_IN_COOKIE, 'value' => wp_generate_auth_cookie( 1, $expiration, 'logged_in', $token ) ),
      ),
    ) );`)
  const data = JSON.parse(json)
  return {
    token: data.token,
    cookies: data.cookies.map(c => ({ ...c, domain: 'rejunte.local', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' })),
  }
}

export function logout(token) {
  wp(`WP_Session_Tokens::get_instance( 1 )->destroy( '${token}' ); echo 'ok';`)
}
