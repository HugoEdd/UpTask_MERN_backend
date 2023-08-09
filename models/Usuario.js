// Usualmente el nombre de lo modelos se pone la primer letra en mayuscula por convención
// schema es la estructura de la bd
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const usuarioSchema = mongoose.Schema({
    nombre: {
        type: String,
        require: true,
        trim: true
    },
    password: {
        type: String,
        require: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    token: {
        type: String,
    },
    confirmado: {
        type: Boolean,
        default: false
    },  
},
    {
        timestamps: true
    }
);
// trim quita los espacios de inicio y fina Hugo Ed
// schema estructura que indica cual 
// es la forma en la que están estructurados los documentos que se almacenan en una colección de MongoD
// timestamps true - agrega dos columnas mas, una de creado y una de actualizado
// middelware y hooks de moongose pre es un middelware que se ejecuta antes de almacenar
// usamos function porque haremos referencia a this, y los => no lo tienen
usuarioSchema.pre('save', async function (next) {

    if (!this.isModified('password')) {  // Verifica que el password no haya sido cambiado -> !this.isModified('password')
        // si no esta modificado el password no hagas nada, por lo tanto ponermos next
        next(); // se va hacia el siguiente middelware
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt); // la primer es la cadena sin hash, segundo el salt para hacer el hash
});

// ? COMPROBAR EL PASSWORD PARA DAR ACCESO EN EL LOGIN
usuarioSchema.methods.comprobarPassword = async function (passwordFormulario) {
    // No revierte la cadena del password para ver si es igual, sino que comprobar un string que no tiene hash con uno que si(this.password) la instancia del usuario que estamos comprobando
    return await bcrypt.compare(passwordFormulario, this.password);
}

const Usuario = mongoose.model('Usuario', usuarioSchema);
export default Usuario;


