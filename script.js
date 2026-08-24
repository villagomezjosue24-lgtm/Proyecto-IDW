// APARTADO DE  FORMULARIO
const formulario = document.getElementById('formulario-contacto'); // Asegúrate de que el form tenga este ID en el HTML
const mensajeAlerta = document.getElementById('mensaje-alerta');

if (formulario && mensajeAlerta) {
    formulario.addEventListener('submit', function (event) {
        event.preventDefault();

        // Validaciones previas que ya tenías
        const nombre = document.getElementById('nombre').value.trim();
        const apellido = document.getElementById('apellido').value.trim();
        const email = document.getElementById('email').value.trim();
        const telefono = document.getElementById('telefono').value.trim();
        const campoMensaje = document.getElementById('campo-mensaje').value.trim();

        if (!nombre || !apellido || !email || !telefono || !campoMensaje) {
            mensajeAlerta.textContent = 'Por favor, completa todos los campos.';
            mensajeAlerta.style.color = 'red';
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            mensajeAlerta.textContent = 'Por favor, ingresa un correo electrónico válido.';
            mensajeAlerta.style.color = 'red';
            return;
        }

        const telefonoLimpio = telefono.replace(/[\s\-\+]/g, '');
        const soloNumeros = /^[0-9]+$/;

        if (!soloNumeros.test(telefonoLimpio) || telefonoLimpio.length < 7) {
            mensajeAlerta.textContent = 'Por favor, ingresa un número de teléfono válido (solo números).';
            mensajeAlerta.style.color = 'red';
            return;
        }

        // --- INTEGRACIÓN DE EMAILJS (Usando sendForm) ---
        const btnSubmit = formulario.querySelector('button[type="submit"]');
        btnSubmit.textContent = 'Enviando...';
        btnSubmit.disabled = true;

        // 'this' hace referencia al formulario y toma automáticamente los 'name' de cada input
        emailjs.sendForm('service_yp3o96m', 'template_mmjhxmg', this)
            .then(() => {
                mensajeAlerta.textContent = '¡Mensaje enviado con éxito!';
                mensajeAlerta.style.color = 'green';
                formulario.reset();
                btnSubmit.textContent = 'Enviar';
                btnSubmit.disabled = false;

                setTimeout(() => { mensajeAlerta.textContent = ''; }, 5000);
            })
            .catch((error) => {
                console.error('Error al enviar el correo:', error);
                mensajeAlerta.textContent = 'Hubo un error al enviar el mensaje. Inténtalo de nuevo.';
                mensajeAlerta.style.color = 'red';
                btnSubmit.textContent = 'Enviar';
                btnSubmit.disabled = false;
            });
    });
}
// ==========================================
//  APARTADO DE CARRITO Y CATALOGO
// ==========================================
let carrito = [];

// Al cargar la página, revisamos si hay datos guardados previamente
document.addEventListener('DOMContentLoaded', () => {
    // cuando se recarga la página, el carrito se mantiene con los productos que ya estaban agregados
    const carritoGuardado = localStorage.getItem('carritoNotables');

    if (carritoGuardado) {
        let carritoPrevio = JSON.parse(carritoGuardado); // Convertimos el string guardado en un array de objetos

        if (carritoPrevio.length > 0) {
            // Si hay productos guardados, verificamos si estamos en la página del carrito
            const contenedorResumen = document.getElementById('lista-productos-resumen');
            if (contenedorResumen) {
                let continuar = confirm("Tienes un pedido guardado. ¿Deseas continuar con ese pedido? (Presiona Cancelar para iniciar uno nuevo)");
                if (continuar) {
                    carrito = carritoPrevio; // Si el usuario quiere continuar, cargamos el carrito previo
                } else {
                    localStorage.removeItem('carritoNotables'); // Si el usuario quiere iniciar un pedido nuevo, eliminamos el carrito guardado
                    carrito = [];
                }
            } else {
                carrito = carritoPrevio; // Si no estamos en la página del carrito, simplemente cargamos el carrito previo sin preguntar
            }
        }
    }

    actualizarResumenCarrito();
    actualizarContadorFlotante();
});

// ==========================================
// CONTROL DE TARJETAS (CONTADORES Y AGREGAR)
// ==========================================
const tarjetasProductos = document.querySelectorAll('.tarjeta');

