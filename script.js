// autor: Marco Barría

// Medidas de diseño (px sin escalar)
var ANCHO = 400, ALTO = 280,  // sobre
    SEPARACION = 50,          // espacio entre la carta abierta y el sobre
    VISIBLE = 110,            // parte del sobre que se ve con la carta abierta
    MARGEN = 16;              // margen mínimo con los bordes de la pantalla

var medidas = {};

// Calcula escala y posiciones para el tamaño de pantalla actual
function calcular() {
	var vw = window.innerWidth,
			vh = window.innerHeight,
			E = $('#carta'),
			contenido = E.find('hgroup').outerHeight(true) + E.find('p').outerHeight(true);

	var s = Math.min(
		(vw - 2 * MARGEN) / ANCHO,          // que quepa a lo ancho
		(vh - 2 * MARGEN) / (ALTO + 40),    // que el sobre cerrado quepa a lo alto
		1.6,                                // no crecer de más en pantallas grandes
		// que la carta abierta quepa completa, sin achicar tanto que no se lea
		Math.max((vh - 2 * MARGEN) / (contenido + SEPARACION + VISIBLE), 0.85)
	);

	// Sobre cerrado: un poco arriba del centro
	var arriba = Math.max(MARGEN, (vh - ALTO * s) / 2 - vh * 0.05);

	// En pantallas bajas se ve menos sobre para darle más espacio a la carta
	var visible = Math.min(VISIBLE, vh * 0.15 / s),
			separacion = Math.min(SEPARACION, vh * 0.06 / s);

	// Carta abierta: lo más alta posible dejando ver la parte superior del sobre
	var techo = vh - visible * s,
			disponible = (techo - MARGEN) / s - separacion,
			alto = Math.min(contenido, disponible),
			sobra = (disponible - alto) * s,
			cartaArriba = MARGEN + sobra / 2,
			sobreArriba = cartaArriba + (alto + separacion) * s;

	medidas = {
		escala: s,
		arriba: arriba,
		alto: alto,
		separacion: separacion,
		bajar: (sobreArriba - arriba) / s,
		desborda: contenido > alto + 1
	};

	$('#escena').css({
		'top': arriba + 'px',
		'transform': 'scale(' + s + ')'
	});
}

function actualizar() {
	var scr = $(window).scrollTop(),
			C = $('#contenedor'),
			A = $('#abrir'),
			E = $('#carta'),
			F = $('#carta hgroup h2'),
			P = $('#perspectiva');

	// giro y abertura
	if (scr >= 100) {
		C.css({
			'transition':'all 1s',
			'transform':'rotateY(180deg)'
		});
		A.css({
			'transition':'all 1s .5s',
			'transform':'rotateX(180deg)',
			'z-index': '0'
		});
	}
	// cerrado y giro
	else {
		C.css({
			'transition':'all 1s .5s',
			'transform':'rotateY(0deg)'
		});
		A.css({
			'transition':'all 1s',
			'transform':'rotateX(0deg)',
			'z-index': '10'
		});
	}
	// Sobre trasladoY / carta
	if (scr >= 500) {
		E.css({
			'transition':'all .5s 1s',
			'top': -(medidas.alto + medidas.separacion) + 'px',
			'height': medidas.alto + 'px',
			'overflow-y': medidas.desborda ? 'auto' : 'hidden'
		});
		P.css({
			'transition':'all 1s',
			'transform':'translateY(' + medidas.bajar + 'px)'
		});
		F.css({
			'transition':'all 1s',
			'transform':'rotateZ(180deg)'
		});
	}
	// Sobre position original / guardado carta
	else {
		E.css({
			'transition':'all .5s',
			'top':'3px',
			'height':'200px',
			'overflow-y':'hidden'
		}).scrollTop(0);
		P.css({
			'transform':'translateY(0px)'
		});
		F.css({
			'transform':'rotateZ(0deg)'
		});
	}
}

function recalcular() {
	calcular();
	actualizar();
}

$(window).scroll(actualizar);
$(window).on('resize orientationchange load', recalcular);
// La fuente cambia la altura del texto: recalcular cuando termine de cargar
if (document.fonts && document.fonts.ready) {
	document.fonts.ready.then(recalcular);
}
recalcular();
