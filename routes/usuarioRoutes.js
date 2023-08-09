import express from 'express';
import {registrar, autenticar, confirmar, 
        olvidePassword, comprobarToken,
        nuevoPassword, perfil,
} from '../controllers/usuarioController.js';
import checkAuth from '../middleware/checkAuth.js';

const router = express.Router(); // en este router es donde definimos post, put, get, delete

// la misma url que esta en el index eso significa la diagonal
// separamos la funcionalidad, ahora se encuentra en los controladores
// Autenticación, Registro y Confirmación de usuarios

router.post('/', registrar); // Crea un nuevo usuario
router.post('/login', autenticar);
router.get('/confirmar/:token', confirmar) // esos dos puntos generan routing dinamico
router.post('/olvide-password', olvidePassword);
// Para rutas que sean iguales podemos hacer esto! En el caso de get ejecuta esa ruta y con post esa ruta
router.route('/olvide-password/:token')
    .get(comprobarToken)
    .post(nuevoPassword);

router.get('/perfil', checkAuth, perfil); // entra al endpoint, ejecuta el middleware, y depues ejecuta el perfil

export default router;