if (tarjetasProductos.length > 0) {
    tarjetasProductos.forEach((tarjeta) => {
        const btnRestar = tarjeta.querySelector('.btn-restar');
        const btnSumar = tarjeta.querySelector('.btn-sumar');
        const spanCantidad = tarjeta.querySelector('.cantidad');
        const btnAgregar = tarjeta.querySelector('.btn-agregar');

        // Botón - en la tarjeta
        if (btnRestar && spanCantidad) {
            btnRestar.addEventListener('click', () => {
                let actual = parseInt(spanCantidad.textContent) || 0;
                if (actual > 0) {
                    spanCantidad.textContent = actual - 1;
                }
            });
        }

        // Botón + en la tarjeta
        if (btnSumar && spanCantidad) {
            btnSumar.addEventListener('click', () => {
                let actual = parseInt(spanCantidad.textContent) || 0;
                spanCantidad.textContent = actual + 1;
            });
        }

        // Botón Agregar al Carrito
        if (btnAgregar) {
            btnAgregar.addEventListener('click', () => {
                // LEEMOS DIRECTAMENTE EL NÚMERO QUE DICE EL SPAN EN LA PANTALLA
                let cantidadAEnviar = spanCantidad ? parseInt(spanCantidad.textContent) : 0;

                // Si el usuario dejó el contador en 0, por seguridad agregamos 1 o le avisamos
                if (cantidadAEnviar <= 0) {
                    cantidadAEnviar = 1;
                }

                const nombre = tarjeta.querySelector('h3').textContent;
                let precioTexto = tarjeta.querySelector('.precio-tarjetas').textContent;
                let precio = parseFloat(precioTexto.replace('$', '').replace('.', ''));
                let imagen = tarjeta.querySelector('.img-producto').getAttribute('src');

                let productoExistente = carrito.find(item => item.nombre === nombre);

                if (productoExistente) {
                    // Sumamos exactamente la cantidad que estaba escrita en la tarjeta
                    productoExistente.cantidad += cantidadAEnviar;
                } else {
                    carrito.push({
                        nombre: nombre,
                        precio: precio,
                        imagen: imagen,
                        cantidad: cantidadAEnviar
                    });
                }

                guardarYActualizar();

                // Reiniciamos el contador visual de la tarjeta a 0
                if (spanCantidad) spanCantidad.textContent = '0';
            });
        }
    });
}

// Guardamos el carrito en el localStorage y actualizamos la vista
function guardarYActualizar() {
    localStorage.setItem('carritoNotables', JSON.stringify(carrito));
    actualizarResumenCarrito();
    actualizarContadorFlotante();
}

// Actualizamos la sección del resumen del carrito 
function actualizarResumenCarrito() {
    const contenedorResumen = document.getElementById('lista-productos-resumen');
    const seccionTotales = document.getElementById('seccion-totales');
    const btnOrdenar = document.getElementById('btn-ordenar');

    if (!contenedorResumen) return;

    contenedorResumen.innerHTML = '';

    if (carrito.length === 0) {
        contenedorResumen.innerHTML = '<p class="carrito-vacio">No hay productos en el carrito.</p>';
        if (seccionTotales) seccionTotales.style.display = 'none';
        if (btnOrdenar) btnOrdenar.style.display = 'none';
        return;
    }

    if (seccionTotales) seccionTotales.style.display = 'block';
    if (btnOrdenar) btnOrdenar.style.display = 'block';

    let subtotalGeneral = 0;

    carrito.forEach((item, index) => {
        let totalItem = item.precio * item.cantidad;
        subtotalGeneral += totalItem;

        const divItem = document.createElement('div');

        /* lo que se ve en la parte derecha de la página del carrito, 
           donde se muestra el resumen de los productos agregados */
        divItem.classList.add('item-resumen');
        divItem.innerHTML = `
            <img src="${item.imagen}" alt="${item.nombre}" class="img-mini">
            <div class="info-mini">
                <h4>${item.nombre}</h4>
                <span class="precio-mini">$${totalItem.toLocaleString()}</span>
            </div>
            <div class="contador-mini">
                <span class="restar-mini" onclick="cambiarCantidad(${index}, -1)">-</span> 
                <span class="cantidad-mini">${item.cantidad}</span>
                <span class="sumar-mini" onclick="cambiarCantidad(${index}, 1)">+</span>
            </div>
        `;
        contenedorResumen.appendChild(divItem);
    });

    const subtotalTxt = document.getElementById('subtotal-txt');
    const totalTxt = document.getElementById('total-txt');

    if (subtotalTxt) subtotalTxt.textContent = `$${subtotalGeneral.toLocaleString()}`;
    if (totalTxt) totalTxt.textContent = `$${subtotalGeneral.toLocaleString()}`;
}

