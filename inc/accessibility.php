<?php
/**
 * Accessibility affordances that belong to the page rather than to a block.
 *
 * @package Rejunte
 */

defined( 'ABSPATH' ) || exit;

/**
 * Core injects its skip link with JavaScript after load. The theme prints a real
 * one in the markup instead, so it exists before any script runs.
 */
function rejunte_remove_core_skip_link(): void {
	remove_action( 'wp_enqueue_scripts', 'wp_enqueue_block_template_skip_link' );
	remove_action( 'wp_footer', 'the_block_template_skip_link' );
}
add_action( 'after_setup_theme', 'rejunte_remove_core_skip_link' );

/**
 * First focusable elements on every page: a skip link to the main landmark and
 * a control to pause the decorative animations.
 *
 * The ticker and the hero's bobbing logo move indefinitely. Visitors who ask
 * their system for reduced motion never see them move, but WCAG 2.2.2 also
 * expects a way to stop them from within the page; this toggle is that way. It
 * stays visually hidden until it receives keyboard focus, like the skip link,
 * so the design is unchanged for everyone else.
 */
function rejunte_body_open(): void {
	printf(
		'<a class="rj-skip-link" href="#contenido">%s</a>',
		esc_html__( 'Saltar al contenido', 'rejunte' )
	);
	printf(
		'<button type="button" class="rj-skip-link rj-motion-toggle" aria-pressed="false">%s</button>',
		esc_html__( 'Pausar animaciones', 'rejunte' )
	);
	// Live region for actions with no visible confirmation where the focus is
	// (adding to the order). It must exist before it changes to be announced.
	echo '<p id="rejunte-live" class="rj-live" role="status"></p>';
}
add_action( 'wp_body_open', 'rejunte_body_open', 5 );

/**
 * Apply a stored "animations paused" preference before first paint, so a visitor
 * who paused them never sees a frame of motion on the next page. Inline, because
 * a deferred script would run after the ticker had already started.
 */
function rejunte_motion_preference_script(): void {
	wp_print_inline_script_tag(
		"try{if(localStorage.getItem('rj-motion')==='paused'){document.documentElement.dataset.motion='paused'}}catch(e){}"
	);
}
add_action( 'wp_head', 'rejunte_motion_preference_script', 1 );

/**
 * The pause control: a toggle button (its label stays, aria-pressed changes)
 * that pauses every pausable animation and remembers the choice. A few hundred
 * bytes inline, so it needs no request of its own.
 */
function rejunte_motion_toggle_script(): void {
	wp_print_inline_script_tag(
		"(function(){var b=document.querySelector('.rj-motion-toggle');if(!b)return;var r=document.documentElement;" .
		"function set(p){if(p){r.dataset.motion='paused'}else{delete r.dataset.motion}b.setAttribute('aria-pressed',String(p));" .
		"try{p?localStorage.setItem('rj-motion','paused'):localStorage.removeItem('rj-motion')}catch(e){}}" .
		"set(r.dataset.motion==='paused');b.addEventListener('click',function(){set(r.dataset.motion!=='paused')})})();"
	);
}
add_action( 'wp_footer', 'rejunte_motion_toggle_script', 20 );
