import mongoose from 'mongoose';


const conectarDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true    
        });

        const url = `${connection.connection.host}:${connection.connection.port}`;
        console.log(`MongoDB Conectado en: ${url} `);
    } catch (error) {
        console.log(`error: ${error.message}`);
        process.exit(1);
        // Usualmente node termina los procesos con 0 al colocarle un 1
        // process.exit es para forzar que el proceso termine, no importa que haya otros ejecutandose
        // entonces termina los procesos en caso de que no se pueda conectar
        // El argumento 1 pasado a process.exit() indica que el programa ha finalizado con un estado de error.
    }
}


export default conectarDB;