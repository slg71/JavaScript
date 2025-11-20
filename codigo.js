/* ==========================================================================
   1. FUNCIONES DE COOKIES (Copiadas de las páginas 11 y 13)
   El enunciado nos da este código hecho, así que lo uso tal cual.
   ========================================================================== 
*/

// Función para guardar una cookie. 
// c_name: nombre, value: valor, expiredays: días que dura
function setCookie(c_name, value, expiredays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + expiredays);
    // Guardo la cookie escapando el valor y poniendo la fecha si hace falta
    // Le añado path=/ para que funcione en todas las carpetas de la web
    document.cookie = c_name + "=" + escape(value) +
        ((expiredays == null) ? "" : "; expires=" + exdate.toGMTString()) + "; path=/";
}

// Función para leer una cookie.
function getCookie(c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) c_end = document.cookie.length;
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return "";
}

/* ==========================================================================
   2. GESTIÓN DE ESTILOS (Basado en las páginas 9 y 10)
   Recorro los <link> y activo/desactivo según el título.
   ========================================================================== 
*/

function cambiarEstilo(titulo) {
    // Cojo todos los <link> de la página
    var arrayLink = document.getElementsByTagName('link');
    
    // Recorro uno a uno
    for (var i = 0; i < arrayLink.length; i++) {
        var link = arrayLink[i];
        
        // Miro si es una hoja de estilo (rel contiene stylesheet) y no es la de imprimir
        if (link.getAttribute('rel') != null && 
            link.getAttribute('rel').indexOf('stylesheet') != -1 && 
            link.getAttribute('media') != 'print') {

            var tituloHoja = link.getAttribute('title');
            
            // Si tiene título, es una de las que puedo cambiar (Principal o Noche)
            if (tituloHoja != null && tituloHoja.length > 0) {
                if (tituloHoja == titulo) {
                    // El PDF dice que disabled = false es ACTIVAR
                    link.disabled = false; 
                } else {
                    // disabled = true es DESACTIVAR
                    link.disabled = true;  
                }
            }
        }
    }

    /*SE GUARDA PERO AL CAMBIAR DE PÁGINA NO SE PONE*/
    // Guardar en cookie solo si el usuario aceptó cookies
    var aceptado = getCookie('aceptar_cookies');
    if (aceptado == 'si') {
        // Guardo la preferencia 45 días
        setCookie('estilo_seleccionado', titulo, 45); 
    }
}

/* ==========================================================================
   3. AL CARGAR LA PÁGINA (window.onload)
   Aquí pongo todo lo que tiene que arrancar al principio.
   ========================================================================== 
*/
window.onload = function() {
    
    // 1. Comprobar cookies y estilo guardado
    var decision = getCookie('aceptar_cookies');
    var estiloGuardado = getCookie('estilo_seleccionado');

    if (decision == 'si') {
        // Si ya aceptó, y hay un estilo guardado, lo pongo
        if (estiloGuardado != "" && estiloGuardado != null) {
            cambiarEstilo(estiloGuardado);
            
            // También actualizo el select para que se vea bien la opción
            var selector = document.getElementById("selector-estilo");
            if (selector) {
                selector.value = estiloGuardado;
            }
        }
    } else if (decision == "" || decision == null) {
        // Si no hay cookie de decisión, es la primera vez: muestro el banner
        mostrarBanner();
    }

    // 2. Asignar funciones a los botones y formularios
    
    // Cuando cambian el select de estilo
    var selector = document.getElementById("selector-estilo");
    if (selector) {
        selector.onchange = function() {
            // this.value es lo que ha elegido el usuario (Predeterminado o Noche)
            cambiarEstilo(this.value);
        };
    }

    // Validar Login
    var formLogin = document.getElementById("form-login");
    if (formLogin) {
        formLogin.onsubmit = function() {
            return validarLogin();
        };
    }

    // Validar Registro
    var formRegistro = document.getElementById("form-registro");
    if (formRegistro) {
        formRegistro.onsubmit = function() {
            return validarRegistro();
        };
    }

    // Ordenar Anuncios
    var selectorOrden = document.getElementById("selector-orden");
    if (selectorOrden) {
        selectorOrden.onchange = function() {
            ordenarAnuncios();
        };
    }

    // Botones de la página Política de Cookies (para arrepentirse)
    var btnRevertirSi = document.getElementById("btn-revertir-aceptar");
    if (btnRevertirSi) {
        btnRevertirSi.onclick = function() {
            aceptarCookies();
            alert("Has aceptado las cookies.");
        };
    }

    var btnRevertirNo = document.getElementById("btn-revertir-rechazar");
    if (btnRevertirNo) {
        btnRevertirNo.onclick = function() {
            rechazarCookies();
            alert("Has rechazado las cookies. Se borra tu estilo guardado.");
            cambiarEstilo("Predeterminado"); // Vuelvo al normal
        };
    }
};

