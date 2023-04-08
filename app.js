require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require('express');
const https = require('https');
const socketIO = require('socket.io');
const router = require("./router");
const app = express();

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


    socket.on('was_qr',(datos) => {
        io.emit('leer_qr', "was_qr desde el servidor a solicitud el cliente" + datos );
        console.log("enviado desde el cliente "+datos);
    });

    // Evento personalizado para manejar la solicitud del cliente
    socket.on('mensaje', (datos) => {
        try {
            // Lógica de manejo de la solicitud del cliente
            // ... (tu código aquí)
        } catch (err) {
            console.error('Error en el manejo de la solicitud del cliente:', err);
            // Agregar lógica de manejo del error, como enviar una notificación o registrar en un servicio de seguimiento de errores
        }
    });

    // Manejo de desconexión del cliente
    socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
        try {
            // Lógica de manejo de desconexión del cliente
            // ... (tu código aquí)
        } catch (err) {
            console.error('Error en el manejo de la desconexión del cliente:', err);
            // Agregar lógica de manejo del error, como enviar una notificación o registrar en un servicio de seguimiento de errores
        }
    });


    // Enviar la hora actual a todos los clientes cada 15 segundos
    setInterval(() => {
        const horaActual = new Date().toLocaleTimeString();
        socket.emit('hora_actual', { hora: horaActual });
        console.log("Enviado hora actual del Servidor: "+ horaActual);

        
    }, 30000); // 15000 ms = 15 segundos


});

// Iniciar el servidor
server.listen(app.get('port'), () => {
    console.log(`Servidor Socket.io iniciado en el puerto ` + app.get('port'));
});