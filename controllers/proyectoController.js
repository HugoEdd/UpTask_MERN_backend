import Proyecto from "../models/Proyecto.js";
import mongoose from "mongoose"; 
// import Tarea from "../models/Tarea.js";
import Usuario from "../models/Usuario.js";

const obtenerProyectos = async (req, res) => {
    // recuperar los proyectos del usuario que esta actualmente con el login
    // equals significa es igual a, con mongoose podemos crear funciones mas avanzadas
    // select, en la respuesta no te traigas las tareas
    const proyectos = await Proyecto.find({
        // find toma un arreglo de condiciones que queremos comprobar,por default la condicion es and
        '$or' : [
            {'colaboradores': {$in: req.usuario}},
            {'creador': {$in: req.usuario}}
        ]
    }).select('-tareas');
    // al hacer la comprobacion arriba ya no requerimos de este .where('creador').equals(req.usuario), lo hace adentro

    res.json(proyectos);
}

const nuevoProyecto = async (req, res) => {
    const proyecto = new Proyecto(req.body); // Intancia proyecto pero con la informacion que le pasamos en req.body
    proyecto.creador = req.usuario._id;

    try {
        const proyectoAlmacenado = await proyecto.save();
        res.json(proyectoAlmacenado);
    } catch (error) {
        console.log(error);
    }
}

const obtenerProyecto = async (req, res) => {

    // Acceder a routing dinamico
    const { id } = req.params;
    let proyecto;
    // Consultar si el proyecto existe
    // const proyecto = await Proyecto.findById(id);
    //  built-in de mongoose que verifica si el id del proyecto es un ObjectId válido.
    if (mongoose.Types.ObjectId.isValid(id)) {
        // populate expecifica la relación para traer las tareas relacionadas con el proyecto
        // referencia al campo que tenemos en el modelo que es el array tareas
        proyecto = await Proyecto.findById(id)
            .populate({path: "tareas", populate: {path: "completado", select: "nombre"},}) 
            .populate("colaboradores", "nombre email")
            ;
        // .select para no traer informacion no funciona, debido a que aqui traemos informacion cruzada
    } else {
        const error = new Error('El proyecto no fue encontrado');
        return res.status(404).json({ msg: error.message});
    }

     // Verificar que la persona tiene el dereche de agregar colaboradores, osea que sea el creador
    if(proyecto.creador.toString() !== req.usuario._id.toString() && 
        !proyecto.colaboradores.some((colaborador) => colaborador._id.toString() === req.usuario._id.toString())) { 
        // tiene que no ser el creador del proyecto, y tiene que no ser un coborador para que no puede acceder
        //some() se utiliza para determinar si al menos un elemento de un arreglo cumple con una condición especificada truyfalse.lo pasamos a toString si no nos marcara que son diferentes
        const error = new Error('Acción no válida');
        return res.status(404).json({
            msg: error.message
        });
    }
    // Obtener las tareas del Proyecto - comentamos esto por que el profe no quiere dos respuestas cuando se consulta
    //const tareas = await Tarea.find().where('proyecto').equals(proyecto._id); // busca los id que coincidad
    // asociar proyecto a esas tareas
    res.json(
        proyecto,
        // tareas,
    );
};

const editarProyecto = async (req, res) => {
      // Acceder a routing dinamico
    const { id } = req.params;
    let proyecto;
    // Consultar si el proyecto existe
    // const proyecto = await Proyecto.findById(id);
    //  built-in de mongoose que verifica si el id del proyecto es un ObjectId válido.
    
    if (mongoose.Types.ObjectId.isValid(id)) {
        proyecto = await Proyecto.findById(id);
    } else {
        const error = new Error('El proyecto no fue encontrado');
        return res.status(404).json({ msg: error.message});
    }

    // SI no es el creador no tiene acceso al proyecto. Si es diferenta a !==
    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción no válida');
        return res.status(401).json({
            msg: error.message
        });
    }
    
    // Es el mismo objeto y paso las valicaciones
    // Si no hay un descripcion para actualizar, asigna la que esta en la db
    proyecto.nombre = req.body.nombre || proyecto.nombre; // o lo que ya hay en la db, si el usuario no envío nada
    proyecto.descripcion = req.body.descripcion || proyecto.descripcion; 
    proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega; 
    proyecto.cliente = req.body.cliente || proyecto.cliente; 

    try{
        const proyectoAlmacenado = await proyecto.save();
        res.json(proyectoAlmacenado);
    } catch(error){
        console.log(error);
    }

}

