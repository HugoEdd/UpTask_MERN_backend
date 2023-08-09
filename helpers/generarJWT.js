import jwt from 'jsonwebtoken';


const generarJWT = (id) => {
    // genera una obj con ese id
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d"
    });
    //sign es un metodo que nos permite generar un jwt, palabra secreta sirve para firmar y comprobrar el jwt
};


export default generarJWT;