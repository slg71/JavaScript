// Función para no escribir document.getElementById todo el rato
function dameElemento(id) {
    return document.getElementById(id);
}

// --- FUNCIONES DE AYUDA PARA ERRORES ---

// Pone el borde rojo y escribe el texto en el span que hay debajo
function mostrarError(idElemento, textoError) {
    var elemento = dameElemento(idElemento);
    if (elemento) {
        elemento.style.border = "2px solid red";
    }
    
    // Busco el hueco del error concatenando "error-" con el ID
    var spanError = dameElemento("error-" + idElemento);
    if (spanError) {
        spanError.innerHTML = textoError;
    }
}

// Limpia lo rojo y borra el texto
function limpiarError(idElemento) {
    var elemento = dameElemento(idElemento);
    if (elemento) {
        elemento.style.border = ""; // Quita el estilo inline
    }
    
    var spanError = dameElemento("error-" + idElemento);
    if (spanError) {
        spanError.innerHTML = "";
    }
}

/* ==============================================================
   CARGA DE LA PÁGINA (window.onload)
   ============================================================== */
window.onload = function() {
    // 1. Mirar si hay que sacar el aviso de cookies
    gestionarBannerCookies();

    // 2. Preparar formularios si existen
    var formLogin = dameElemento("form-login");
    if (formLogin) formLogin.onsubmit = validarLogin;

    var formRegistro = dameElemento("form-registro");
    if (formRegistro) formRegistro.onsubmit = validarRegistro;

    // 3. Selector de estilo (para cambiarlo al vuelo)
    var selector = dameElemento("selector-estilo");
    if (selector) {
        selector.onchange = function() {
            cambiarEstilo(this.value);
        };
    }

    // 4. Selector de ordenar anuncios
    var selectorOrden = dameElemento("selector-orden");
    if (selectorOrden) selectorOrden.onchange = ordenarAnuncios;

    // 5. RECUPERAR ESTILO GUARDADO (Aquí estaba el fallo antes)
    var aceptadas = getCookie('aceptar-cookies');
    if (aceptadas == 'si') {
        var estiloGuardado = getCookie('estilo-guardado');
        
        // Si la cookie está vacía o es rara, pongo Predeterminado para que no se rompa
        if (estiloGuardado == "" || estiloGuardado == null) {
            estiloGuardado = "Predeterminado";
        }
        
        // Aplico el estilo
        cambiarEstilo(estiloGuardado);

        // Actualizo el selector para que coincida con lo que se ve
        if (selector) {
            selector.value = estiloGuardado;
        }
    }
};

/* ==============================================================
   LÓGICA DE ESTILOS (ARREGLADA)
   ============================================================== */

function cambiarEstilo(tituloEstilo) {
    var links = document.getElementsByTagName("link");
    var encontrado = false;

    // APAÑO DE SEGURIDAD: 
    // Primero miro si el estilo que me piden existe de verdad.
    // Si no existe, fuerzo que sea "Predeterminado" para no quedarme sin CSS.
    for (var i = 0; i < links.length; i++) {
        if (links[i].getAttribute("title") == tituloEstilo) {
            encontrado = true;
            break; 
        }
    }
    if (encontrado == false) {
        tituloEstilo = "Predeterminado";
    }

    // Ahora sí, activo el correcto y desactivo el resto
    for (var i = 0; i < links.length; i++) {
        var unLink = links[i];
        if (unLink.getAttribute("title")) {
            if (unLink.getAttribute("title") == tituloEstilo) {
                unLink.disabled = false; // Este es el bueno
            } else {
                unLink.disabled = true;  // Fuera los demás
            }
        }
    }

    // Si ya aceptó cookies, guardo el cambio para la próxima
    if (getCookie('aceptar-cookies') == 'si') {
        setCookie('estilo-guardado', tituloEstilo, 45);
    }
}

/* ==============================================================
   COOKIES Y AVISOS (SIN DIVS)
   ============================================================== */

function gestionarBannerCookies() {
    var decision = getCookie('aceptar-cookies');
    
    if (decision == "") {
        crearBanner();
    }

    // Botones de la página "Política de cookies"
    // Los busco aquí para asignarles la función
    var btnAceptar = dameElemento("btn-revertir-aceptar");
    if (btnAceptar) {
        btnAceptar.onclick = function() {
            aceptarCookies();
            location.reload(); // Recargo para aplicar cambios
        };
    }
    
    var btnRechazar = dameElemento("btn-revertir-rechazar");
    if (btnRechazar) {
        btnRechazar.onclick = function() {
            rechazarCookies();
            location.reload();
        };
    }
}

