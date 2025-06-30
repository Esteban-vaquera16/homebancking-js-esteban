const usuarioGuardado = JSON.parse(sessionStorage.getItem("usuarioActual"));
const usuarioActual = usuarioGuardado ? reconstruirUsuario(usuarioGuardado) : null;

if (!usuarioActual) {
    mostrarModal("Acceso no autorizado.");
    window.location.href = "login.html";
}
const infoUsuario = document.getElementById("div-mostrar-info");
const contenedorBotones = document.getElementById("div-funcion-botones");

const formTransferencia = document.getElementById("form-transferencia");
const formGenerico = document.getElementById("form-generico");

const inputAlias = document.getElementById("alias");
const inputMontoTransferir = document.getElementById("monto-transferir");
const inputMontoGenerico = document.getElementById("monto-generico");

const botonCerrarSesion = document.getElementById("btn-cerrar-sesion");

botonCerrarSesion.addEventListener("click", ()=>{
    const modal = new bootstrap.Modal(document.getElementById("modalCerrarSesion"));
    modal.show();
})
document.getElementById("confirmarCerrarSesion").addEventListener("click", () => {
    sessionStorage.removeItem("usuarioActual");
    window.location.href = "index.html";
});
function mostrarInfoUsuario() {
    const usuarioActual = JSON.parse(sessionStorage.getItem("usuarioActual"));
    
    if (!usuarioActual) return;
    
    infoUsuario.innerHTML = `
    <h1>Hola ${usuarioActual.nombre}!</h1>
    <h2>Dinero disponible</h2>
        <h3>$${usuarioActual.cuenta.saldo.toFixed(2)}</h3>
        `;
    }
    const botones = [
        {
            id:'transferir',
        image: './herramientas/logo-transferencia.png',
        alt:'realizar transferencia',
        title: 'Transferencia',
    },
    {
        id:'extraer-dinero',
        image: './herramientas/extraccion-dinero.png',
        alt:'extraccion de dinero en efectivo',
        title: 'Extraer efectivo',
    },
    {
        id:'solicitar-prestamo',
        image: './herramientas/prestamo-logo.png',
        alt:'pedir prestamo un prestamo',
        title: 'Solicitar prestamo',
    },
    {
        id:'ver-deudas',
        image: './herramientas/ver-deuda.png',
        alt:'ver deudas a pagar',
        title: 'Ver deudas',
    },
    {
        id:'pagar-deudas',
        image: './herramientas/pagar-deuda.png',
        alt:'pagar deudas pendientes',
        title: 'Pagar deudas',
    },
    {
        id:'ver-movimientos',
        image: './herramientas/ver-movimientos.png',
        alt:'ver movimientos del usuario',
        title: 'Ver movimientos',
    }
]

function CreadoraDeBotonesFuncionales(){
    botones.forEach((e)=>{
        contenedorBotones.innerHTML += `
        <button id=${e.id}>
            <img src=${e.image} alt=${e.alt}>
            <h3>${e.title}</h3>
            </button>
            
            `
        })
    asignarEventosBotones()
}

function ocultarFormularios(){
    formTransferencia.classList.add("oculto");
    formGenerico.classList.add("oculto");
}

function mostrarFormularios(id){
    ocultarFormularios();
    document.getElementById(id).classList.remove("oculto")
}
function actualizarStorage(usuario){
    sessionStorage.setItem("usuarioActual", JSON.stringify(usuario));
    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const index = usuarios.findIndex(u => u.id === usuario.id)
    if(index !== -1){
        usuarios[index] = usuario;
        localStorage.setItem("usuarios", JSON.stringify(usuarios));
    }
    mostrarInfoUsuario();
}

