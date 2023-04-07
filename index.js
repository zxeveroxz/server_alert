const https = require("https");
const fs = require("fs");
const path = require("path");
const express = require("express");
const router = require("./router")
const app = express();

//const leerArchivo = require("./audio_google");

app.set('view engine', '.ejs');
app.set('port', 1000);
app.use('/publico', express.static(__dirname + '/publico'));
app.use(router);
const server = https
    .createServer({
        key: fs.readFileSync("./ssl/key.pem", 'utf8'),
        ca: fs.readFileSync("./ssl/csr.pem", 'utf8'),
        cert: fs.readFileSync("./ssl/cert.pem", 'utf8'),
    },
        app)
    .listen(app.get('port'), () => {
        console.log('server is runing at port ', app.get('port'))
    });  

const SocketIO = require("socket.io");
const io = SocketIO(server, {
    origins: ["*"],
    maxHttpBufferSize: 1e8, // 100 MB  
    cors: {
        origin: '*',
    }
});
/**


var clientes = [];

io.on("connection", (client) => {
    client.emit('conexion_ok', "Conexion Realizada");
    //console.log("new connectionnnnnn", client.id);
    clientes.push(client.id);
    client.on('disconnect', function () {
        clientes.splice(clientes.indexOf(client.id), 1);
        console.log(clientes);
    });

    console.log(clientes);
    client.emit('msg', "hola mano: ");
    client.emit('actualizar2', null);
    client.on("avisos", (avisos) => {
        console.log(avisos);
    });
    client.on("Wathsapp", (msg) => {
        console.log("Esto es de whast: " + msg);
    });
 
    client.on("Wathsapp2", (msg) => {
        console.log("Esto es de whast2: " + msg);
        io.sockets.emit('Wathsapp2', msg);
    });

    client.on("chat", (texto) => {
               console.log(texto.split('|||')[1]);

        leerArchivo(texto.split('|||')[1])
        .then(ruta=>{
            //console.log(ruta);
            ruta = ruta.replace(/\\/g, "\\\\");                      
           // io.sockets.emit('chat_audio',texto.split('|||')[0]+"|||"+ruta);
            fs.readFile(ruta,'',(err,data)=>{
                if (err)
                    console.log(err);
                else
                    io.sockets.emit("sonido",data);
            });            
        })
        .catch(err =>{
            console.log(err);
        });        
    });
});
*/

/**

var chokidar = require('chokidar');
var watcher = chokidar.watch(path.join(__dirname, 'correos'), { ignored: /^\./, persistent: true });

watcher
    .on('add', async function (path) {
        let correo = await fs.readFileSync(path, 'utf8');
        io.sockets.emit('correo_nuevo', correo);
        console.log('File', path, 'has been added');
        await borrar(path);
    })
    .on('change', function (path) { console.log('File', path, 'has been changed'); })
    .on('unlink', function (path) { console.log('File', path, 'has been removed'); })
    .on('error', function (error) { console.error('Error happened', error); })

let borrar = (async (path) =>{
    fs.unlink(path, (err => {
        if (err) console.log(err);
        else {
            console.log("\nDeleted Symbolic Link: "+path);
        }
    }));
});

*/

/**


setInterval(() => {
    console.log("algo ", new Date())
    // io.sockets.emit("alerta", "Alerta de Avisos SGIO");
    leer();
    //leer2();
    

}, 30000); 


var cron = require('node-cron');

process.env.TZ = 'America/Peru/Lima'; // GMT -05:00

cron.schedule('0 * /1 * * *', () => {
  console.log('running a task every CADA 30 MIN ', new Date().toISOString());

 // let horas = new Date().toISOString();

  leerArchivo("Aviso SGIO: ")
  .then(ruta2=>{      
      ruta2 = ruta2.replace(/\\/g, "\\\\");                      
     // io.sockets.emit('chat_audio',texto.split('|||')[0]+"|||"+ruta);
      fs.readFile(ruta2,'',(err,data2)=>{
          if (err)
              console.log(err);
          else{
              io.sockets.emit("sonido",data2);
              //io.sockets.emit("alerta_agua",data2);
          }
      });            
  })
  .catch(err =>{
      console.log(err);
  });    

});



cron.schedule('2 * * * *', () => {
    console.log('running a task every CADA /222 MIN ', new Date().toISOString());
  
   // let horas = new Date().toISOString();
  
   io.sockets.emit("alerta_agua2","nada");  

   setTimeout(() => {
    io.sockets.emit("alerta_desague2","nada");
   }, 50*1000);
   
  
  });

  */