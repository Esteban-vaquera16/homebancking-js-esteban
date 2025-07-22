const usuarioGuardado = JSON.parse(sessionStorage.getItem("usuarioActual"));
window.usuarioActual = usuarioGuardado ? reconstruirUsuario(usuarioGuardado) : null;

if (!window.usuarioActual) {
    document.getElementById("main-home").classList.add("oculto");
    document.querySelector(".main-login").classList.remove("oculto");
}
const infoUsuario = document.getElementById("div-mostrar-info");
const contenedorBotones = document.getElementById("div-funcion-botones");

const formTransferencia = document.getElementById("form-transferencia");
const formGenerico = document.getElementById("form-generico");

const inputAlias = document.getElementById("alias");
const inputMontoTransferir = document.getElementById("monto-transferir");
const inputMontoGenerico = document.getElementById("monto-generico");

const botonCerrarSesion = document.getElementById("btn-cerrar-sesion");

botonCerrarSesion.addEventListener("click", () => {
    Swal.fire({
        title: '¿Cerrar sesión?',
        text: "Vas a cerrar tu sesión actual.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cerrar sesión',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            sessionStorage.removeItem("usuarioActual");
            window.location.href = "index.html"; 
        }
    });
});
function mostrarInfoUsuario() {
    if (!usuarioActual) return;

    
    infoUsuario.innerHTML = `
    <h1>Hola ${usuarioActual.nombre}!</h1>
    <div class="div-dinero-usuario">
    <h2>Dinero disponible: </h2>
    <h3>$${usuarioActual.cuenta.saldo.toFixed(2)}</h3>
    <h2>Dolares disponible: </h2>
    <h3>USD ${usuarioActual.cuenta.dolares.toFixed(2)}</h3>
    </div>
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
    },
    {
        id:'comprar-dolares',
        image: './herramientas/ver-movimientos.png',
        alt:'comprar dolares',
        title: 'Comprar dolares',
    },
    {
        id:'vender-dolares',
        image: './herramientas/ver-movimientos.png',
        alt:'vender dolares',
        title: 'Vender dolares',
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
function actualizarStorage(usuario) {
    sessionStorage.setItem("usuarioActual", JSON.stringify(usuario));

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const index = usuarios.findIndex(u => u.id === usuario.id);
    if (index !== -1) {
        usuarios[index] = usuario;
        localStorage.setItem("usuarios", JSON.stringify(usuarios));
    }

    mostrarInfoUsuario();
}


async function asignarEventosAFormularios() {
    // Transferencia
    formTransferencia.addEventListener("submit", (e) => {
        e.preventDefault();
        const alias = inputAlias.value.trim();
        const monto = Number(inputMontoTransferir.value);

        if (!alias || isNaN(monto) || monto <= 0) {
            Swal.fire({
            icon: "error",
            title: "Datos invalidos",
            });
            return;
        }

        if (monto > usuarioActual.cuenta.saldo) {
            Swal.fire({
            icon: "error",
            title: "Saldo insuficiente.",
            });
            return;
        }

        usuarioActual.cuenta.saldo -= monto;
        usuarioActual.cuenta.movimientos.push({
            tipo: `Transferencia a ${alias}`,
            monto,
            fecha: new Date().toLocaleDateString()
        });

        actualizarStorage(usuarioActual);
        Swal.fire({
            icon: "success",
            title:`Transferencia a ${alias} realizada con exito.`,
            });
        formTransferencia.reset();
        ocultarFormularios();
    });

    // Formulario genérico
    formGenerico.addEventListener("submit", async (e) => {
        e.preventDefault();
        const monto = Number(inputMontoGenerico.value);

        if (isNaN(monto) || monto <= 0) {
            Swal.fire({
            icon: "error",
            title: "Monto invalido.",
            });
            return;
        }

        try {
            switch (formGenerico.dataset.funcion) {
                case "extraer":
                    if (monto > usuarioActual.cuenta.saldo) {
                        Swal.fire({
                        icon: "error",
                        title: "Saldo insuficiente.",
                        });
                        return;
                    }
                    usuarioActual.cuenta.extraer(monto);
                    Swal.fire({
                    icon: "success",
                    title: `Realizaste una extraccion de ${monto} en efectivo.` ,
                    });
                    break;

                case "prestamo":
                    if (monto > 20000) {
                        Swal.fire({
                        icon: "error",
                        title: `Maximo prestamo de $20000.` ,
                        });
                        return;
                    }
                    const deudaTotal = monto + monto * 0.15;
                    usuarioActual.cuenta.realizarPrestamo(monto, deudaTotal);
                    Swal.fire({
                    icon: "success",
                    title: `se te acreditaron ${monto} de un prestamo.` ,
                    });
                    break;

                case "pagarDeuda":
                    if (monto > usuarioActual.cuenta.deudas) {
                        Swal.fire({
                        icon: "warning",
                        title: `Ingresase un monto mayor a tu deuda.` ,
                        });
                        return;
                    }
                    if (monto > usuarioActual.cuenta.saldo) {
                        Swal.fire({
                        icon: "error",
                        title: "Saldo insuficiente.",
                        });
                        return;
                    }
                    usuarioActual.cuenta.realizarPagoDeuda(monto);
                    Swal.fire({
                        icon: "success",
                        title: `Deuda de ${monto} pagada con exito`,
                        });
                    break;

               case "comprarDolares":
                   try {
                        const res = await fetch("https://api.bluelytics.com.ar/v2/latest");
                        const data = await res.json();
                        const cotizacionCompra = data.blue.value_buy;

                        usuarioActual.cuenta.comprarDolares(monto, cotizacionCompra);
                        if (monto > usuarioActual.cuenta.saldo) {
                            Swal.fire({
                            icon: "error",
                            title: "Saldo insuficiente para comprar los dólares.",
                        });
                        return;
                        }

                        Swal.fire({
                        icon: "success",
                        title: `Compraste USD ${(monto).toFixed(2)} a $${cotizacionCompra}`,
                        });
                         actualizarStorage(usuarioActual);

                    } catch (error) {
                        Swal.fire({
                        icon: "error",
                        title: error.message,
                        });
                    }
                    break;

                case "venderDolares":
                    const resVenta = await fetch("https://api.bluelytics.com.ar/v2/latest");
                    const dataVenta = await resVenta.json();
                    const cotizacionVenta = dataVenta.blue.value_sell;

                    if (monto > usuarioActual.cuenta.dolares) {
                       Swal.fire({
                        icon: "error",
                        title: "No tienes esa cantidad de dolares.",
                        });
                        return;
                    }

                    usuarioActual.cuenta.venderDolares(monto, cotizacionVenta);
                    Swal.fire({
                        icon: "success",
                        title: `Vendiste USD ${monto.toFixed(2)} a $${cotizacionVenta}`,
                        });
                    
                    break;
            }

            actualizarStorage(usuarioActual);
            formGenerico.reset();
            ocultarFormularios();

        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: "error",
                title: "ocurrio un error al realizar la operacion.",
            });
        }
    });
    actualizarStorage(usuarioActual);
    formGenerico.reset();
    ocultarFormularios();
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

    document.getElementById("comprar-dolares").addEventListener("click", async () => {
    formGenerico.dataset.funcion = "comprarDolares";
    mostrarFormularios("form-generico");
    await mostrarCotizacion("compra");
    });

    document.getElementById("vender-dolares").addEventListener("click", async () => {
        formGenerico.dataset.funcion = "venderDolares";
        mostrarFormularios("form-generico");
        await mostrarCotizacion("venta")
    });

}
async function mostrarCotizacion(tipo) {
    const divCotizacion = document.getElementById("cotizacion-dolar");
    const textoCotizacion = document.getElementById("texto-cotizacion");

    try{
        const res = await fetch("https://api.bluelytics.com.ar/v2/latest");
        const data = await res.json();
        const precio = tipo === "compra" ? data.blue.value_buy : data.blue.value_sell;

        textoCotizacion.textContent = tipo === "compra"
            ? `precio de compra: $${precio}`
            : `precio de venta: $${precio}`;

        divCotizacion.classList.remove("oculto");

   }catch(error){
        textoCotizacion.textContent = "no se pudo obtener el precio de dolar."
        divCotizacion.classList.remove("oculto");
   }
}
function main() {
    const usuarioGuardado = JSON.parse(sessionStorage.getItem("usuarioActual"));
    if (!usuarioGuardado) {
        Swal.fire({
        icon: "error",
        title: "Acceso no autorizado.",
        });
        document.getElementById("main-home").classList.add("oculto");
        document.querySelector(".main-login").classList.remove("oculto");
        return;
    }

    window.usuarioActual = reconstruirUsuario(usuarioGuardado);

    mostrarInfoUsuario();
    CreadoraDeBotonesFuncionales();
    asignarEventosAFormularios();
}

