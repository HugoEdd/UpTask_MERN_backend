import mongoose from "mongoose";

const proyectosSchema = mongoose.Schema({
    nombre: {
        type: String,
        trim: true,
        required: true
    },
    descripcion: {
        type: String,
        trim: true,
        required: true
    },
    fechaEntrega: {
        type: Date,
        default: Date.now
    },
    cliente: {
        type: String,
        trim: true,
        required: true
    },
    creador: {
        type: mongoose.Schema.Types.ObjectId, // hace referencia a userId es como una PK
        ref: "Usuario",
    },
    tareas: [
        // mongo podria almacenar todo el obj de la tarea, y no tendría mal performance
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tarea",
        },
    ],
    colaboradores: [
        {
            type: mongoose.Schema.Types.ObjectId, // hace referencia a userId es como una PK
            ref: "Usuario",
        },
    ],

}, {
    timestamps: true, // esto nos crea las columnas de createAt, y updateAt con las fechas
});

const Proyecto = mongoose.model("Proyecto", proyectosSchema); // identifica el nombre ya la forma de datos que tendremos
export default Proyecto;