/* --- 1. GESTIÓN DE COOKIES --- */
/* Función copiada del PDF */
function setCookie(c_name, value, expiredays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + expiredays);
    // Se asegura el path=/ para que funcione en todo el sitio
    document.cookie = c_name + "=" + escape(value) +
        ((expiredays == null) ? "" : "; expires=" + exdate.toGMTString()) + "; path=/";
}

/* Función copiada del PDF */
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

/* --- 2. GESTIÓN DE ESTILOS --- */
function cambiarEstilo(titulo) {
    var arrayLink = document.getElementsByTagName('link');
    for (var i = 0; i < arrayLink.length; i++) {
        // Busamos links que sean stylesheets y no sean de impresión
        if (arrayLink[i].getAttribute('rel') != null && 
            arrayLink[i].getAttribute('rel').indexOf('stylesheet') != -1 && 
            arrayLink[i].getAttribute('media') != 'print') {
            
            var linkTitle = arrayLink[i].getAttribute('title');
            if (linkTitle != null && linkTitle.length > 0) {
                if (linkTitle == titulo) {
                    arrayLink[i].disabled = false;
                } else {
                    arrayLink[i].disabled = true;
                }
            }
        }
    }
    
    // Solo guardamos la cookie si el usuario aceptó previamente
    var acepta = getCookie('aceptar_cookies');
    if (acepta == 'si') {
        // Duración 45 días
        setCookie('estilo_seleccionado', titulo, 45);
    }
}

/* --- 3. INICIALIZACIÓN (ONLOAD) --- */
window.onload = function() {
    // 1. Recuperar estilo guardado si existe cookie
    var estilo = getCookie('estilo_seleccionado');
    if (estilo != "" && estilo != null) {
        cambiarEstilo(estilo);
        // Sincronizar el select si existe en la página
        var selector = document.getElementById("selector-estilo");
        if(selector) {
             selector.value = estilo;
        }
    }
    
    // 2. Comprobar aviso de cookies (aparece si no hay cookie definida)
    var acepta = getCookie('aceptar_cookies');
    if (acepta == "") {
        crearBannerCookies(); 
    }

    // Selector de estilo
    if (document.getElementById("selector-estilo")) {
        document.getElementById("selector-estilo").onchange = function() {
            cambiarEstilo(this.value);
        }
    }
    
    // Formulario Login
    if (document.getElementById("form-login")) {
        document.getElementById("form-login").onsubmit = function() {
            return validarLogin();
        }
    }

    // Formulario Registro
    if (document.getElementById("form-registro")) {
        document.getElementById("form-registro").onsubmit = function() {
            return validarRegistro();
        }
    }

    // Ordenación de anuncios
    if (document.getElementById("selector-orden")) {
        document.getElementById("selector-orden").onchange = function() {
            ordenarAnunciosBurbuja();
        }
    }
    
    // Página Política de Cookies: Botones para revertir decisión
    if (document.getElementById("btn-revertir-aceptar")) {
        document.getElementById("btn-revertir-aceptar").onclick = function() {
             gestionarConsentimiento('si');
        }
    }
    if (document.getElementById("btn-revertir-rechazar")) {
        document.getElementById("btn-revertir-rechazar").onclick = function() {
             gestionarConsentimiento('no');
        }
    }
};

/* --- 4. UI: BANNER Y AVISOS --- */
function crearBannerCookies() {
    var section = document.createElement("section");
    section.classList.add("banner-cookies"); 
    section.id = "banner-cookies";
    
    var p = document.createElement("p");
    var texto = document.createTextNode("Este sitio web usa cookies propias para mejorar la experiencia. ");
    p.appendChild(texto);
    section.appendChild(p);
    
    var btnAceptar = document.createElement("button");
    btnAceptar.appendChild(document.createTextNode("Aceptar"));
    btnAceptar.onclick = function() {
        gestionarConsentimiento('si');
        document.body.removeChild(section);
    };
    section.appendChild(btnAceptar);

    var btnRechazar = document.createElement("button");
    btnRechazar.appendChild(document.createTextNode("Rechazar"));
    btnRechazar.onclick = function() {
        gestionarConsentimiento('no');
        document.body.removeChild(section);
    };
    section.appendChild(btnRechazar);
    
    document.body.appendChild(section);
}

