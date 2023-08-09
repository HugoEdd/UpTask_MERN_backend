import express from "express";

import {
    agregarTarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstado,
} from "../controllers/tareaController.js";
import checkAuth from '../middleware/checkAuth.js';

const router = express.Router();

router.post("/", checkAuth, agregarTarea); // Para agregar tarea el usuario debe estar autenticado middleware
router.route("/:id")
    .get(checkAuth,obtenerTarea)
    .put(checkAuth,actualizarTarea)
    .delete(checkAuth,eliminarTarea);

router.post("/estado/:id", checkAuth, cambiarEstado); // Para cambiar el estado el usuario debe ser colaborador del proyecto


export default router;