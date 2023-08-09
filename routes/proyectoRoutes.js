import express from 'express';
import {
    obtenerProyectos,
    nuevoProyecto,
    obtenerProyecto,
    editarProyecto,
    eliminarProyecto,
    buscarColaborador,
    agregarColaborador,
    eliminarColaborador
} from '../controllers/proyectoController.js';
import checkAuth from "../middleware/checkAuth.js";// todo lo que sea relacionado a proyectos el usuario debe de estar autenticado

const router = express.Router();

// router.get('/', checkAuth, obtenerProyectos);
// router.post('/', checkAuth, nuevoProyecto);

router.route("/")
    .get(checkAuth, obtenerProyectos)
    .post(checkAuth, nuevoProyecto);

router.route("/:id")
    .get(checkAuth, obtenerProyecto)
    .put(checkAuth, editarProyecto)
    .delete(checkAuth, eliminarProyecto);

router.post("/colaboradores", checkAuth, buscarColaborador);
router.post("/colaboradores/:id", checkAuth, agregarColaborador);
router.post("/eliminar-colaborador/:id", checkAuth, eliminarColaborador);
// aunque vayamos a eliminar a un colaborador sigue siendo un post, delete elemina un recurso completo


export default router;