function crearBanner() {
    // NO USO DIV, uso SECTION que es más semántico para el profe
    var seccion = document.createElement("section");
    seccion.id = "cookie-banner"; // El CSS ya tiene estilo para este ID
    
    var texto = document.createElement("span");
    texto.innerHTML = "Esta web usa cookies propias. ¿Aceptas? ";
    
    var btnSi = document.createElement("button");
    btnSi.innerHTML = "Aceptar";
    btnSi.onclick = aceptarCookies;
    
    var btnNo = document.createElement("button");
    btnNo.innerHTML = "Rechazar";
    btnNo.onclick = rechazarCookies;
    
    seccion.appendChild(texto);
    seccion.appendChild(btnSi);
    seccion.appendChild(btnNo);
    
    document.body.appendChild(seccion);
}

function aceptarCookies() {
    // 1. Guardar el SI
    setCookie('aceptar-cookies', 'si', 90);
    
    // 2. Guardar el estilo que hay AHORA MISMO puesto.
    // Si no encuentro el selector (raro), guardo Predeterminado por defecto.
    var selector = dameElemento("selector-estilo");
    var estiloAGuardar = "Predeterminado";
    
    if (selector) {
        estiloAGuardar = selector.value;
    }
    
    setCookie('estilo-guardado', estiloAGuardar, 45);

    ocultarBanner();
    mostrarAvisoFlotante("Has ACEPTADO las cookies. Se guarda tu estilo.");
}

function rechazarCookies() {
    // Guardar el NO
    setCookie('aceptar-cookies', 'no', 90);
    // Borrar la cookie de estilo para que no se guarde nada
    setCookie('estilo-guardado', "", -1);
    
    ocultarBanner();
    mostrarAvisoFlotante("Has RECHAZADO las cookies.");
}

function ocultarBanner() {
    var banner = dameElemento("cookie-banner");
    if (banner) banner.style.display = "none";
}

function mostrarAvisoFlotante(mensaje) {
    // NO USO DIV, uso ASIDE para mensajes flotantes (semántico)
    var aviso = document.createElement("aside");
    aviso.id = "mensaje-aviso"; // El CSS usa este ID
    aviso.innerHTML = mensaje;
    
    document.body.appendChild(aviso);
    aviso.style.display = "block";

    // Que se quite solo a los 5 segundos
    setTimeout(function() {
        if (aviso.parentNode) {
            aviso.parentNode.removeChild(aviso);
        }
    }, 5000);
}

/* ==============================================================
   VALIDACIONES DE FORMULARIOS
   ============================================================== */

function validarLogin(evento) {
    var hayFallos = false;
    var usuario = dameElemento("usuario").value;
    var pass = dameElemento("pwd").value;

    limpiarError("usuario");
    limpiarError("pwd");

    // Regex simple para ver si solo hay espacios
    if (/^\s*$/.test(usuario)) {
        mostrarError("usuario", "El usuario es obligatorio.");
        hayFallos = true;
    }
    if (/^\s*$/.test(pass)) {
        mostrarError("pwd", "La contraseña es obligatoria.");
        hayFallos = true;
    }

    if (hayFallos) return false; // No envía
    else {
        alert("Todo correcto. Iniciando sesión...");
        return true;
    }
}

