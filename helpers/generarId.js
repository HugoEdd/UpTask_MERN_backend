// Este archivo genera los token que le enviaremos al usuario via email ES PARA CONFIRMAR SU CUENTA
const generarId = () => {
    const random = Math.random().toString(32).substring(2);
    const fecha = Date.now().toString(32);
    return random + fecha;
}

export default generarId;