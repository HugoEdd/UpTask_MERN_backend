import mongoose from "mongoose";

const tareaSchema = mongoose.Schema({
    nombre: {
        type: String,
        trim: true,
        required: true,
    },
    descripcion: {
        type: String,
        trim: true,
        required: true,
    },
    estado: {
        type: Boolean,
        default: false,
    },
    fechaEntrega: {
        type: Date,
        required: true,
        default: Date.now()
    },
    prioridad: {
        type: String,
        required: true,
        enum: ["Baja", "Media", "Alta"] // el enum va a permitir unicamente los valores que este en este arreglo
    },
    proyecto: {
        type: mongoose.Schema.Types.ObjectId, // cada tarea tiene una relacion con un proyecto
        ref: "Proyecto",
    },
    completado: {
        type: mongoose.Schema.Types.ObjectId, // nos permitira saber quien completo esa tarea
        ref: "Usuario",
        default: null,
    }
}, {
    timestamps: true
});


const Tarea = mongoose.model('Tarea', tareaSchema);
export default Tarea;