const eliminarProyecto = async (req, res) => {
    const { id } = req.params;
    let proyecto;
       
    if (mongoose.Types.ObjectId.isValid(id)) {
        proyecto = await Proyecto.findById(id);
    } else {
        const error = new Error('El proyecto no fue encontrado');
        return res.status(404).json({ msg: error.message});
    }

    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción no válida');
        return res.status(401).json({
            msg: error.message
        });
    }
    
    try {
        await proyecto.deleteOne(); // deleteOne nos permite eliminar un documento de la db
        res.json({
            msg: 'Proyecto Eliminado'
        });
    } catch (error) {
        console.log(error);
    }
}

const buscarColaborador = async (req, res) => {
    // Extraer el email que nos manda desde el front
    const {email} = req.body;
    
    // Revisar si el usuario esta registrado
    const usuario = await Usuario.findOne({email}).select('-confirmado -createdAt -password -token -updatedAt -__v');

    if(!usuario) {
        const error = new Error('Usuario no encontrado');
        return res.status(404).json({
            msg: error.message
        });
    }

    res.json(usuario);
}

const agregarColaborador = async (req, res) => {
    const proyecto = await Proyecto.findById(req.params.id);

    if(!proyecto){
        const error = new Error('Proyecto No Encontrado');
        return res.status(404).json({
            msg: error.message
        });
    }

      // SI no es el creador no tiene acceso al proyecto. Si es diferenta a !==
    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción no válida');
        return res.status(401).json({
            msg: error.message
        });
    }

   // Extraer el email que nos manda desde el front
    const {email} = req.body;
    
    // Revisar si el usuario esta registrado
    const usuario = await Usuario.findOne({email}).select('-confirmado -createdAt -password -token -updatedAt -__v');

    if(!usuario) {
        const error = new Error('Usuario no encontrado');
        return res.status(404).json({
            msg: error.message
        });
    }

    // El colaborador no es el admin del proyecto
    if(proyecto.creador.toString() === usuario._id.toString()){ 
        const error = new Error('El creador del proyecto no puede ser colaborador');
        return res.status(404).json({
            msg: error.message
        });
    }

    // Revisar que no este ya agregado al proyecto, recuerda que estan en un arreglo asi que revisar si existe dentro de
    if(proyecto.colaboradores.includes(usuario._id)) {
        const error = new Error('El usuario ya pertenece al proyecto');
        return res.status(404).json({
            msg: error.message
        });
    }

    // Esta bien, cumple con todas las validaciones! Se puede agregar
    proyecto.colaboradores.push(usuario._id);
    await proyecto.save();
    res.json({msg: 'Colaborador Agregado Correctamente'});


}

const eliminarColaborador = async (req, res) => {
        const proyecto = await Proyecto.findById(req.params.id);

    if(!proyecto){
        const error = new Error('Proyecto No Encontrado');
        return res.status(404).json({
            msg: error.message
        });
    }

    // Verificar que la persona tiene el dereche de agregar colaboradores, osea que sea el creador
    if(proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción no válida');
        return res.status(404).json({
            msg: error.message
        });
    }

    // Esta bien, se puede eliminar
    proyecto.colaboradores.pull(req.body.id);
    await proyecto.save();
    res.json({msg: 'Colaborador Eliminado Correctamente'});
  
}


export {
    obtenerProyectos,
    nuevoProyecto,
    obtenerProyecto,
    editarProyecto,
    eliminarProyecto,
    buscarColaborador,
    agregarColaborador,
    eliminarColaborador,
};




