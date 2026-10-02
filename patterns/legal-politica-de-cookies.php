<?php
/**
 * Title: Política de cookies
 * Slug: rejunte/legal-politica-de-cookies
 * Categories: rejunte
 * Keywords: legal, politica de cookies
 * Description: Borrador de política de cookies para Rejunte, con los datos pendientes entre corchetes.
 *
 * @package Rejunte
 */

?>
<!-- wp:paragraph {"className":"rj-draft-note"} -->
<p class="rj-draft-note"><strong>Borrador.</strong> Completá los datos entre corchetes y revisá el texto con tu asesoría antes de publicar el sitio. Después, borrá este aviso.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Qué son las cookies</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Son pequeños archivos que una web guarda en tu navegador para recordar información entre una página y otra.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Qué cookies usamos</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Solo cookies técnicas y propias, necesarias para que el pedido funcione y para recordar tus preferencias. No usamos cookies de análisis ni de publicidad. Si algún día las usamos, te pediremos permiso antes y las vas a ver en esta lista.</p>
<!-- /wp:paragraph -->

<!-- wp:table {"hasFixedLayout":false} -->
<figure class="wp-block-table"><table><thead><tr><th><?php esc_html_e( 'Nombre', 'rejunte' ); ?></th><th><?php esc_html_e( 'Para qué sirve', 'rejunte' ); ?></th><th><?php esc_html_e( 'Duración', 'rejunte' ); ?></th><th><?php esc_html_e( 'Tipo', 'rejunte' ); ?></th></tr></thead><tbody><?php foreach ( rejunte_cookie_inventory() as $rejunte_cookie ) : ?><tr><td><?php echo esc_html( $rejunte_cookie['name'] ); ?></td><td><?php echo esc_html( $rejunte_cookie['purpose'] ); ?></td><td><?php echo esc_html( $rejunte_cookie['duration'] ); ?></td><td><?php echo esc_html( $rejunte_cookie['type'] ); ?></td></tr><?php endforeach; ?></tbody></table></figure>
<!-- /wp:table -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Cómo cambiar tu elección</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>En cualquier momento, desde «Configurar cookies» al pie de cada página. También podés borrar las cookies o bloquearlas desde la configuración de tu navegador; si bloqueás las técnicas, el pedido no va a funcionar.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Responsable</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>El titular de la web, según el <a href="/aviso-legal/">aviso legal</a>.</p>
<!-- /wp:paragraph -->
