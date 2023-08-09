// ! Esta sintaxis no le gusta al profe, debido que ahora ya hay soporte completo para imports y exports
/*const express = require("express");
const app = express();
console.log("desde index.js");
app.listen(4000, () => {
    console.log('Servidor corriendo en el puerto 4000');
});*/

// Importante debemos de mandar a llamar este archivo en el package.json
// Habilitamos sixtasis de modulos "type": "module", la de arriba es de common.js
// importar dependencias no requiere el js al final
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // Este paquete es el que nos permite las conecciones desde el front end npm i cors
import conectarDB from "./config/db.js";
import usuarioRoutes from './routes/usuarioRoutes.js';
import proyectoRoutes from './routes/proyectoRoutes.js';
import tareaRoutes from './routes/tareaRoutes.js';

const app = express();
app.use(express.json()); // habilitamos para que pueda procesa la inforción tipo json

dotenv.config();

conectarDB();

// Configurar CORS
// blacklist y whitelist - quienes estan y no permitidos para realizar acciones
const whitelist = [process.env.FRONTEND_URL];

const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.includes(origin)) {
            // Puede consultar la API
            callback(null, true);
            // null - no hay mensaje de error, pero si le damos el acceso true
        } else {
            // No esta permitido
            callback(new Error("Error de Cors"));
        }
    },
};

app.use(cors(corsOptions));
// origin - quien esta enviando el request que front end

// Routing
// app.use practicamente responde a todos los verbos http
// todas las peticiones se van a ir agrupando en este endponint
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/proyectos", proyectoRoutes);
app.use("/api/tareas", tareaRoutes);

const PORT = process.env.PORT || 4000;

const servidor = app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

// Socke.io
import { Server } from "socket.io";
const io = new Server(servidor, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL,
    },
});
/*
En Socket.io, pingTimeout es una opción de configuración que define el tiempo máximo 
(en milisegundos) que el servidor espera para recibir un ping (un mensaje de confirmación de conexión)
 del cliente antes de considerarlo desconectado

 pingTimeout es una opción importante para asegurarse de que las conexiones entre el servidor y los clientes estén bien mantenidas 
 y no se mantengan abiertas indefinidamente si hay problemas de conectividad. Al establecer un tiempo de espera adecuado,
  se pueden gestionar mejor las desconexiones y reconexiones de los clientes.
 */

io.on("connection", (socket) => {
    console.log('Conectado a socket.io');
    
    // Definir los eventos de socket io estos los envia el cliente
    // ? Fundamentos de socket.io desde el servidor
    // socket.on('prueba', (proyectos) => {
    //     console.log('Prueba desde Socket io', proyectos);
    //     enviar respuesta de regreso
    //     socket.emit('respuesta', {nombre: "Juan"});
    // })

    // Definir los eventos de socket io estos los envia el cliente
    // vamos a utilizar join que es algo que solo sirve en el server, agrega el socket a un room de la lista de grupos
    socket.on("abrir proyecto", (proyecto) => {
        socket.join(proyecto); // cada usuario entre a un cuarto diferente
        // socket.to("64b59a02e6b280b78c62105c").emit('respuesta', { nombre: "Hugo" }); //auque cada usuario entra a un cuarto diferente, el emit manda mensaje a ambos,
        //  el to especifica el room,solo tendra comunicacion con ese usuario dentro de ese room
    });

     socket.on("nueva tarea", (tarea) => {
    const proyecto = tarea.proyecto;
    socket.to(proyecto).emit("tarea agregada", tarea);
  });

    socket.on("eliminar tarea", tarea => {
      const proyectoValue = tarea.proyecto;
            if (typeof proyectoValue === 'string') {
            socket.to(proyectoValue).emit("tarea eliminada", tarea)
            } else if (typeof proyecto === 'object') {
            socket.to(proyectoValue._id).emit("tarea eliminada", tarea)
            }

    });

    socket.on("actualizar tarea", tarea => {
        // recuerda que cuando actualiamos queremos que se cambie todo el arbol del state
        const proyecto = tarea.proyecto._id; // identificamos el proyecto, y despues lo enviamos a socket
        socket.to(proyecto).emit('tarea actualizada', tarea);
    });

    socket.on("cambiar estado", (tarea) => {
        const proyecto = tarea.proyecto._id;

        socket.to(proyecto).emit("nuevo estado", tarea)
    })
});