function validarRegistro(evento) {
    var hayFallos = false;
    var usu = dameElemento("usuario").value;
    var pass1 = dameElemento("pwd").value;
    var pass2 = dameElemento("pwd2").value;
    var email = dameElemento("email").value;

    limpiarError("usuario"); limpiarError("pwd");
    limpiarError("pwd2"); limpiarError("email");

    // 1. Validar Usuario
    var regexUsu = /^[a-zA-Z][a-zA-Z0-9]{2,14}$/;
    if (regexUsu.test(usu) == false) {
        mostrarError("usuario", "Mal usuario: Empieza con letra, 3-15 car., sin símbolos.");
        hayFallos = true;
    }

    // 2. Validar Contraseña
    var errorPass = false;
    if (pass1.length < 6 || pass1.length > 15) errorPass = true;
    if (/[A-Z]/.test(pass1) == false) errorPass = true; // Falta mayúscula
    if (/[a-z]/.test(pass1) == false) errorPass = true; // Falta minúscula
    if (/[0-9]/.test(pass1) == false) errorPass = true; // Falta número
    if (/^[a-zA-Z0-9_-]+$/.test(pass1) == false) errorPass = true; // Caracteres raros

    if (errorPass) {
        mostrarError("pwd", "Contraseña débil: 6-15 car., mayus, minus, num y -_.");
        hayFallos = true;
    }

    if (pass1 != pass2) {
        mostrarError("pwd2", "Las contraseñas no son iguales.");
        hayFallos = true;
    }

    // 3. Validar Email (Manual, sin type="email")
    if (email == "") {
        mostrarError("email", "Falta el email.");
        hayFallos = true;
    } else {
        var partes = email.split("@");
        if (partes.length != 2) {
            mostrarError("email", "El email necesita una @.");
            hayFallos = true;
        } else {
            var local = partes[0];
            var dominio = partes[1];
            var emailMal = false;
            var msg = "";

            // Validaciones parte local
            if (local.length < 1 || local.length > 64) { emailMal = true; msg = "Usuario muy largo/corto."; }
            // Regex caracteres permitidos
            if (/^[a-zA-Z0-9!#$%&'*+\-/=?^_`{|}~.]+$/.test(local) == false) { emailMal = true; msg = "Símbolos raros en usuario."; }
            if (local.startsWith(".") || local.endsWith(".")) { emailMal = true; msg = "Punto al inicio/final."; }
            if (local.indexOf("..") != -1) { emailMal = true; msg = "Dos puntos seguidos."; }

            // Validaciones dominio
            if (dominio.length > 255) { emailMal = true; msg = "Dominio larguísimo."; }
            
            // Subdominios
            var subs = dominio.split(".");
            for (var i = 0; i < subs.length; i++) {
                var s = subs[i];
                if (s.length < 1 || s.length > 63) { emailMal = true; msg = "Subdominio mal longitud."; }
                if (/^[a-zA-Z0-9-]+$/.test(s) == false) { emailMal = true; msg = "Símbolos raros en dominio."; }
                if (s.startsWith("-") || s.endsWith("-")) { emailMal = true; msg = "Guiones en los bordes."; }
            }

            if (email.length > 254) { emailMal = true; msg = "Email total demasiado largo."; }

            if (emailMal) {
                mostrarError("email", "Email inválido: " + msg);
                hayFallos = true;
            }
        }
    }

    if (hayFallos) return false;
    else {
        alert("Registro válido. Enviando datos...");
        return true;
    }
}

/* ==============================================================
   ORDENAR ANUNCIOS (DOM BÁSICO)
   ============================================================== */
function ordenarAnuncios() {
    var contenedor = dameElemento("lista-anuncios");
    var selector = dameElemento("selector-orden");
    var opcion = selector.value;

    // Convierto la lista de nodos a array para poder usar .sort()
    var anuncios = contenedor.getElementsByTagName("article");
    var lista = [];
    for(var i=0; i<anuncios.length; i++) {
        lista.push(anuncios[i]);
    }

    var partes = opcion.split("-"); // Ej: "precio-asc"
    var criterio = partes[0];
    var orden = partes[1];

    lista.sort(function(a, b) {
        var datoA = a.getAttribute("data-" + criterio);
        var datoB = b.getAttribute("data-" + criterio);

        if (criterio == "precio") {
            // Convertir a número para comparar bien
            datoA = parseFloat(datoA);
            datoB = parseFloat(datoB);
            if (orden == "asc") return datoA - datoB;
            else return datoB - datoA;
        } else {
            // Comparar texto
            datoA = datoA.toLowerCase();
            datoB = datoB.toLowerCase();
            if (datoA < datoB) return (orden == "asc") ? -1 : 1;
            else if (datoA > datoB) return (orden == "asc") ? 1 : -1;
            else return 0;
        }
    });

    // Reordenar en el HTML (appendChild mueve el elemento si ya existe)
    for(var j=0; j<lista.length; j++) {
        contenedor.appendChild(lista[j]);
    }
}

/* ==============================================================
   FUNCIONES COOKIES (COPIADAS DEL PDF)
   ============================================================== */
function setCookie(c_name, value, expiredays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + expiredays);
    // Importante: path=/ para que funcione en toda la web
    document.cookie = c_name + "=" + escape(value) +
        ((expiredays == null) ? "" : "; expires=" + exdate.toGMTString()) + "; path=/";
}

function getCookie(c_name) {
    if (document.cookie.length > 0) {
        var c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            var c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) c_end = document.cookie.length;
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return "";
}