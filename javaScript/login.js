const nombreInput = document.getElementById("nombre-input");
const contrasenaInput = document.getElementById("contrasena-input");
const btnCrearCuenta = document.getElementById("btn-crear-cuenta");
const btnIniciarSesion = document.getElementById("btn-iniciar-sesion");
const formSaldoInicial = document.getElementById("form-saldo-inicial");
const inputSaldoInicial = document.getElementById("input-saldo-inicial");
const btnConfirmarSaldo = document.getElementById("btn-confirmar-saldo");
let usuarioRecienCreado = null;

function creadoraDeID() {
    return Math.floor(Math.random() * 1000000); 
}
function mostrarMensaje(texto) {
    const mensajeError = document.getElementById("mensaje-error");
    const mensajeErorTransferencia = document.getElementById("mensaje-error-transferencia");
    mensajeError.textContent = texto;
    mensajeError.style.display = "block";

    mensajeErorTransferencia.textContent = texto;
    mensajeErorTransferencia.style.display = "block";

    setTimeout(() => {
        mensajeError.textContent = "";
        mensajeError.style.display = "none";
        mensajeErorTransferencia.textContent = "";
        mensajeErorTransferencia.style.display = "none";
    }, 5000); // desaparece a los 5 segundos
}
btnCrearCuenta.addEventListener("click", () => {
    const nombre = nombreInput.value.trim();
    const contrasena = contrasenaInput.value;

    if (!nombre || contrasena.length < 6) {
        mostrarMensaje("Datos inválidos. La contraseña debe tener al menos 6 caracteres.");
        return;
    }

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    if (usuarios.some(u => u.nombre === nombre)) {
        mostrarMensaje("Ya existe un usuario con ese nombre.");
        return;
    }

    const id = creadoraDeID();
    const nuevoUsuario = new Usuario(nombre, contrasena, id);
    usuarioRecienCreado = nuevoUsuario;

    Swal.fire({
        title: "Cuenta creada con exito.",
        icon: "success",
        draggable: true
    });

    formSaldoInicial.classList.remove("oculto");
    document.querySelector(".formulario").classList.add("oculto"); 
});
btnConfirmarSaldo.addEventListener("click", () => {
    const saldoInicial = Number(inputSaldoInicial.value);

    if (isNaN(saldoInicial) || saldoInicial < 0) {
        Swal.fire({
        title: "Monto invalido. Se asignara $0 por defecto",
        draggable: true
    });
    } else {
        usuarioRecienCreado.cuenta.depositar(saldoInicial);
    }

    let usuarios = cargarUsuarios();
    usuarios.push(usuarioRecienCreado);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    sessionStorage.setItem("usuarioActual", JSON.stringify(usuarioRecienCreado));

    document.querySelector(".main-login").classList.add("oculto");
    document.getElementById("form-saldo-inicial").classList.add("oculto");
    document.getElementById("main-home").classList.remove("oculto");
    main();
});
btnIniciarSesion.addEventListener("click", () => {
    const nombre = nombreInput.value.trim();
    const contrasena = contrasenaInput.value;

    if (!nombre || !contrasena) {
        mostrarMensaje("Por favor, completá ambos campos.");
        return;
    }

    const usuarios = cargarUsuarios();

    const usuarioEncontrado = usuarios.find(
        u => u.nombre === nombre && u.contrasena === contrasena
    );

    if (usuarioEncontrado) {
        Swal.fire({
        title: `Bienvenido a banco Monteros ${nombre}!!`,
        draggable: true
    });
        sessionStorage.setItem("usuarioActual", JSON.stringify(usuarioEncontrado));
        document.querySelector(".main-login").classList.add("oculto");
        document.getElementById("form-saldo-inicial").classList.add("oculto");
        document.getElementById("main-home").classList.remove("oculto");
        main();
    } else {
        mostrarMensaje("Usuario o contraseña incorrectos.");
    }
});
nombreInput.addEventListener("input", () => {
    document.getElementById("mensaje-error").textContent = "";
});

contrasenaInput.addEventListener("input", () => {
    document.getElementById("mensaje-error").textContent = "";
});