// Función para cambiar la cantidad de un producto desde el resumen
window.cambiarCantidad = function (index, delta) {
    if (index < 0 || index >= carrito.length) return;
    carrito[index].cantidad += delta;
    if (carrito[index].cantidad <= 0) {
        carrito.splice(index, 1);
    }
    guardarYActualizar();
}

// Función para actualizar el número en el ícono flotante en cualquier página
function actualizarContadorFlotante() {
    let carritoData = JSON.parse(localStorage.getItem('carritoNotables')) || [];
    let totalCantidad = carritoData.reduce((acc, item) => acc + item.cantidad, 0);

    if (totalCantidad > 0) {
        document.querySelectorAll('.contador-flotante, .badge, .notificacion, .icono-carrito span, .fa-shopping-cart span, .bi-cart span, .cart-count').forEach(el => {
            el.textContent = totalCantidad;
            el.style.display = 'inline-block';
        });
    }
}

// ==========================================
// DESPLAZAMIENTO DEL MENÚ DE CATEGORÍAS CON FLECHAS
// ==========================================

/* =========================================
CARRUSEL DE CATEGORÍAS (LÍMITES Y FLECHAS)
========================================= */

const menuCategorias = document.getElementById('menu-categorias');
const flechaIzq = document.getElementById('flecha-izq');
const flechaDer = document.getElementById('flecha-der');

if (menuCategorias && flechaIzq && flechaDer) {

    // Función inteligente que revisa si llegamos a los bordes
    const actualizarFlechas = () => {
        // ¿Estamos pegados a la izquierda? (0 píxeles de scroll)
        if (menuCategorias.scrollLeft <= 0) {
            flechaIzq.classList.add('desactivada');
        } else {
            flechaIzq.classList.remove('desactivada');
        }

        // ¿Estamos pegados a la derecha? (calcula el ancho total vs el área visible)
        // Usamos "- 1" para evitar problemas de decimales en algunos navegadores
        if (menuCategorias.scrollLeft + menuCategorias.clientWidth >= menuCategorias.scrollWidth - 1) {
            flechaDer.classList.add('desactivada');
        } else {
            flechaDer.classList.remove('desactivada');
        }
    };

    // Escuchar cuando el menú se desliza para actualizar las flechas en tiempo real
    menuCategorias.addEventListener('scroll', actualizarFlechas);

    // Ejecutar una vez al cargar la página por si la pantalla es muy grande
    // y no se necesita hacer scroll desde el principio
    actualizarFlechas();

    // Movimiento con las flechas
    flechaDer.addEventListener('click', () => {
        menuCategorias.scrollBy({ left: 200, behavior: 'smooth' });
    });

    flechaIzq.addEventListener('click', () => {
        menuCategorias.scrollBy({ left: -200, behavior: 'smooth' });
    });
}

// Nota: Eliminamos el código anterior que dejaba los botones azules permanentemente,
// ahora el CSS (.btn-categoria:active) se encarga de dar el color solo al presionar.

// ==========================================
// CURIOSIDADES DINÁMICAS CADA 1 MINUTO
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const parrafoCuriosidad = document.getElementById('texto-curiosidad');

    if (parrafoCuriosidad) {
        const curiosidades = [
            "El café es la segunda bebida más consumida en el mundo después del agua.",
            "El sándwich de miga típico argentino tiene su origen en la adaptación de los 'tea sandwiches' ingleses.",
            "Los licuados de fruta con leche aportan una gran cantidad de vitaminas y energía natural para tu día.",
            "El grano de café es en realidad la semilla de una fruta roja llamada cereza del café.",
            "El consumo moderado de café ayuda a mejorar la concentración y el rendimiento físico.",
            "Nuestra panadería se hornea diariamente para garantizar esa textura crujiente y fresca que te encanta.",
            "El mate y los jugos naturales son excelentes opciones refrescantes para acompañar cualquier tarde."
        ];

        let indiceActual = 0;

        function cambiarCuriosidad() {
            // Efecto de desvanecimiento suave
            parrafoCuriosidad.style.opacity = 0;

            setTimeout(() => {
                indiceActual = (indiceActual + 1) % curiosidades.length;
                parrafoCuriosidad.textContent = curiosidades[indiceActual];
                parrafoCuriosidad.style.opacity = 1;
            }, 300);
        }

        // Cambia de texto cada 30 segundos (30000 milisegundos)
        setInterval(cambiarCuriosidad, 10000);
    }
});