/* Función auxiliar para manejar la lógica de aceptación/rechazo */
function gestionarConsentimiento(accion) {
    if (accion == 'si') {
        // 90 días
        setCookie('aceptar_cookies', 'si', 90);
        mostrarAvisoFlotante("Has aceptado las cookies. Se guardará tu estilo.");
    } else {
        setCookie('aceptar_cookies', 'no', 90);
        // Si rechaza, borramos la cookie de estilo (fecha pasada)
        setCookie('estilo_seleccionado', "", -1);
        cambiarEstilo("Predeterminado");
        mostrarAvisoFlotante("Has rechazado las cookies. No se guardará tu estilo.");
    }
}

/* Aviso flotante que desaparece a los 5 segundos  */
function mostrarAvisoFlotante(mensaje) {
    // 1. Crear el elemento
    var aviso = document.createElement("section");
    aviso.classList.add("aviso-flotante");
    var texto = document.createTextNode(mensaje);
    aviso.appendChild(texto);

    // 2. Añadir al documento
    document.body.appendChild(aviso);

    // 3. Programar su eliminación a los 5 segundos
    setTimeout(function() {
        if (aviso.parentNode) {
            aviso.parentNode.removeChild(aviso);
        }
    }, 5000);
}

/* --- 5. VALIDACIONES --- */
/* Helper para limpiar errores visuales */
function limpiarErrores() {
    var inputs = document.getElementsByTagName("input");
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].classList.remove("error-input");
    }
    var spans = document.getElementsByClassName("error-texto");
    // Convertimos a array para evitar problemas al modificar la colección
    var listaSpans = [];
    for(var j=0; j<spans.length; j++) listaSpans.push(spans[j]);
    
    for (var k = 0; k < listaSpans.length; k++) {
        listaSpans[k].textContent = ""; 
    }
}

/* Helper para mostrar error */
function mostrarError(idInput, idSpan, mensaje) {
    var input = document.getElementById(idInput);
    var span = document.getElementById(idSpan);

    if (input) input.classList.add("error-input");

    if (span) {
        span.textContent = mensaje;
        span.classList.add("error-texto"); 
    }
}

function validarLogin() {
    limpiarErrores();
    var u = document.getElementById("usuario");
    var p = document.getElementById("pwd");
    var hayError = false;
    
    // Comprobar que no esté vacío ni solo espacios
    var regexVacio = /^\s*$/;
    
    if (regexVacio.test(u.value)) {
        mostrarError("usuario", "error-usuario", "El usuario es obligatorio.");
        hayError = true;
    }
    if (regexVacio.test(p.value)) {
        mostrarError("pwd", "error-pwd", "La contraseña es obligatoria.");
        hayError = true;
    }
    
    return !hayError;
}

