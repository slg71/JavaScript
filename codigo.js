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
});

/*=================================VALIDACIÓN FORMULARIOS=================================*/

/*==================funcion login====================*/
function validarLogin(event) {
    const noVacioRegex = /^\s*$/;
    const usuario = $("#usuario").value;
    const pwd = $("#pwd").value;

    let valido = true;
    let mensaje = "";

    resetCampos("#usuario", "#pwd"); 

    //usuario
    if (noVacioRegex.test(usuario)) {
        mensaje += "- El campo 'Usuario' no puede estar vacío.\n";
        setError("#usuario");
        valido = false;
    }

    //contraseña
    if (noVacioRegex.test(pwd)) {
        mensaje += "- El campo 'Contraseña' no puede estar vacío.\n";
        setError("#pwd");
        valido = false;
    }

    finalizarValidacion(event, valido, mensaje, "Inicio de sesión correcto. Redirigiendo a Inicio...");
}


/*==================funcion registro====================*/
function validarRegistro(event) {
    //pillo los valores
    const usuario = $("#usuario").value;
    const pwd = $("#pwd").value;
    const pwd2 = $("#pwd2").value;
    const email = $("#email").value;

    let valido = true;
    let mensaje = "";

    resetCampos("#usuario", "#pwd", "#pwd2", "#email");

    /*--- validación USUARIO ---*/
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

    /*--- validación CONTRASEÑA ---*/
    const pwdRegexCaracteres = /^[a-zA-Z0-9_-]{6,15}$/;
    const pwdRegexMayus = /[A-Z]/;
    const pwdRegexMinus = /[a-z]/;
    const pwdRegexNum = /\d/;
    let pwdValida = true; // Flag interna para la contraseña

    if (pwd === "") {
        mensaje += "- El campo 'Contraseña' no puede estar vacío.\n";
        pwdValida = false;
    } else {
        // Hacemos todas las comprobaciones a la vez para un mensaje de error más limpio
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

    //repetir contraseña
    if (pwd2 === "") {
        mensaje += "- Debes repetir la contraseña.\n";
        setError("#pwd2");
        valido = false;
    } else if (pwd !== pwd2) {
        mensaje += "- Las contraseñas no coinciden.\n";
        setError("#pwd2");
        valido = false;
    }

    /*--- validación EMAIL ---*/
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