// ==========================================
// FUNCIONALIDAD DEL BOTÓN WHATSAPP
// ==========================================
document.addEventListener('DOMContentLoaded', () => {

    // 1. LÓGICA PARA LOS BOTONES DE ENTREGA
    const botonesEntrega = document.querySelectorAll('.btn-entrega');
    const contenedorDireccion = document.getElementById('contenedor-direccion');
    const inputDireccion = document.getElementById('input-direccion');
    // Variables para el texto natural. Por defecto asume que es en el local.
    let fraseEntrega = "Voy a comer en el local.";
    let pideDireccion = false;

    if (botonesEntrega.length > 0) {
        botonesEntrega.forEach(boton => {
            boton.addEventListener('click', function () {
                // Le quitamos el color a todos y se lo ponemos al clickeado
                botonesEntrega.forEach(b => b.classList.remove('activo'));
                this.classList.add('activo');

                // Leemos qué botón se apretó usando palabras clave
                let textoBoton = this.textContent.trim();

                // Mostramos u ocultamos el campo de dirección según el botón
                if (textoBoton.includes("Delivery")) {
                    fraseEntrega = "Me lo envían porfa a esta dirección:";
                    pideDireccion = true;
                    if (contenedorDireccion) contenedorDireccion.style.display = 'block'; // Muestra el campo
                } else if (textoBoton.includes("Pasar a Buscar")) {
                    fraseEntrega = "Lo paso a buscar.";
                    pideDireccion = false;
                    if (contenedorDireccion) contenedorDireccion.style.display = 'none'; // Oculta el campo
                } else {
                    fraseEntrega = "Voy a comer en el local.";
                    pideDireccion = false;
                    if (contenedorDireccion) contenedorDireccion.style.display = 'none'; // Oculta el campo
                }
            });
        });
    }

    // Agarra el botón de WhatsApp y hace que funcione al hacerle clic.
    // 2. LÓGICA DEL BOTÓN DE WHATSAPP
    const configurarBotonWhatsApp = () => {
        const btnWhatsapp = document.getElementById('btn-whatsapp');
        if (btnWhatsapp && !btnWhatsapp.hasAttribute('data-activo')) {
            btnWhatsapp.setAttribute('data-activo', 'true');

            btnWhatsapp.addEventListener('click', (e) => {
                e.preventDefault();
                // Leo el carrito actual desde el almacenamiento local
                let carritoActual = JSON.parse(localStorage.getItem('carritoNotables')) || [];
                if (carritoActual.length === 0) {
                    alert("Tu carrito está vacío. Agrega algunos productos antes de enviar el pedido.");
                    return;
                }
                // Validamos que hayan escrito la dirección si eligieron "Envío"
                let direccionEscrita = "";
                if (pideDireccion) {
                    direccionEscrita = inputDireccion ? inputDireccion.value.trim() : "";
                    if (direccionEscrita === "") {
                        alert("Por favor, ingresa tu dirección para poder hacer el envío.");
                        return; // Detiene la función y no abre WhatsApp
                    }
                }
                //  Número de WhatsApp (Incluye código de país y área, sin símbolos ni espacios)
                const numeroWhatsApp = "5493875466535";
                let totalGeneral = 0;

                // Mensaje que se enviará, incluyendo los productos y cantidades
                let mensaje = "¡Hola! Vengo desde la web de Cafetería Notables y quiero hacer el siguiente pedido:\n\n";
                //Sumamos la dirección escrita si se pidio para llevar
                if (pideDireccion) {
                    mensaje += `${fraseEntrega} ${direccionEscrita}\n`;
                } else {
                    mensaje += `${fraseEntrega}\n`;
                }
                mensaje += `-----------------------------------\n`;

                // Listamos los productos uno abajo del otro
                carritoActual.forEach((item, index) => {
                    let subtotalItem = item.precio * item.cantidad;
                    totalGeneral += subtotalItem;
                    // Listamos los productos sin asteriscos
                    mensaje += `${item.cantidad}x ${item.nombre}\n`;
                    // Opcional: si quieres que muestre el precio por ítem, descomenta la siguiente línea
                    // mensaje += `   (Subtotal: $${subtotalItem.toLocaleString()})\n`;
                });
                mensaje += `-----------------------------------\n`;
                mensaje += `TOTAL A PAGAR: $${totalGeneral.toLocaleString()}\n`;
                mensaje += `-----------------------------------\n`;
                mensaje += `¡Muchas gracias!`;

                // 4. Codificamos el mensaje para la URL
                let mensajeCodificado = encodeURIComponent(mensaje);
                let urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensajeCodificado}`;

                // Abro WhatsApp en una nueva pestaña
                window.open(urlWhatsApp, '_blank');
            });
        }
    };

    // Intento configurarlo al cargar y también por si se actualiza dinámicamente
    configurarBotonWhatsApp();
    setTimeout(configurarBotonWhatsApp, 500);
});
