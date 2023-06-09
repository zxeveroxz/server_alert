require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require('express');
const https = require('https');
const socketIO = require('socket.io');
const router = require("./router");
const app = express();

const CLIENTES_CONECTADOS = [];

app.set('view engine', '.ejs');
app.set('port', 1000);
app.use('/publico', express.static(__dirname + '/publico'));
app.use(router);

const server = https
    .createServer({
        key: fs.readFileSync(fs.existsSync(process.env.PRIVKEY_) ? process.env.PRIVKEY_ : "./ssl/key.pem", 'utf8'),
        ca: fs.readFileSync(fs.existsSync(process.env.CHAIN_) ? process.env.CHAIN_ : "./ssl/key.pem", 'utf8'),
        cert: fs.readFileSync(fs.existsSync(process.env.CERT_) ? process.env.CERT_ : "./ssl/cert.pem", 'utf8'),
    },
        app);
const io = socketIO(server, {
    origins: ["*"],
    maxHttpBufferSize: 1e8, // 100 MB  
    cors: {
        origin: '*',
    }
});

// Configurar opciones de producción
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction) {
    // Configurar el manejo de errores para evitar que se detenga el servidor
    process.on('uncaughtException', (err) => {
        console.error('Error no capturado:', err);
        // Agregar lógica de manejo del error, como enviar una notificación o registrar en un servicio de seguimiento de errores
    });

    process.on('unhandledRejection', (reason, p) => {
        console.error('Rechazo no capturado:', reason, p);
        // Agregar lógica de manejo del error, como enviar una notificación o registrar en un servicio de seguimiento de errores
    });

    // Capturar errores en el contexto de Socket.io
    io.on('error', (err) => {
        console.error('Error en Socket.io:', err);
        // Agregar lógica de manejo del error, como enviar una notificación o registrar en un servicio de seguimiento de errores
    });
}

// Lógica del servidor Socket.io
io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    const {clientId,sala} = socket.handshake.query;

    socket.join(sala);

    CLIENTES_CONECTADOS.push({"id": socket.id,"clientId":clientId,"sala":sala}); //{id: clientId,sala: sala};

    const bienvenida = `Bienvenido: ${clientId} a la sala: ${sala}`;
    io.to(sala).emit('bienvenida', bienvenida);


    
    socket.on('iniciar',() => {
        io.to(sala).emit('iniciar_ws', null );
    });


    socket.on('leer_qr',(datos) => {
        io.to(sala).emit('leer_qr', {"evento":"leer_qr","qr":datos} );
    });

    


    socket.on('estado',() => {//verificar si el estado del servidor was
        io.to(sala).emit('estado_ws', null );        
    });

    socket.on('estado_ws',(datos) => {//respuesta de verificar el estado del servidor was
        io.to(sala).emit('estado', {"evento":"estado","estado":datos} );        
    });



    socket.on('estado_was_server',() => {
        let resp = buscar_was_server(CLIENTES_CONECTADOS,sala)
        io.to(sala).emit('estado_was_server', resp );       
        console.log("estado_was_server"); 
    });



    // Evento personalizado para manejar la solicitud del cliente
    socket.on('mensaje'+sala, (datos) => {
        try {

            io.to(sala).emit('mensaje_ws'+sala,datos);

        } catch (err) {
            console.error('Error en el manejo de la solicitud del cliente:', err);
            // Agregar lógica de manejo del error, como enviar una notificación o registrar en un servicio de seguimiento de errores
        }
    });

    // Manejo de desconexión del cliente
    socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
        try {
           const clientId = Object.keys(CLIENTES_CONECTADOS).find(key => CLIENTES_CONECTADOS[key].id===socket.id);
           if(clientId){
            delete CLIENTES_CONECTADOS[clientId];
           }
        } catch (err) {
            console.error('Error en el manejo de la desconexión del cliente:', err);
        }
    });


    // Enviar la hora actual a todos los clientes cada 15 segundos
    setInterval(() => {
        const horaActual = new Date().toLocaleTimeString();
        socket.emit('hora_actual', { hora: horaActual });
        console.log("Enviado hora actual del Servidor: "+ horaActual);
        let clientes_independientes = CLIENTES_CONECTADOS.filter(item =>item.sala==sala);
        console.log(clientes_independientes);
        io.to(sala).emit('clientes_lista',clientes_independientes);
        
    }, 30000); // 15000 ms = 15 segundos


});

function buscar_was_server(CLIENTES_CONECTADOS,ruc){
    let clientes = CLIENTES_CONECTADOS.filter(item =>item.sala==ruc);
    let estado = clientes.filter(item => item.clientId=="WAS"+ruc);
    return estado;
}

// Iniciar el servidor
server.listen(app.get('port'), () => {
    console.log(`Servidor Socket.io iniciado en el puerto ` + app.get('port'));
});