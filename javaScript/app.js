class Usuario {
    constructor(nombre, contrasena, id) {
        this.nombre = nombre;
        this.id = id;
        this.contrasena = contrasena;
        this.cuenta = new CuentaBancaria(nombre);
    }

}

class CuentaBancaria{
    constructor(titular, saldoInicial = 0,dolaresIniciales = 0){
        this.titular = titular;
        this.saldo = saldoInicial;
        this.deudas = 0;
        this.dolares = dolaresIniciales;
        this.movimientos = [];
    }

    agregarMovimientos(tipo,monto){
        const fecha = new Date().toLocaleDateString();
        this.movimientos.push({tipo, monto, fecha});
    }

    depositar(monto){
        if(monto > 0){
            this.saldo += monto;
            this.agregarMovimientos("deposito", monto);
        }
    }
    extraer(monto){
        if(monto > 0 && monto <= this.saldo){
            this.saldo -=monto;
            this.agregarMovimientos("extraccion", monto);
        }
    }
    transferencia(monto, cuentaDestino){
        if(monto > 0){
            this.extraer(monto);
            cuentaDestino.depositar(monto);
            this.agregarMovimientos(`Transferencia a ${cuentaDestino.titular}`, monto);
        }
    }
    realizarPrestamo(monto, deudaTotal){
        if (monto > 0) {
            this.saldo += monto;
            this.deudas += deudaTotal; // suma el monto + recargo
            this.agregarMovimientos("Préstamo recibido", monto);
        }
    }
    realizarPagoDeuda(montoPago){
    if(this.deudas <= 0){
        mostrarMensaje("No tenés deudas pendientes.");
        return;
    }
    if (isNaN(montoPago) || montoPago <= 0){
        mostrarMensaje("Monto inválido.");
        return;
    }

    if(montoPago > this.deudas){
        mostrarMensaje(`No podés pagar más que tu deuda actual de $${this.deudas.toFixed(2)}`);
        return;
    }

    if (montoPago > this.saldo){
        mostrarMensaje(`Saldo insuficiente para pagar $${montoPago}. Tu saldo es de $${this.saldo.toFixed(2)}`);
        return;
    }

    this.saldo -= montoPago;
    this.deudas -= montoPago;
    this.agregarMovimientos("pago de deuda", montoPago);
    }
    comprarDolares(montoEnDolares, cotizacion) {
    const costoEnPesos = montoEnDolares * cotizacion;
    if (this.saldo >= costoEnPesos) { 
        this.saldo -= costoEnPesos;
        this.dolares += montoEnDolares;
        this.movimientos.push({
            tipo: `Compra de USD ${montoEnDolares.toFixed(2)} a $${cotizacion}`,
            monto: costoEnPesos,
            fecha: new Date().toLocaleDateString()
        });
    } else {
        throw new Error("saldo insuficiente para comprar los dolares.");
    }
}
    venderDolares(montoUSD, cotizacion) {
    if (montoUSD > this.dolares) {
        throw new Error("No tenés suficientes dólares.");
    }
    this.dolares -= montoUSD;
    const pesosObtenidos = montoUSD * cotizacion;
    this.saldo += pesosObtenidos;
    this.movimientos.push({
        tipo: `Venta de USD ${montoUSD.toFixed(2)} a $${cotizacion}`,
        monto: pesosObtenidos,
        fecha: new Date().toLocaleDateString()
    });
}

}
function cargarUsuarios() {
    const data = JSON.parse(localStorage.getItem("usuarios")) || [];
    return data.map(u => {
        const cuentaInfo = u.cuenta || {};
        const usuario = new Usuario(u.nombre, u.contrasena, u.id);
        const cuenta = new CuentaBancaria(
            usuario.nombre,
            cuentaInfo.saldo || 0,
            cuentaInfo.dolares || 0
        );
        cuenta.movimientos = cuentaInfo.movimientos || [];
        cuenta.deudas = cuentaInfo.deudas || 0;
        usuario.cuenta = cuenta;
        return usuario;
    });
}
function reconstruirUsuario(obj) {
    const usuario = new Usuario(obj.nombre, obj.contrasena, obj.id);
    const cuenta = new CuentaBancaria(
        obj.cuenta.titular,
        obj.cuenta.saldo || 0,
        obj.cuenta.dolares || 0 
    );
    cuenta.deudas = obj.cuenta.deudas || 0;
    cuenta.movimientos = obj.cuenta.movimientos || [];
    usuario.cuenta = cuenta;
    return usuario;
}