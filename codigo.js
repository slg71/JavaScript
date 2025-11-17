function $(selector) {
    return document.querySelector(selector);
}

// --- Funciones de Ayuda ---

function setError(selector) {
    $(selector).style.border = "2px solid red";
}

function clearError(selector) {
    $(selector).style.border = "";
}

// "...selectores" pa varios campos a la vez
function resetCampos(...selectores) {
    for (const selector of selectores) {
        clearError(selector);
    }
}

function finalizarValidacion(event, valido, mensaje, mensajeExito) {
    if (!valido) {
        alert("Por favor, corrige los siguientes errores:\n\n" + mensaje);
        event.preventDefault(); //pa no enviarlo
    } else {
        alert(mensajeExito);
    }
}


// --- Lógica Principal ---
document.addEventListener("DOMContentLoaded", function() {
    // Para la página de Login
    const formLogin = $("#login form");
    if (formLogin) {
        formLogin.addEventListener("submit", validarLogin);
    }

    // Para la página de Registro
    const formReg = $("#registro form");
    if (formReg) {
        formReg.addEventListener("submit", validarRegistro);
    }

    // Conectar el selector de estilo
    var selectorEstilo = $("#selector-estilo");
    if (selectorEstilo) {
        // Cuando cambie el <select>, llamo a la función 'estilo'
        selectorEstilo.addEventListener("change", function() {
            // 'this.value' es el valor del <option> seleccionado
            estilo(this.value); 
        });
    }

    // --- Conectar el selector de orden ---
    var selectorOrden = $("#selector-orden");
    if (selectorOrden) {
        // Cuando cambie el <select>, llamo a la función 'ordenarAnuncios'
        selectorOrden.addEventListener("change", ordenarAnuncios);
    }

    // Al cargar la página, miro si hay una cookie guardada
    var estiloGuardado = getCookie('estilo-guardado');
    
    if (estiloGuardado != "") { // Si hay algo guardado...
        // 1. Aplico el estilo guardado
        estilo(estiloGuardado);
        
        // 2. Actualizo el <select> para que muestre el estilo actual
        if (selectorEstilo) {
            selectorEstilo.value = estiloGuardado;
        }
    }
});

/*=================================VALIDACIÓN FORMULARIOS=================================*/
function validarLogin(event) {
    const noVacioRegex = /^\s*$/;
    const usuario = $("#usuario").value;
    const pwd = $("#pwd").value;
    let valido = true;
    let mensaje = "";
    resetCampos("#usuario", "#pwd"); 
    if (noVacioRegex.test(usuario)) {
        mensaje += "- El campo 'Usuario' no puede estar vacío.\n";
        setError("#usuario");
        valido = false;
    }
    if (noVacioRegex.test(pwd)) {
        mensaje += "- El campo 'Contraseña' no puede estar vacío.\n";
        setError("#pwd");
        valido = false;
    }
    finalizarValidacion(event, valido, mensaje, "Inicio de sesión correcto. Redirigiendo a Inicio...");
}

function validarRegistro(event) {
    const usuario = $("#usuario").value;
    const pwd = $("#pwd").value;
    const pwd2 = $("#pwd2").value;
    const email = $("#email").value;
    let valido = true;
    let mensaje = "";
    resetCampos("#usuario", "#pwd", "#pwd2", "#email");
    const usuarioRegex = /^[a-zA-Z][a-zA-Z0-9]{2,14}$/;
    if (usuario === "") {
        mensaje += "- El campo 'Usuario' no puede estar vacío.\n";
        setError("#usuario");
        valido = false;
    } else if (!usuarioRegex.test(usuario)) {
        mensaje += "- El 'Usuario' debe:\n";
        mensaje += "  · Empezar con una letra.\n";
        mensaje += "  · Contener solo letras inglesas y números.\n";
        mensaje += "  · Tener entre 3 y 15 caracteres.\n";
        setError("#usuario");
        valido = false;
    }
    const pwdRegexCaracteres = /^[a-zA-Z0-9_-]{6,15}$/;
    const pwdRegexMayus = /[A-Z]/;
    const pwdRegexMinus = /[a-z]/;
    const pwdRegexNum = /\d/;
    let pwdValida = true;
    if (pwd === "") {
        mensaje += "- El campo 'Contraseña' no puede estar vacío.\n";
        pwdValida = false;
    } else {
        if (!pwdRegexCaracteres.test(pwd)) {
            mensaje += "- La 'Contraseña' debe tener entre 6 y 15 caracteres (solo letras, números, '-' o '_').\n";
            pwdValida = false;
        }
        if (!pwdRegexMayus.test(pwd)) {
            mensaje += "- La 'Contraseña' debe tener al menos una mayúscula.\n";
            pwdValida = false;
        }
        if (!pwdRegexMinus.test(pwd)) {
            mensaje += "- La 'Contraseña' debe tener al menos una minúscula.\n";
            pwdValida = false;
        }
        if (!pwdRegexNum.test(pwd)) {
            mensaje += "- La 'Contraseña' debe tener al menos un número.\n";
            pwdValida = false;
        }
    }
    if (!pwdValida) {
        setError("#pwd");
        valido = false;
    }
    if (pwd2 === "") {
        mensaje += "- Debes repetir la contraseña.\n";
        setError("#pwd2");
        valido = false;
    } else if (pwd !== pwd2) {
        mensaje += "- Las contraseñas no coinciden.\n";
        setError("#pwd2");
        valido = false;
    }
    if (email === "") {
        mensaje += "- El campo 'Dirección de email' no puede estar vacío.\n";
        setError("#email");
        valido = false;
    } else if (email.length > 254) {
        setError("#email");
        valido = false;
    }
    finalizarValidacion(event, valido, mensaje, "Registro correcto. Redirigiendo a Inicio...");
}


