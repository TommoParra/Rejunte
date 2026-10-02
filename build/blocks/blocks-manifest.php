<?php
// This file is generated. Do not modify it manually.
return array(
	'bento-tile' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'rejunte/bento-tile',
		'version' => '1.0.0',
		'title' => 'Mosaico',
		'category' => 'rejunte',
		'parent' => array(
			'rejunte/vitrina'
		),
		'icon' => 'screenoptions',
		'description' => 'Una pieza de la vitrina: una foto, una palabra grande o un dato destacado.',
		'textdomain' => 'rejunte',
		'attributes' => array(
			'variant' => array(
				'type' => 'string',
				'enum' => array(
					'image',
					'word',
					'deep'
				),
				'default' => 'image'
			),
			'span' => array(
				'type' => 'string',
				'enum' => array(
					'',
					'2x1',
					'2x2'
				),
				'default' => ''
			),
			'image' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'word' => array(
				'type' => 'string',
				'default' => ''
			),
			'wordSize' => array(
				'type' => 'string',
				'enum' => array(
					'normal',
					'big'
				),
				'default' => 'normal'
			),
			'label' => array(
				'type' => 'string',
				'default' => ''
			),
			'kicker' => array(
				'type' => 'string',
				'default' => ''
			),
			'display' => array(
				'type' => 'string',
				'default' => ''
			)
		),
		'supports' => array(
			'html' => false,
			'reusable' => false
		),
		'editorScript' => 'file:./index.js'
	),
	'encargos' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'rejunte/encargos',
		'version' => '1.0.0',
		'title' => 'Encargos',
		'category' => 'rejunte',
		'icon' => 'format-chat',
		'description' => 'Panel sobre fondo de cuadrillé: texto, sabores, botón para escribir y una foto con forma de arco.',
		'keywords' => array(
			'encargos',
			'pedido',
			'whatsapp',
			'contacto'
		),
		'textdomain' => 'rejunte',
		'attributes' => array(
			'eyebrow' => array(
				'type' => 'string',
				'default' => ''
			),
			'heading' => array(
				'type' => 'string',
				'default' => ''
			),
			'text' => array(
				'type' => 'string',
				'default' => ''
			),
			'chips' => array(
				'type' => 'array',
				'default' => array(
					
				)
			),
			'buttonLabel' => array(
				'type' => 'string',
				'default' => ''
			),
			'buttonUrl' => array(
				'type' => 'string',
				'default' => ''
			),
			'image' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'photoAnchor' => array(
				'type' => 'string',
				'default' => ''
			),
			'headingLevel' => array(
				'type' => 'number',
				'enum' => array(
					1,
					2
				),
				'default' => 2
			)
		),
		'supports' => array(
			'anchor' => true,
			'html' => false
		),
		'editorScript' => 'file:./index.js',
		'style' => 'file:./style-index.css'
	),
	'footer' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'rejunte/footer',
		'version' => '1.0.0',
		'title' => 'Pie',
		'category' => 'rejunte',
		'icon' => 'align-wide',
		'description' => 'Marca, descripción y columnas de datos (retiro, redes). La dirección, el horario, el teléfono y las redes que se escriban aquí son también los que se dan a buscadores y asistentes.',
		'keywords' => array(
			'footer',
			'pie',
			'contacto',
			'horario'
		),
		'textdomain' => 'rejunte',
		'attributes' => array(
			'logo' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'name' => array(
				'type' => 'string',
				'default' => ''
			),
			'description' => array(
				'type' => 'string',
				'default' => ''
			),
			'columns' => array(
				'type' => 'array',
				'default' => array(
					
				)
			),
			'country' => array(
				'type' => 'string',
				'default' => 'ES'
			)
		),
		'supports' => array(
			'html' => false,
			'multiple' => false,
			'reusable' => false
		),
		'editorScript' => 'file:./index.js',
		'style' => 'file:./style-index.css'
	),
	'header' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'rejunte/header',
		'version' => '1.0.0',
		'title' => 'Cabecera',
		'category' => 'rejunte',
		'icon' => 'menu',
		'description' => 'Marca, enlaces a las secciones y el botón de pedido. Queda fija arriba al hacer scroll; en el móvil los enlaces pasan a un menú desplegable.',
		'keywords' => array(
			'header',
			'menú',
			'navegación',
			'pedido'
		),
		'textdomain' => 'rejunte',
		'attributes' => array(
			'logo' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'brand' => array(
				'type' => 'string',
				'default' => ''
			),
			'brandUrl' => array(
				'type' => 'string',
				'default' => '/'
			),
			'navLabel' => array(
				'type' => 'string',
				'default' => 'Secciones'
			),
			'links' => array(
				'type' => 'array',
				'default' => array(
					
				)
			),
			'ctaLabel' => array(
				'type' => 'string',
				'default' => ''
			),
			'ctaUrl' => array(
				'type' => 'string',
				'default' => ''
			),
			'menuOpenLabel' => array(
				'type' => 'string',
				'default' => 'Abrir el menú'
			),
			'menuCloseLabel' => array(
				'type' => 'string',
				'default' => 'Cerrar el menú'
			)
		),
		'supports' => array(
			'html' => false,
			'multiple' => false,
			'reusable' => false
		),
		'example' => array(
			'attributes' => array(
				'brand' => 'REJUNTE',
				'links' => array(
					array(
						'label' => 'Vitrina',
						'url' => '/#vitrina'
					),
					array(
						'label' => 'La tanda',
						'url' => '/#tanda'
					)
				),
				'ctaLabel' => 'Pedir'
			)
		),
		'editorScript' => 'file:./index.js',
		'style' => 'file:./style-index.css',
		'viewScriptModule' => 'file:./view.js'
	),
	'hero' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'rejunte/hero',
		'version' => '1.0.0',
		'title' => 'Portada',
		'category' => 'rejunte',
		'icon' => 'cover-image',
		'description' => 'Logo, titular, entradilla y dos llamadas a la acción. La imagen se carga con prioridad: es lo primero que se ve.',
		'keywords' => array(
			'hero',
			'portada',
			'inicio'
		),
		'textdomain' => 'rejunte',
		'attributes' => array(
			'image' => array(
				'type' => 'object',
				'default' => array(
					
				)
			),
			'eyebrow' => array(
				'type' => 'string',
				'default' => ''
			),
			'heading' => array(
				'type' => 'string',
				'default' => ''
			),
			'lead' => array(
				'type' => 'string',
				'default' => ''
			),
			'primaryLabel' => array(
				'type' => 'string',
				'default' => ''
			),
			'primaryUrl' => array(
				'type' => 'string',
				'default' => '#tanda'
			),
			'secondaryLabel' => array(
				'type' => 'string',
				'default' => ''
			),
			'secondaryUrl' => array(
				'type' => 'string',
				'default' => '#encargos'
			)
		),
		'supports' => array(
			'anchor' => true,
			'html' => false
		),
		'example' => array(
			'attributes' => array(
				'eyebrow' => 'Pastelería argentina · Barcelona',
				'heading' => 'Dulce de leche, en Gràcia',
				'lead' => 'Alfajores de maicena, medialunas y tortas hechas de a poco en un taller del barrio.',
				'primaryLabel' => 'Ver la tanda',
				'secondaryLabel' => 'Encargar una torta'
			)
		),
		'editorScript' => 'file:./index.js',
		'style' => 'file:./style-index.css'
	),
	'precios' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'rejunte/precios',
		'version' => '1.0.0',
		'title' => 'Precios',
		'category' => 'rejunte',
		'icon' => 'money-alt',
		'description' => 'Fila de tarjetas con precio y botón para sumar al pedido.',
		'keywords' => array(
			'precios',
			'productos',
			'tarjetas'
		),
		'textdomain' => 'rejunte',
		'attributes' => array(
			'label' => array(
				'type' => 'string',
				'default' => 'Precios'
			)
		),
		'supports' => array(
			'anchor' => true,
			'html' => false
		),
		'editorScript' => 'file:./index.js',
		'style' => 'file:./style-index.css'
	),
	'price-card' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'rejunte/price-card',
		'version' => '1.0.0',
		'title' => 'Tarjeta de precio',
		'category' => 'rejunte',
		'parent' => array(
			'rejunte/precios'
		),
		'icon' => 'tag',
		'description' => 'Un producto con su presentación, descripción, precio y botón para sumarlo al pedido. Conectada a un producto de la tienda, el precio y el botón son los de la tienda.',
		'textdomain' => 'rejunte',
		'attributes' => array(
			'productId' => array(
				'type' => 'number',
				'default' => 0
			),
			'url' => array(
				'type' => 'string',
				'default' => ''
			),
			'kicker' => array(
				'type' => 'string',
				'default' => ''
			),
			'name' => array(
				'type' => 'string',
				'default' => ''
			),
			'body' => array(
				'type' => 'string',
				'default' => ''
			),
			'price' => array(
				'type' => 'string',
				'default' => ''
			),
			'buttonLabel' => array(
				'type' => 'string',
				'default' => 'Sumar'
			),
			'addedLabel' => array(
				'type' => 'string',
				'default' => 'Sumado'
			)
		),
		'supports' => array(
			'html' => false,
			'reusable' => false
		),
		'editorScript' => 'file:./index.js',
		'viewScriptModule' => 'file:./view.js'
	),
	'product-grid' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'rejunte/product-grid',
		'version' => '1.0.0',
		'title' => 'Productos',
		'category' => 'rejunte',
		'icon' => 'products',
		'description' => 'Productos de la tienda en tarjetas de precio con foto. Muestra los de la página (tienda, categoría, búsqueda), los relacionados con el producto o los primeros de la vitrina.',
		'keywords' => array(
			'productos',
			'tienda',
			'woocommerce',
			'vitrina'
		),
		'textdomain' => 'rejunte',
		'usesContext' => array(
			'postId',
			'postType'
		),
		'attributes' => array(
			'source' => array(
				'type' => 'string',
				'enum' => array(
					'query',
					'related',
					'latest',
					'category'
				),
				'default' => 'latest'
			),
			'category' => array(
				'type' => 'number',
				'default' => 0
			),
			'count' => array(
				'type' => 'number',
				'default' => 3
			),
			'showCategories' => array(
				'type' => 'boolean',
				'default' => false
			),
			'eyebrow' => array(
				'type' => 'string',
				'default' => ''
			),
			'heading' => array(
				'type' => 'string',
				'default' => ''
			),
			'buttonLabel' => array(
				'type' => 'string',
				'default' => 'Sumar'
			),
			'addedLabel' => array(
				'type' => 'string',
				'default' => 'Sumado'
			),
			'isPreview' => array(
				'type' => 'boolean',
				'default' => false
			)
		),
		'supports' => array(
			'anchor' => true,
			'html' => false
		),
		'editorScript' => 'file:./index.js',
		'style' => 'file:./style-index.css',
		'viewScriptModule' => 'file:./view.js',
		'render' => 'file:./render.php'
	),
	'product-hero' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'rejunte/product-hero',
		'version' => '1.0.0',
		'title' => 'Producto',
		'category' => 'rejunte',
		'icon' => 'products',
		'description' => 'La cabecera de la página de un producto: foto, migas, nombre, presentación, descripción corta, precio y el formulario para sumarlo al pedido. Toma los datos del producto.',
		'keywords' => array(
			'producto',
			'woocommerce',
			'tienda'
		),
		'textdomain' => 'rejunte',
		'usesContext' => array(
			'postId',
			'postType'
		),
		'attributes' => array(
			'chips' => array(
				'type' => 'array',
				'default' => array(
					
				)
			),
			'buttonLabel' => array(
				'type' => 'string',
				'default' => 'Sumar al pedido'
			),
			'addedLabel' => array(
				'type' => 'string',
				'default' => 'En el pedido'
			),
			'shopLabel' => array(
				'type' => 'string',
				'default' => 'La vitrina'
			)
		),
		'supports' => array(
			'html' => false,
			'multiple' => false,
			'reusable' => false
		),
		'editorScript' => 'file:./index.js',
		'style' => 'file:./style-index.css',
		'viewScriptModule' => 'file:./view.js',
		'render' => 'file:./render.php'
	),
	'tanda' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'rejunte/tanda',
		'version' => '1.0.0',
		'title' => 'La tanda',
		'category' => 'rejunte',
		'icon' => 'images-alt2',
		'description' => 'Lo que sale del horno esta semana, en una galería curva que se arrastra, se recorre con las flechas del teclado o con los botones.',
		'keywords' => array(
			'galería',
			'carrusel',
			'fotos',
			'tanda'
		),
		'textdomain' => 'rejunte',
		'attributes' => array(
			'eyebrow' => array(
				'type' => 'string',
				'default' => ''
			),
			'heading' => array(
				'type' => 'string',
				'default' => ''
			),
			'hint' => array(
				'type' => 'string',
				'default' => ''
			),
			'items' => array(
				'type' => 'array',
				'default' => array(
					
				)
			),
			'label' => array(
				'type' => 'string',
				'default' => 'Galería de la tanda. Usa las flechas izquierda y derecha para recorrerla.'
			),
			'prevLabel' => array(
				'type' => 'string',
				'default' => 'Anterior'
			),
			'nextLabel' => array(
				'type' => 'string',
				'default' => 'Siguiente'
			),
			'bend' => array(
				'type' => 'number',
				'default' => 2.2
			),
			'scrollSpeed' => array(
				'type' => 'number',
				'default' => 1
			),
			'scrollEase' => array(
				'type' => 'number',
				'default' => 0.085
			),
			'headingLevel' => array(
				'type' => 'number',
				'enum' => array(
					1,
					2
				),
				'default' => 2
			)
		),
		'supports' => array(
			'anchor' => true,
			'html' => false
		),
		'editorScript' => 'file:./index.js',
		'style' => 'file:./style-index.css',
		'viewScriptModule' => 'file:./view.js'
	),
	'ticker' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'rejunte/ticker',
		'version' => '1.0.0',
		'title' => 'Cinta',
		'category' => 'rejunte',
		'icon' => 'leftright',
		'description' => 'Cinta roja con palabras en movimiento. Es decorativa: los lectores de pantalla la saltan, se detiene al pasar el ratón y con la preferencia de movimiento reducido.',
		'keywords' => array(
			'marquee',
			'ticker',
			'cinta'
		),
		'textdomain' => 'rejunte',
		'attributes' => array(
			'items' => array(
				'type' => 'array',
				'default' => array(
					
				)
			),
			'duration' => array(
				'type' => 'number',
				'default' => 34
			)
		),
		'supports' => array(
			'html' => false
		),
		'example' => array(
			'attributes' => array(
				'items' => array(
					'Alfajores de maicena',
					'Medialunas',
					'Lemon pie'
				)
			)
		),
		'editorScript' => 'file:./index.js',
		'style' => 'file:./style-index.css'
	),
	'vitrina' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'rejunte/vitrina',
		'version' => '1.0.0',
		'title' => 'La vitrina',
		'category' => 'rejunte',
		'icon' => 'grid-view',
		'description' => 'Titular, texto y un mosaico de fotos y palabras que responde al cursor.',
		'keywords' => array(
			'bento',
			'mosaico',
			'vitrina',
			'grid'
		),
		'textdomain' => 'rejunte',
		'attributes' => array(
			'eyebrow' => array(
				'type' => 'string',
				'default' => ''
			),
			'heading' => array(
				'type' => 'string',
				'default' => ''
			),
			'text' => array(
				'type' => 'string',
				'default' => ''
			),
			'glowColor' => array(
				'type' => 'string',
				'default' => '160 18 43'
			),
			'spotlightRadius' => array(
				'type' => 'number',
				'default' => 300
			),
			'enableSpotlight' => array(
				'type' => 'boolean',
				'default' => true
			),
			'enableBorderGlow' => array(
				'type' => 'boolean',
				'default' => true
			),
			'enableTilt' => array(
				'type' => 'boolean',
				'default' => true
			),
			'enableMagnetism' => array(
				'type' => 'boolean',
				'default' => true
			),
			'clickEffect' => array(
				'type' => 'boolean',
				'default' => true
			),
			'headingLevel' => array(
				'type' => 'number',
				'enum' => array(
					1,
					2
				),
				'default' => 2
			)
		),
		'supports' => array(
			'anchor' => true,
			'html' => false
		),
		'editorScript' => 'file:./index.js',
		'style' => 'file:./style-index.css',
		'viewScriptModule' => 'file:./view.js'
	)
);
