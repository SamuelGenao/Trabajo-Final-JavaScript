const API_KEY =
    "kBhHqj1I5ryFfemUfBNiKbwERKpE4zZz2UnaS4xUDfmLJnF2gC9n0VLd";

const API_URL =
    "https://api.pexels.com/v1/search";

// Elementos del formulario

const formulario =
    document.querySelector("#formularioBusqueda");

const campoBusqueda =
    document.querySelector("#terminoBusqueda");

const selectOrientacion =
    document.querySelector("#orientacion");

const selectCantidad =
    document.querySelector("#cantidad");

const botonLimpiar =
    document.querySelector("#botonLimpiar");

const mensajeFormulario =
    document.querySelector("#mensajeFormulario");

// Resultados

const estadoAplicacion =
    document.querySelector("#estadoAplicacion");

const cargador =
    document.querySelector("#cargador");

const galeriaImagenes =
    document.querySelector("#galeriaImagenes");

const contadorResultados =
    document.querySelector("#contadorResultados");

const tituloResultados =
    document.querySelector("#tituloResultados");

// Favoritos

const galeriaFavoritos =
    document.querySelector("#galeriaFavoritos");

const estadoFavoritos =
    document.querySelector("#estadoFavoritos");

const botonVaciarFavoritos =
    document.querySelector("#botonVaciarFavoritos");

let favoritos = [];

// Eventos

formulario.addEventListener(
    "submit",
    iniciarBusqueda
);

botonLimpiar.addEventListener(
    "click",
    limpiarBusqueda
);

botonVaciarFavoritos.addEventListener(
    "click",
    vaciarFavoritos
);

cargarFavoritos();

// Buscar imágenes

function iniciarBusqueda(evento) {

    evento.preventDefault();

    const termino =
        campoBusqueda.value.trim();

    const orientacion =
        selectOrientacion.value;

    const cantidad =
        selectCantidad.value;

    if (termino === "") {

        mostrarMensaje(
            "Debes escribir una palabra antes de buscar.",
            "error"
        );

        campoBusqueda.focus();

        return;
    }

    mostrarMensaje(
        `Buscando imágenes relacionadas con: ${termino}`,
        "informacion"
    );

    buscarImagenes(
        termino,
        orientacion,
        cantidad
    );
}

async function buscarImagenes(
    termino,
    orientacion,
    cantidad
) {

    mostrarCargador();

    let url =
        `${API_URL}?query=${encodeURIComponent(termino)}` +
        `&per_page=${cantidad}`;

    if (orientacion !== "") {
        url += `&orientation=${orientacion}`;
    }

    try {

        const respuesta =
            await fetch(url, {
                headers: {
                    Authorization: API_KEY
                }
            });

        if (!respuesta.ok) {
            throw new Error(
                `Error ${respuesta.status}`
            );
        }

        const datos =
            await respuesta.json();

        mostrarImagenes(datos.photos);

    } catch (error) {

        console.error(error);

        mostrarError(
            "No fue posible obtener las imágenes. Verifica tu conexión e inténtalo nuevamente."
        );
    }
}

// Mostrar resultados

function mostrarCargador() {

    estadoAplicacion.classList.add("oculto");

    galeriaImagenes.innerHTML = "";

    cargador.classList.remove("oculto");

    tituloResultados.textContent =
        "Buscando imágenes";

    contadorResultados.textContent =
        "Espera un momento...";
}

function mostrarImagenes(imagenes) {

    cargador.classList.add("oculto");

    galeriaImagenes.innerHTML = "";

    estadoAplicacion.classList.add("oculto");

    if (!imagenes || imagenes.length === 0) {

        mostrarError(
            "No se encontraron imágenes relacionadas con la búsqueda."
        );

        return;
    }

    imagenes.forEach(function (imagen) {

        const tarjeta =
            crearTarjeta(imagen);

        galeriaImagenes.appendChild(tarjeta);
    });

    tituloResultados.textContent =
        "Resultados encontrados";

    contadorResultados.textContent =
        `${imagenes.length} imágenes mostradas`;

    mostrarMensaje(
        "Búsqueda completada correctamente.",
        "exito"
    );
}

function crearTarjeta(imagen) {

    const tarjeta =
        document.createElement("article");

    tarjeta.classList.add("tarjeta-imagen");

    const estaGuardada =
        favoritos.some(function (favorito) {
            return favorito.id === imagen.id;
        });

    tarjeta.innerHTML = `
        <div class="contenedor-imagen">

            <img
                src="${imagen.src.large2x}"
                alt="${imagen.alt || "Imagen de Pexels"}"
                class="imagen-resultado"
                loading="lazy"
            >

            <button
                type="button"
                class="boton-favorito ${estaGuardada ? "activo" : ""}"
                data-id="${imagen.id}"
                aria-label="Agregar o eliminar de favoritos"
                title="Agregar o eliminar de favoritos"
            >
                ${estaGuardada ? "♥" : "♡"}
            </button>

        </div>

        <div class="informacion-imagen">

            <p class="nombre-fotografo">
                Foto de ${imagen.photographer}
            </p>

            <div class="acciones-imagen">

                <a
                    href="${imagen.url}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="enlace-pexels"
                >
                    Ver en Pexels
                </a>

                <a
                    href="${imagen.src.original}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="enlace-descarga"
                >
                    Ver imagen
                </a>

            </div>

        </div>
    `;

    const boton =
        tarjeta.querySelector(".boton-favorito");

    boton.addEventListener(
        "click",
        function () {
            cambiarFavorito(imagen);
        }
    );

    return tarjeta;
}