function validarRegistro() {
    limpiarErrores();
    var usu = document.getElementById("usuario");
    var pass = document.getElementById("pwd");
    var pass2 = document.getElementById("pwd2");
    var email = document.getElementById("email");
    var hayError = false;

    // 1. Usuario: Letras inglés y números. NO empezar por número. 3-15 chars
    // ^[a-zA-Z] -> empieza por letra
    // [a-zA-Z0-9]{2,14}$ -> siguen 2 a 14 caracteres (total 3-15)
    var regexUsu = /^[a-zA-Z][a-zA-Z0-9]{2,14}$/;
    if (!regexUsu.test(usu.value)) {
        mostrarError("usuario", "error-usuario", "Usuario inválido (3-15 car., debe empezar por letra).");
        hayError = true;
    }

    // 2. Contraseña: 6-15 chars, letras inglesas, numeros, - y _.
    // Debe tener al menos 1 mayúscula, 1 minúscula y 1 número
    var p = pass.value;
    var longitudOk = p.length >= 6 && p.length <= 15;
    var caracteresOk = /^[a-zA-Z0-9\-_]+$/.test(p);
    var tieneMayus = /[A-Z]/.test(p);
    var tieneMinus = /[a-z]/.test(p);
    var tieneNum = /[0-9]/.test(p);

    if (!longitudOk) {
        mostrarError("pwd", "error-pwd", "La contraseña debe tener entre 6 y 15 caracteres.");
        hayError = true;
    } else if (!caracteresOk) {
        mostrarError("pwd", "error-pwd", "Caracteres no permitidos.");
        hayError = true;
    } else if (!tieneMayus || !tieneMinus || !tieneNum) {
        mostrarError("pwd", "error-pwd", "Debe contener mayúscula, minúscula y número.");
        hayError = true;
    }

    if (pass.value != pass2.value) {
        mostrarError("pwd2", "error-pwd2", "Las contraseñas no coinciden.");
        hayError = true;
    }

    // 3. Email: Validación manual estricta
    var em = email.value;
    var partes = em.split("@");
    
    if (partes.length != 2) {
        mostrarError("email", "error-email", "Formato incorrecto (falta @ o hay varias).");
        hayError = true;
    } else {
        var local = partes[0];
        var dominio = partes[1];
        
        // Parte local
        var regexLocalChars = /^[a-zA-Z0-9!#$%&'*+\-/=?^_`{|}~.]+$/;
        
        if (local.length < 1 || local.length > 64) {
            mostrarError("email", "error-email", "Longitud parte local incorrecta (1-64).");
            hayError = true;
        } else if (!regexLocalChars.test(local)) {
            mostrarError("email", "error-email", "Caracteres inválidos en parte local.");
            hayError = true;
        } else if (local.startsWith('.') || local.endsWith('.')) {
            mostrarError("email", "error-email", "El punto no puede ir al inicio o final.");
            hayError = true;
        } else if (local.indexOf('..') != -1) {
            mostrarError("email", "error-email", "No puede haber dos puntos seguidos.");
            hayError = true;
        } else if (dominio.length > 255) {
             mostrarError("email", "error-email", "Dominio demasiado largo.");
             hayError = true;
        } else {
            // Validación de subdominios
            var subdominios = dominio.split(".");
            if (subdominios.length < 2 && dominio.indexOf(".") == -1) { 
                // Se asume que debe haber al menos un punto en dominio
                // El PDF dice "secuencia de uno o más subdominios separados por punto" ?????
                mostrarError("email", "error-email", "El dominio debe contener al menos un punto y una extensión (ej: .com).");
                hayError = true;
            }
            
            for (var i = 0; i < subdominios.length; i++) {
                var sub = subdominios[i];
                var regexSub = /^[a-zA-Z0-9-]+$/;
                
                if (sub.length < 1 || sub.length > 63) {
                    mostrarError("email", "error-email", "Subdominio longitud incorrecta (1-63).");
                    hayError = true;
                    break;
                } else if (!regexSub.test(sub)) {
                    mostrarError("email", "error-email", "Caracteres inválidos en dominio.");
                    hayError = true;
                    break;
                } else if (sub.startsWith('-') || sub.endsWith('-')) {
                    mostrarError("email", "error-email", "Guion no puede ir al inicio o final del subdominio.");
                    hayError = true;
                    break;
                }
            }
        }
    }

    return !hayError;
}

/* --- 6. ORDENACIÓN (Bubble Sort) --- */

function ordenarAnunciosBurbuja() {
    var contenedor = document.getElementById("lista-anuncios");
    if (!contenedor) return;

    var articulos = contenedor.getElementsByTagName("article");
    var criterio = document.getElementById("selector-orden").value;
    
    // Convertir HTMLCollection a Array para manipular
    var lista = [];
    for(var i=0; i<articulos.length; i++) {
        lista.push(articulos[i]);
    }
    
    /* Algoritmo de la Burbuja */
    for (var i = 0; i < lista.length - 1; i++) {
        for (var j = 0; j < lista.length - 1 - i; j++) {
            
            var nodoA = lista[j];
            var nodoB = lista[j+1];
            
            var valA = obtenerValorCriterio(nodoA, criterio);
            var valB = obtenerValorCriterio(nodoB, criterio);
            
            // Determinar si hay que intercambiar
            var intercambiar = false;
            
            // Detectar si es orden ascendente o descendente
            if (criterio.indexOf("asc") != -1) {
                if (valA > valB) intercambiar = true;
            } else {
                // Descendente
                if (valA < valB) intercambiar = true;
            }
            
            if (intercambiar) {
                var temp = lista[j];
                lista[j] = lista[j+1];
                lista[j+1] = temp;
            }
        }
    }
    
    // Reinsertar en el DOM nodo a nodo (appendChild mueve el elemento existente) 
    for(var k=0; k<lista.length; k++) {
        contenedor.appendChild(lista[k]);
    }
}

/* Función auxiliar para extraer el dato del DOM según el criterio */
function obtenerValorCriterio(nodo, criterio) {
    // 1. PRECIO
    if (criterio.indexOf("precio") != -1) {
        var texto = nodo.textContent || nodo.innerText;
        // Buscamos donde empiezan los dos puntos
        var inicio = texto.indexOf(":");
        if (inicio != -1) {
            // Extraemos desde los dos puntos hasta el final
            var valorSucio = texto.substring(inicio + 1);
            // parseInt detendrá la lectura al encontrar el símbolo € no numérico
            return parseInt(valorSucio); 
        }
        return 0;
    } 
    // 2. TÍTULO
    else if (criterio.indexOf("titulo") != -1) {
        var h3 = nodo.getElementsByTagName("h3");
        if (h3.length > 0) {
             // Convertimos a minúsculas para ordenar bien
            return h3[0].textContent.toLowerCase();
        }
        return "";
    }
    // 3. FECHA, CIUDAD y PAÍS
    else {
        var parrafos = nodo.getElementsByTagName("p");

        for (var i = 0; i < parrafos.length; i++) {
            var pTexto = parrafos[i].textContent.toLowerCase();
            // A) Caso FECHA
            // Buscamos la palabra "fecha" usando indexOf
            if (criterio.indexOf("fecha") != -1 && pTexto.indexOf("fecha") != -1) {
                var inicio = pTexto.indexOf(":");
                if (inicio != -1) {
                    // Extraemos la fecha
                    // substring(inicio + 1) toma desde los dos puntos al final
                    var fechaTexto = pTexto.substring(inicio + 1);
                    
                    // Pasamos el string al constructor Date para poder comparar tiempos
                    var fechaObj = new Date(fechaTexto);
                    return fechaObj.getTime();
                }
            }

            // B) Caso UBICACIÓN (Ciudad o País)
            // <p>Ubicación: Madrid, España</p>
            if ((criterio.indexOf("ciudad") != -1 || criterio.indexOf("pais") != -1) && pTexto.indexOf("ubicación") != -1) {
                
                var dosPuntos = pTexto.indexOf(":");
                if (dosPuntos != -1) {
                    // Obtenemos " madrid, españa"
                    var resto = pTexto.substring(dosPuntos + 1);
                    // Buscamos la coma separadora como con las cookies
                    var coma = resto.indexOf(",");
                    
                    if (criterio.indexOf("ciudad") != -1) {
                        if (coma != -1) {
                            // Ciudad es desde el inicio hasta la coma
                            return resto.substring(0, coma);
                        } else {
                            return resto; // Si no hay coma, devolvemos todo
                        }
                    } else {
                        // PAÍS
                        if (coma != -1) {
                            // País es desde la coma + 1 hasta el final
                            return resto.substring(coma + 1);
                        }
                    }
                }
            }
        }
        return "";
    }
}