function asignarEventodAFormularios(){
    //para el formulario de trasnferencia
    formTransferencia.addEventListener("submit", (e) =>{
        e.preventDefault();
        const alias = inputAlias.value.trim();
        const monto = Number(inputMontoTransferir.value);

        if(!alias || isNaN(monto) || monto <= 0){
            mostrarMensaje("datos invalidos.");
            return;
        }

        if(monto > usuarioActual.cuenta.saldo){
            mostrarMensaje("saldo insuficiente.")
            return;
        }

        usuarioActual.cuenta.saldo -= monto;
        usuarioActual.cuenta.movimientos.push({
            tipo: `transferencia a ${alias}`,
            monto,
            fecha: new Date().toLocaleDateString()
        });

        actualizarStorage(usuarioActual);
        mostrarModal(`transferencia a ${alias}. Realizada con exito`);
        formTransferencia.reset();
        ocultarFormularios();
    });
    //para el formulario generico
    formGenerico.addEventListener("submit", (e) =>{
        e.preventDefault();
        const monto = Number(inputMontoGenerico.value);

        if (isNaN(monto) || monto <= 0) {
            mostrarMensaje("Monto inválido");
            return;
        }

        if (formGenerico.dataset.funcion === "extraer") {
            if (monto > usuarioActual.cuenta.saldo) {
            mostrarMensaje("Saldo insuficiente");
            return;
            }
            mostrarModal(`Realiazaste una extraccion de ${monto}. En efectivo`);
            usuarioActual.cuenta.extraer(monto);
        }
        else if(formGenerico.dataset.funcion === "prestamo"){
            if(monto > 20000){
                mostrarMensaje("maximo prestamo permitido: $20000.")
                return;
            }
            const deudaTotal = monto + monto * 0.15;
            mostrarModal(`se te acreditaron $${monto}. por un prestamo`)
            usuarioActual.cuenta.realizarPrestamo(monto,deudaTotal)
        }else if(formGenerico.dataset.funcion === "pagarDeuda"){
            if(monto > usuarioActual.cuenta.deudas){
                mostrarMensaje("Estas ingresando un valor mayor a tu deuda")
                return;
            }
            if(usuarioActual.cuenta.deudas)
            if(isNaN(monto) || monto <= 0 ){
                mostrarMensaje("Monto invalido");
                return;
            }
            if(monto > usuarioActual.cuenta.saldo){
                mostrarMensaje("Saldo insuficiente.")
                return;
            }
            mostrarModal(`Deuda de $${monto} pagada con exito.`)
            usuarioActual.cuenta.realizarPagoDeuda(monto);
            
        }

        actualizarStorage(usuarioActual);
        formGenerico.reset();
        ocultarFormularios();
});
}

function asignarEventosBotones(){
    document.getElementById("transferir").addEventListener("click", ()=>{
        mostrarFormularios("form-transferencia");
    });
    document.getElementById("extraer-dinero").addEventListener("click", ()=>{
        formGenerico.dataset.funcion = "extraer";
        mostrarFormularios("form-generico");
    });
    document.getElementById("solicitar-prestamo").addEventListener("click", ()=>{
        formGenerico.dataset.funcion = "prestamo";
        mostrarFormularios("form-generico");
    });
    document.getElementById("pagar-deudas").addEventListener("click", ()=>{
        formGenerico.dataset.funcion = "pagarDeuda";
        mostrarFormularios("form-generico");
    });
    document.getElementById("ver-deudas").addEventListener("click", () => {
        const divMovimientos = document.getElementById("tus-movimientos");
        divMovimientos.innerHTML = `<p>Tu deuda actual es de $${usuarioActual.cuenta.deudas.toFixed(2)}</p>`;
    });

    document.getElementById("ver-movimientos").addEventListener("click", () => {
        const divMovimientos = document.getElementById("tus-movimientos");
        const lista = usuarioActual.cuenta.movimientos;

        if (lista.length === 0) {
            divMovimientos.innerHTML = "<p>No hay movimientos.</p>";
        } else {
            divMovimientos.innerHTML = lista.map(m => `
                <p>${m.fecha} : ${m.tipo} - $${m.monto}</p>
            `).join("");
        }
    });

        document.getElementById("btn-limpiar-movimientos").addEventListener("click", () => {
        const divMovimientos = document.getElementById("tus-movimientos");
        divMovimientos.innerHTML = "";
    });
}

function main(){
    mostrarInfoUsuario();
    CreadoraDeBotonesFuncionales();
    asignarEventodAFormularios();
}
document.addEventListener("DOMContentLoaded", () => {
    main();
});