// Favoritos

function cambiarFavorito(imagen) {

    const indice =
        favoritos.findIndex(function (favorito) {
            return favorito.id === imagen.id;
        });

    if (indice === -1) {

        favoritos.push(imagen);

        mostrarMensaje(
            "Imagen agregada a favoritos.",
            "exito"
        );

    } else {

        favoritos.splice(indice, 1);

        mostrarMensaje(
            "Imagen eliminada de favoritos.",
            "informacion"
        );
    }

    guardarFavoritos();

    mostrarFavoritos();

    actualizarBotonesFavoritos();
}

function guardarFavoritos() {

    localStorage.setItem(
        "pixelFinderFavoritos",
        JSON.stringify(favoritos)
    );
}

function cargarFavoritos() {

    const datosGuardados =
        localStorage.getItem(
            "pixelFinderFavoritos"
        );

    if (datosGuardados) {

        try {

            favoritos =
                JSON.parse(datosGuardados);

        } catch (error) {

            favoritos = [];

            console.error(
                "No fue posible cargar los favoritos.",
                error
            );
        }
    }

    mostrarFavoritos();
}

function mostrarFavoritos() {

    galeriaFavoritos.innerHTML = "";

    if (favoritos.length === 0) {

        estadoFavoritos.classList.remove("oculto");

        return;
    }

    estadoFavoritos.classList.add("oculto");

    favoritos.forEach(function (imagen) {

        const tarjeta =
            crearTarjeta(imagen);

        galeriaFavoritos.appendChild(tarjeta);
    });
}

function actualizarBotonesFavoritos() {

    const botones =
        document.querySelectorAll(
            ".boton-favorito"
        );

    botones.forEach(function (boton) {

        const id =
            Number(boton.dataset.id);

        const estaGuardada =
            favoritos.some(function (favorito) {
                return favorito.id === id;
            });

        if (estaGuardada) {

            boton.textContent = "♥";

            boton.classList.add("activo");

        } else {

            boton.textContent = "♡";

            boton.classList.remove("activo");
        }
    });
}

function vaciarFavoritos() {

    if (favoritos.length === 0) {

        mostrarMensaje(
            "No hay imágenes favoritas para eliminar.",
            "informacion"
        );

        return;
    }

    const confirmar =
        window.confirm(
            "¿Deseas eliminar todas las imágenes favoritas?"
        );

    if (!confirmar) {
        return;
    }

    favoritos = [];

    guardarFavoritos();

    mostrarFavoritos();

    actualizarBotonesFavoritos();

    mostrarMensaje(
        "Todos los favoritos fueron eliminados.",
        "exito"
    );
}

// Limpiar

function limpiarBusqueda() {

    formulario.reset();

    galeriaImagenes.innerHTML = "";

    cargador.classList.add("oculto");

    estadoAplicacion.classList.remove("oculto");

    estadoAplicacion.innerHTML = `
        <div class="estado-icono">
            PF
        </div>

        <h3>
            Comienza tu búsqueda
        </h3>

        <p>
            Escribe el tipo de fotografía que necesitas.
        </p>
    `;

    tituloResultados.textContent =
        "Imágenes para inspirarte";

    contadorResultados.textContent =
        "Realiza una búsqueda para mostrar resultados.";

    mostrarMensaje(
        "Escribe una palabra relacionada con la imagen que necesitas.",
        "normal"
    );

    campoBusqueda.focus();
}

// Mensajes

function mostrarError(mensaje) {

    cargador.classList.add("oculto");

    galeriaImagenes.innerHTML = "";

    estadoAplicacion.classList.remove("oculto");

    estadoAplicacion.innerHTML = `
        <div class="estado-icono">
            !
        </div>

        <h3>
            Ocurrió un problema
        </h3>

        <p>
            ${mensaje}
        </p>
    `;

    tituloResultados.textContent =
        "No pudimos completar la búsqueda";

    contadorResultados.textContent =
        "Intenta nuevamente.";

    mostrarMensaje(
        mensaje,
        "error"
    );
}

function mostrarMensaje(mensaje, tipo) {

    mensajeFormulario.textContent =
        mensaje;

    if (tipo === "error") {

        mensajeFormulario.style.color =
            "#d6455d";

    } else if (tipo === "exito") {

        mensajeFormulario.style.color =
            "#168969";

    } else if (tipo === "informacion") {

        mensajeFormulario.style.color =
            "#6847f5";

    } else {

        mensajeFormulario.style.color =
            "#667085";
    }
}