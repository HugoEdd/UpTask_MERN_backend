// toda la funcionalidad que va a controlar routing con modelos
import Usuario from "../models/Usuario.js";
import generarId from '../helpers/generarId.js';
import generarJWT from '../helpers/generarJWT.js';
import {emailRegistro, emailOlvidePassword} from '../helpers/email.js';

const registrar = async(req, res) => {
    // req es lo que recibe la información que manda el usuario, el req lo interpreta
    // req.body es lo que hemos enviado desde postman en este caso

    // ! Evitar Registros duplicados
    const { email } = req.body;
    const existeUsuario = await Usuario.findOne({ email });

    if(existeUsuario){
        const error = new Error('Usuario ya registrado');
        return res.status(400).json({msg: error.message})
    }

    try {
        const usuario = new Usuario(req.body);
        usuario.token = generarId(); // tomamos una instacia del usuario, y despues guarda ese id
        // const usuarioAlmacenado = await usuario.save();
        await usuario.save();
        // res.json(usuarioAlmacenado); // Este mensaje se ejecuta hasta que el mensaje relice su acción
        
        // Enviar el email de confirmación
        //console.log(usuario); obtenemos los datos del usuario desde el front
        emailRegistro({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        });
       
        res.json({ msg: 'Usuario Creado Correctamente, Revisa tu Email para confirmar tu cuenta' });
    } catch (error) {
        console.log(error);
    }    
};

const autenticar = async (req, res) => {
    const { email, password } = req.body;
    // Comprobar si el usuario existe
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
        const error = new Error('El usuario no existe');
        return res.status(404).json({
            msg: error.message
        });
    }

    // Comprobar si el usuario esta confirmado
     if (!usuario.confirmado) {
        const error = new Error('Tu cuenta no ha sido confirmada');
        return res.status(403).json({
            msg: error.message
        });
    }

    // Comprobar su password
    // debemos de pasarle el password hacia el modelo para que se haga la comprobación
    if (await usuario.comprobarPassword(password)) {
        // esperamos a que la funcion del model retorne true o false
        res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario._id),
        })
    } else {
        const error = new Error('El Password es Incorrecto');
        return res.status(403).json({
            msg: error.message
        });
    }
};

const confirmar = async (req, res) => {
    // vamos a acceder a los datos con un request Param,
    // ya que esta en la cabecera, eso que le pusimos en el routing :token, seria el la variable que genera express dinamicamente
    const { token } = req.params; // leemos de la url
    const usuarioConfirmar = await Usuario.findOne({ token }); // buscamos a un usuario con ese token

    if (!usuarioConfirmar) { // si no existe el usuario confirmar
        const error = new Error('Token no válido');
        return res.status(403).json({
            msg: error.message
        });
    }

    try { // Si existe confirmamos al usuario, eliminamos el token, guardamos en bd, y mandamos la resp
        // el token es de un solo uso, osea se tiene que eliminar despues
        usuarioConfirmar.confirmado = true;
        usuarioConfirmar.token = "";
        await usuarioConfirmar.save(); // almacena en la bd ya con esos cambios

        res.json({
            msg: 'Usuario Confirmado correctamente'
        });

    } catch (error) {
        // si hay un error podemos debbugear
        console.log(error);
    }
};

const olvidePassword = async (req, res) => {
    const { email } = req.body; // extraemos email para ver si el usuario existe
    const usuario = await Usuario.findOne({ email });
    
    if (!usuario) {
        const error = new Error('El usuario no existe');
        return res.status(404).json({
            msg: error.message
        });
    }

    // SI el usuario existe
    try {
        usuario.token = generarId();
        await usuario.save();

        // Enviar email con las instrucciones
        emailOlvidePassword({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        })


        res.json({ msg: 'Hemos enviado un email con las intrucciones' });
    } catch (error) {
        console.log(error);
    }
};
// Validar token para recuperar Password
// esta funcion valida el token que se enviar para que el usuario puedea recuperar su password
const comprobarToken = async (req, res) => {
    const { token } = req.params; // extraer valores de la url, si quieres extraer de formulario es con reqBody

    const tokenValido = await Usuario.findOne({
        token
    });

    if (tokenValido) {
        res.json({
            msg: 'Token válido y el Usuario existe'
        });
    } else {
        const error = new Error('Token no válido');
        return res.status(404).json({
            msg: error.message
        });
    }
};

const nuevoPassword = async (req, res) => {
    // Leer el token, y el nuevo password
    const { token } = req.params;
    const { password } = req.body;

    // Comprobar que el toke sea válido
    const usuario = await Usuario.findOne({ token });

    if (usuario) {
        // Reescribir el usuario
        usuario.password = password;
        usuario.token = ''; // elimina el token una vez hasheado el nuevo password
       
        
        try {
            await usuario.save(); // Guarda el la db
            res.json({
                msg: 'Password Modificado Correctamente'
            });
        } catch {
            console.log(error);
        }
    } else {
        const error = new Error('Token no válido');
        return res.status(404).json({
            msg: error.message
        });
    }
};

const perfil = async(req, res) => {
    const { usuario } = req;
    
    // leer del servidor
    res.json(usuario);

}

export {
    registrar,
    autenticar,
    confirmar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    perfil,
};
//? bcrypt funciona para hashear(encriptar password) npm i bcrypt
//? utilizaremos jwt(json web token) debemos instalar npm i jsonwebtoken