/* ==========================================================================
   4. EL BANNER DE COOKIES (DOM Nodo a Nodo)
   usar createElement y appendChild en vez de innerHTML.
   ========================================================================== 
*/
function mostrarBanner() {
    // Creo la sección
    var seccion = document.createElement("section");
    seccion.id = "cookie-banner";
    seccion.className = "banner-cookies";
    
    // Creo el texto
    var texto = document.createElement("span");
    var contenidoTexto = document.createTextNode("Esta web usa cookies propias. ¿Aceptas? ");
    texto.appendChild(contenidoTexto);
    
    // Botón Aceptar
    var btnSi = document.createElement("button");
    var textoSi = document.createTextNode("Aceptar");
    btnSi.appendChild(textoSi);
    btnSi.onclick = function() {
        aceptarCookies();
        // Oculto el banner accediendo al estilo directamente
        seccion.style.display = "none"; 
    };
    
    // Botón Rechazar
    var btnNo = document.createElement("button");
    var textoNo = document.createTextNode("Rechazar");
    btnNo.appendChild(textoNo);
    btnNo.onclick = function() {
        rechazarCookies();
        seccion.style.display = "none"; 
    };
    
    // Meto todo dentro de la sección
    seccion.appendChild(texto);
    seccion.appendChild(btnSi);
    seccion.appendChild(btnNo);
    
    // Lo añado al body
    document.body.appendChild(seccion);
}

function aceptarCookies() {
    // Guardo 'si' por 90 días
    setCookie('aceptar_cookies', 'si', 90);
    
    // Si el usuario ya había cambiado el estilo antes de aceptar, lo guardo ahora
    var selector = document.getElementById("selector-estilo");
    if (selector) {
        setCookie('estilo_seleccionado', selector.value, 45);
    }
}

function rechazarCookies() {
    // Guardo 'no' por 90 días
    setCookie('aceptar_cookies', 'no', 90);
    // Borro la cookie de estilo poniéndole fecha caducada (-1)
    setCookie('estilo_seleccionado', "", -1); 
}

/* ==========================================================================
   5. VALIDACIONES
   ========================================================================== 
*/

// Función auxiliar para mostrar errores en el SPAN correspondiente
function mostrarError(id, mensaje) {
    var span = document.getElementById("error-" + id);
    
    // Limpio lo que hubiera antes
    while (span.firstChild) {
        span.removeChild(span.firstChild);
    }
    
    // Pongo el texto nuevo
    var texto = document.createTextNode(mensaje);
    span.appendChild(texto);
    span.className = "error-texto"; 
    
    var input = document.getElementById(id);
    input.className = "error-input";
}

function limpiarErrores() {
    var inputs = document.getElementsByTagName("input");
    for(var i=0; i<inputs.length; i++) {
        inputs[i].className = "";
    }
    
    var spans = document.getElementsByTagName("span");
    for(var j=0; j<spans.length; j++) {
        if(spans[j].id.indexOf("error-") != -1) {
             // Borramos el texto
             while (spans[j].firstChild) { spans[j].removeChild(spans[j].firstChild); }
             // Quitamos la clase roja también
             spans[j].className = ""; 
        }
    }
}

function validarLogin() {
    var usuario = document.getElementById("usuario").value;
    var pass = document.getElementById("pwd").value;
    var hayError = false;
    
    limpiarErrores();

    // "evita que el usuario escriba únicamente espacios en blanco"
    // Regex: \s son espacios. ^\s*$ significa "todo espacios de principio a fin".
    var regexVacio = /^\s*$/;

    if (regexVacio.test(usuario)) {
        mostrarError("usuario", "El usuario no puede estar vacío.");
        hayError = true;
    }
    if (regexVacio.test(pass)) {
        mostrarError("pwd", "La contraseña no puede estar vacía.");
        hayError = true;
    }

    // Devuelvo false si hay error para que el formulario NO se envíe
    return !hayError; 
}

