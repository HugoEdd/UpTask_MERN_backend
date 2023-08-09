import Proyecto from "../models/Proyecto.js";
import Tarea from "../models/Tarea.js";
import mongoose from "mongoose"; 

const agregarTarea = async (req, res) => {
    const { proyecto } = req.body;

    // Validar que el proyecto si exista
    const existeProyecto = await Proyecto.findById(proyecto);
    
    if (!existeProyecto) {
        const error = new Error('El proyecto no existe');
        return res.status(404).json({
            msg: error.message
        });
    }

    // Validar que la persona que esta dando de alta sea la creadora del proyecto
    if (existeProyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('No tienes los permisos adecuados para añadir tareas');
        return res.status(403).json({
            msg: error.message
        });
    }

    try {
        const tareaAlmacenada = await Tarea.create(req.body);
        // Almacenar el id en el proyecto
        // el push ira agregando la tareas al arreglo en la posición final
        existeProyecto.tareas.push(tareaAlmacenada._id);
        await existeProyecto.save();
        res.json(tareaAlmacenada);
    } catch (error) {
        console.log(error);
    }
}

const obtenerTarea = async (req, res) => {
    const { id } = req.params;
    // Identificar la tarea
    let tarea;
    
    // SI no existe la tarea
    if ((mongoose.Types.ObjectId.isValid(id))){
        tarea = await Tarea.findById(id).populate("proyecto");
    } else {
        const error = new Error('Tarea no encontrada');
        return res.status(404).json({
            msg: error.message
        });
    }

    // Comprobar quien es el creador del proyecto
    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción no válida');
        return res.status(403).json({
            msg: error.message
        });
    }

    res.json(tarea);

    /* Si en este caso el Populate es para cruzar las 2 colecciones por medio de su ref
        Es como un JOIN ( es decir unir 2 tablas ) pero básicamente, va a cruzar la información de las 2 columnas, 
        y MongoDB es una base de datos no relacional, pero también puedes relacionar los datos de esta forma */
}

const actualizarTarea = async (req, res) => {
    const { id } = req.params;
    // Identificar la tarea
    let tarea;
    
    // SI no existe la tarea
    if ((mongoose.Types.ObjectId.isValid(id))){
        tarea = await Tarea.findById(id).populate("proyecto");
    } else {
        const error = new Error('Tarea no encontrada');
        return res.status(404).json({
            msg: error.message
        });
    }

    // Comprobar quien es el creador del proyecto
    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción no válida');
        return res.status(403).json({
            msg: error.message
        });
    }

    tarea.nombre = req.body.nombre || tarea.nombre; // en caso de que haya nombre asigna el que ya esta en db
    tarea.descripcion = req.body.descripcion || tarea.descripcion;
    tarea.prioridad = req.body.prioridad || tarea.prioridad;
    tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega;

    try {
        const tareaAlmacenada = await tarea.save();
        res.json(tareaAlmacenada);
    } catch (error) {
        console.log(error);
    }
}

const eliminarTarea = async (req, res) => {
    const { id } = req.params;
    // Identificar la tarea
    let tarea;
    
    // SI no existe la tarea
    if ((mongoose.Types.ObjectId.isValid(id))){
        tarea = await Tarea.findById(id).populate("proyecto");
    } else {
        const error = new Error('Tarea no encontrada');
        return res.status(404).json({
            msg: error.message
        });
    }

    // Comprobar quien es el creador del proyecto
    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción no válida');
        return res.status(403).json({
            msg: error.message
        });
    }

    try {
        // eliminar la tarea tambien en el proyecto
        const proyecto = await Proyecto.findById(tarea.proyecto);
        proyecto.tareas.pull(tarea._id);
        // La función pull() se utiliza aquí para eliminar un elemento del arreglo de tareas, y el elemento que se eliminará es aquel cuyo identificador coincide con tarea._id.
        // el pull saca las tares un momento de memoria

        // cuando hay dos await bloquea la siguiente, linea usemos lo siguiente PromiseAllSet, el .all hace practicamente lo mismo
        await Promise.allSettled([await proyecto.save(), await tarea.deleteOne()]);
        res.json({ msg: 'La tarea se eliminó' });
    } catch (error) {
        console.log(error);
    }
    
}

const cambiarEstado = async (req, res) => {
     const { id } = req.params;
    // Identificar la tarea
    let tarea;
    
    // SI no existe la tarea
    if ((mongoose.Types.ObjectId.isValid(id))){
        tarea = await Tarea.findById(id).populate("proyecto");
    } else {
        const error = new Error('Tarea no encontrada');
        return res.status(404).json({
            msg: error.message
        });
    }

       // Comprobar quien es el creador del proyecto
    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString() && 
        !tarea.proyecto.colaboradores.some((colaborador) => colaborador._id.toString() === req.usuario._id.toString())) {
        const error = new Error('Acción no válida');
        return res.status(403).json({
            msg: error.message
        });
    }
    // se podria hace con un put, pero eso se recomienda cuando es una actualización completa, el ! cambia el boolean
    tarea.estado = !tarea.estado;
    tarea.completado = req.usuario._id; // Referencia a la persona que completo el proyecto, osea a la persona loggeada
    await tarea.save();

    const tareaAlmacenada = await Tarea.findById(id)
        .populate("proyecto")
        .populate("completado"); // esta informacion del populate es la que se esta colando en el state

    res.json(tareaAlmacenada); // la devovemos con la ultima info que ha guardado esa tarea
}

export {
    agregarTarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstado,
}