/*=================================NUEVAS FUNCIONES (ESTILO Y ORDENAR)=================================*/

//copiado del pdf
function estilo(titulo) {
    // 1. Pillo todas las etiquetas <link> del documento
    var arrayLink = document.getElementsByTagName('link');
    
    // 2. Las recorro una por una
    for(var i=0; i < arrayLink.length; i++) {
        var link = arrayLink[i];
        
        // 3. Miro si la etiqueta es un 'stylesheet' y tiene 'title'
        if (link.getAttribute('rel') && link.getAttribute('rel').includes('stylesheet') && link.getAttribute('title')) {
            
            // 4. Si tiene título, la activo o desactivo
            // Si el título es el que he elegido, la activo (disabled = false)
            // Si es otro, la desactivo (disabled = true)
            link.disabled = (link.getAttribute('title') !== titulo);
        }
    }

    setCookie('estilo-guardado', titulo, 45);
}


/*Función para ordenar los anuncios*/
function ordenarAnuncios() {
    
    // 1. Pillo el <section> que contiene todos los anuncios
    var contenedor = $("#lista-anuncios");
    
    // 2. Pillo todos los anuncios que están dentro
    // querySelectorAll devuelve una "NodeList"
    // 'Array.from()' lo convierte en un Array de verdad para poder usar .sort()
    var anuncios = Array.from(contenedor.querySelectorAll('article'));
    
    // 3. Miro qué ha elegido el usuario en el <select> de ordenar
    var valor = $("#selector-orden").value;
    
    // 4. Separo el valor en "criterio" y "orden"
    var partes = valor.split('-'); // ["precio", "asc"]
    var criterio = partes[0]; // "precio"
    var orden = partes[1]; // "asc"

    // 5. Ordeno el Array
    anuncios.sort(function(a, b) {
        // Pillo el valor de los 'data-attributes'
        var valA = a.dataset[criterio]; 
        var valB = b.dataset[criterio];

        // Preparo la comparación
        var comparacion = 0;
        
        if (criterio === 'precio') {
            // Si es 'precio', lo convierto a número para comparar
            comparacion = parseFloat(valA) - parseFloat(valB);
        } else {
            // Si es 'titulo' o 'fecha' (en YYYY-MM-DD),
            // los comparo como texto
            comparacion = valA.localeCompare(valB);
        }

        // Si el orden es 'desc', le doy la vuelta al resultado
        if (orden === 'desc') {
            comparacion = comparacion * -1; // invierto el número
        }
        
        return comparacion;
    });

    // 6. Vuelvo a meter los anuncios en el contenedor
    [cite_start]// El PDF dice que hay que hacerlo "nodo a nodo"
    // Al hacer 'appendChild' con un elemento que ya existe,
    // JS es listo y lo mueve al final.
    // Así que, si los muevo todos en orden, la lista se reordena
    for (var i = 0; i < anuncios.length; i++) {
        contenedor.appendChild(anuncios[i]);
    }
}

/*=================================NUEVAS FUNCIONES (COOKIES)=================================*/

// Función para crear la cookie (copiada del PDF)
function setCookie(c_name, value, expiredays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + expiredays);
    document.cookie = c_name + "=" + escape(value) +
        ((expiredays == null) ? "" : "; expires=" + exdate.toGMTString());
}

// Función para leer la cookie (copiada del PDF)
function getCookie(c_name) {
    if (document.cookie.length > 0) {
        var c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            var c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1)
                c_end = document.cookie.length;
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return "";
}