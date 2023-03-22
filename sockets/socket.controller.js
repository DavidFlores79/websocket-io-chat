const Socket = require('socket.io');
const { comprobarJWT } = require('../middlewares');
const { ChatMensajes } = require('../models');


const chatMensajes = new ChatMensajes()

const socketController = async ( socket = new Socket(), io ) => {

    const token = socket.handshake.headers['x-token']
   
    // leer el usuario del token
    const usuario = await comprobarJWT(token)

    if( !usuario ) {
        console.log('desconectar usuario');
        chatMensajes.desconectarUsuario(usuario.id)
        io.emit('usuario-desconectado', usuario.nombre)
        io.emit('usuarios-activos', chatMensajes.usuariosArr)
        socket.disconnect()
    }
        
    console.log('usuario conectado', usuario.nombre);
    chatMensajes.conectarUsuario(usuario)
    io.emit('usuario-conectado', usuario.nombre)
    io.emit('usuarios-activos', chatMensajes.usuariosArr)
    io.emit('mensajes-recibidos', chatMensajes.ultimos10)
    socket.join( usuario.id ) //conectarlo a una sala con su UID

    socket.on('logout',  (payload, callback) => {

        console.log('payload', payload);
        // const siguienteTicket = ticketControl.siguiente()
        callback( 'el valor del callback' )
        chatMensajes.desconectarUsuario(usuario.id)
        io.emit('usuario-desconectado', usuario.nombre)
        io.emit('usuarios-activos', chatMensajes.usuariosArr)
        socket.disconnect()
    })

    socket.on('enviar-mensaje',  (payload) => {
        console.log('payload', payload);

        if(payload.uid) {
            //mensaje privado
            socket.to(payload.uid).emit('mensaje-privado', { de: usuario.nombre, mensaje: payload.mensaje })
        } else {
            chatMensajes.enviarMensaje(usuario.id, usuario.nombre, payload.mensaje)
            io.emit('mensajes-recibidos', chatMensajes.ultimos10)
        }
    })

    socket.on('disconnect', payload => {
        chatMensajes.desconectarUsuario(usuario.id)
        io.emit('usuario-desconectado', usuario.nombre)
        io.emit('usuarios-activos', chatMensajes.usuariosArr)
        console.log('desconectado', payload);
    })
}

module.exports = { socketController }