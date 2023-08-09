import jwt from 'jsonwebtoken';
import Usuario from "../models/Usuario.js";
const checkAuth = async(req, res, next) => { // next nos permite irnos hacia el siguiente middleware
    // Usualmente es en los headers es donde enviamos el jwt
    // Mediante Bearer token que es una convención para enviar el token
    // SI existe la autorizacion true y que si le estamos enviando un token en Bearer
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1]; // divide la cadena en 2, asigna la posición 1 quitale el bearer
            
            // Gracias a la libreria leemos el token lo mismo que usas para firmarlo lo usas para verificarlo
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            //req.usuario , crea un nueva variable dentro de req que se llamara usuario 
            req.usuario = await Usuario.findById(decoded.id)
            .select("-password -confirmado -token -cretatedAt -updatedAt -__v"); // elimina el password de la respuesta
            // Una vez que el usuario esta autenticado, se esta almacenando aqui en req.usuario
            // console.log(req.usuario);

            return next(); // una vez que se asigna el req, vamos al siguiente middleware

        } catch (error) {
            return res.status(404).json({
                msg: 'Hubo un error'
            });
        }
    }

    // En caso de que usuario no mande un token
    if(!token) {
        const error = new Error('Token no válido');
        return res.status(401).json({
            msg: error.message
        });
    }

    next();
}

export default checkAuth;



/* Middleware es una función que se ejecuta entre el inicio y el final del ciclo de vida de una solicitud HTTP.
Actúa como una capa intermedia entre el cliente que realiza la solicitud y el servidor que la procesa.
Su propósito principal es procesar, modificar o agregar información a la solicitud o respuesta HTTP antes de que sean manejadas 
por las rutas o controladores finales. 
Ejecutar código antes y después del controlador final: 
Puede realizar acciones previas o posteriores al procesamiento de la solicitud principal. 
Por ejemplo, autenticar usuarios, registrar información de registro, 
manejar errores o realizar operaciones de limpieza.
Un middleware en Node.js se define como una función que toma tres parámetros:
req (objeto de solicitud),res (objeto de respuesta) 
y next (función que debe llamarse para pasar al siguiente middleware).
 Aquí hay un ejemplo básico de un middleware:*/