function validarRegistro() {
    var usu = document.getElementById("usuario").value;
    var pass1 = document.getElementById("pwd").value;
    var pass2 = document.getElementById("pwd2").value;
    var email = document.getElementById("email").value;
    var hayError = false;

    limpiarErrores();

    // 1. USUARIO
    // Letras inglés (mayus/minus) y números. Empieza por letra. 3-15 caracteres.
    var regexUsu = /^[a-zA-Z][a-zA-Z0-9]{2,14}$/;
    if (!regexUsu.test(usu)) {
        mostrarError("usuario", "Usuario mal: empieza letra, solo letras/num, 3-15 car.");
        hayError = true;
    }

    // 2. CONTRASEÑA
    // 6-15 chars. Letras, nums, - y _. Debe tener 1 Mayus, 1 Minus, 1 Num.
    var errorPass = "";
    
    // Hago comprobaciones por partes para que sea más fácil
    if (pass1.length < 6 || pass1.length > 15) {
        errorPass = "Longitud incorrecta (6-15). ";
    } else if (!/[A-Z]/.test(pass1)) {
        errorPass = "Falta mayúscula. ";
    } else if (!/[a-z]/.test(pass1)) {
        errorPass = "Falta minúscula. ";
    } else if (!/[0-9]/.test(pass1)) {
        errorPass = "Falta número. ";
    } else if (!/^[a-zA-Z0-9\-_]+$/.test(pass1)) {
        errorPass = "Caracteres prohibidos (solo letras, num, - y _).";
    }

    if (errorPass != "") {
        mostrarError("pwd", errorPass);
        hayError = true;
    }

    if (pass1 != pass2) {
        mostrarError("pwd2", "Las contraseñas no coinciden.");
        hayError = true;
    }

    // 3. EMAIL
    // Divido por la arroba
    var partes = email.split("@");
    
    if (partes.length != 2) {
        mostrarError("email", "Falta la @ o hay demasiadas.");
        hayError = true;
    } else {
        var local = partes[0];
        var dominio = partes[1];

        // Valido parte Local
        // Regex: Letras, nums, y caracteres raros permitidos. 
        // Empieza y acaba sin punto se comprueba aparte.
        var regexLocalChars = /^[a-zA-Z0-9!#$%&'*+\-/=?^_`{|}~.]+$/;
        
        if (local.length < 1 || local.length > 64) {
            mostrarError("email", "Longitud local mal (1-64).");
            hayError = true;
        } else if (!regexLocalChars.test(local)) {
            mostrarError("email", "Caracteres prohibidos en parte local.");
            hayError = true;
        } else if (local.startsWith(".") || local.endsWith(".")) {
            mostrarError("email", "Punto al inicio o final (local).");
            hayError = true;
        } else if (local.indexOf("..") != -1) {
            mostrarError("email", "Dos puntos seguidos (local).");
            hayError = true;
        }

        // Valido Dominio
        else if (dominio.length > 255) {
             mostrarError("email", "Dominio muy largo.");
             hayError = true;
        } else {
            // El dominio se divide por puntos
            var subs = dominio.split(".");
            for (var k = 0; k < subs.length; k++) {
                var sub = subs[k];
                // Reglas subdominio: 1-63, letras/num/guion, no guion al principio/final
                var regexSub = /^[a-zA-Z0-9-]+$/;
                
                if (sub.length < 1 || sub.length > 63) {
                    mostrarError("email", "Subdominio mal longitud.");
                    hayError = true;
                    break;
                }
                if (!regexSub.test(sub)) {
                    mostrarError("email", "Caracter prohibido en dominio.");
                    hayError = true;
                    break;
                }
                if (sub.startsWith("-") || sub.endsWith("-")) {
                    mostrarError("email", "Guion al inicio o final en dominio.");
                    hayError = true;
                    break;
                }
            }
        }
    }

    if (hayError) {
        return false;
    } else {
        alert("¡Registro correcto!");
        return true;
    }
}

/* ==========================================================================
   6. ORDENACIÓN
   "Se tiene que realizar con las funciones del DOM nodo a nodo"
   ========================================================================== 
*/
function ordenarAnuncios() {
    var contenedor = document.getElementById("lista-anuncios");
    var selector = document.getElementById("selector-orden");
    
    // Cojo todos los <article> (son los anuncios)
    var elementos = contenedor.getElementsByTagName("article");
    
    // Los paso a un array de verdad para poder usar sort()
    var listaArray = [];
    for (var i = 0; i < elementos.length; i++) {
        listaArray.push(elementos[i]);
    }

    // Veo qué ha elegido el usuario
    var opcion = selector.value;

    // Ordeno el array
    listaArray.sort(function(a, b) {
        // Saco los datos de los atributos data- para comparar
        var precioA = parseFloat(a.getAttribute("data-precio"));
        var precioB = parseFloat(b.getAttribute("data-precio"));
        
        var tituloA = a.getAttribute("data-titulo").toLowerCase();
        var tituloB = b.getAttribute("data-titulo").toLowerCase();
        
        var fechaA = new Date(a.getAttribute("data-fecha"));
        var fechaB = new Date(b.getAttribute("data-fecha"));

        var ciudadA = a.getAttribute("data-ciudad").toLowerCase();
        var ciudadB = b.getAttribute("data-ciudad").toLowerCase();

        var paisA = a.getAttribute("data-pais").toLowerCase();
        var paisB = b.getAttribute("data-pais").toLowerCase();

        // Comparo según la opción elegida
        if (opcion == "precio-asc") {
            return precioA - precioB; // Menor a mayor
        } else if (opcion == "precio-desc") {
            return precioB - precioA; // Mayor a menor
        } 
        else if (opcion == "titulo-asc") {
            return tituloA.localeCompare(tituloB);
        } else if (opcion == "titulo-desc") {
            return tituloB.localeCompare(tituloA);
        }
        else if (opcion == "fecha-asc") {
            return fechaA - fechaB;
        } else if (opcion == "fecha-desc") {
            return fechaB - fechaA;
        }
        else if (opcion == "ciudad-asc") {
            return ciudadA.localeCompare(ciudadB);
        }
        else if (opcion == "pais-asc") {
            return paisA.localeCompare(paisB);
        }
        return 0;
    });

    // Vuelvo a ponerlos en el HTML ordenados (appendChild MUEVE el nodo, no lo duplica)
    for (var j = 0; j < listaArray.length; j++) {
        contenedor.appendChild(listaArray[j]);
    }
}