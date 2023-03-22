const validarJWT = async () => {

  const url = 'http://localhost:3000/api/auth'
  const token = localStorage.getItem('token')
  // console.log('token', token);

  if(!token) {
    setTimeout(() => {
      window.location = '/'
    }, 500);
    throw new Error('No existe el token. Será redirigido al Home.')
  }
  const response = await fetch(url, {
    headers: {
      'x-token': token
    }
  })

  const {usuario, token: tokenDB } = await response.json()
  console.log('usuario logueado', usuario);
  if(usuario.img) {
    $('#user-avatar').attr('src', usuario.img);
  }
  $('.username').html(usuario.nombre)
  
  // console.log('new Token', tokenDB);

  if(!tokenDB) {
    setTimeout(() => {
      window.location = '/'
    }, 3000);
    throw new Error('No existe el token. Será redirigido al Home.')
  }

  localStorage.setItem('token', tokenDB)
  await conectatSocket()

}

const conectatSocket = async () => {
  const socket = io({
    'extraHeaders' : {
      'x-token': localStorage.getItem('token')
    }
  })

  socket.on('usuario-conectado', nombreUsuario => {
    console.log('se ha conectado:', nombreUsuario);

  })

  socket.on('usuario-desconectado', nombreUsuario => {
    console.log('desconectado:', nombreUsuario);

  })

  socket.on('mensajes-recibidos', mensajes => {
    console.log('mensajes:', mensajes);
    dibujarMensajes(mensajes)
  })

  socket.on('mensaje-privado', mensaje => {
    console.log('mensaje privado:', mensaje);
  })

  socket.on('usuarios-activos', usuariosActivos => {
    console.log('usuarios activos:', usuariosActivos);
    dibujarUsuarios(usuariosActivos);
  })

  /**
 * Funcion del boton Logout
 */
  let button = document.getElementById('sign-out')
      
  button.addEventListener('click', () => {
    console.log(google.accounts.id)

    const payload = {
      'dato': 'algun dato importante'
    }

    socket.emit('logout', payload, ( data ) => {
      console.log('Desde el server', data );
    });

    google.accounts.id.disableAutoSelect()

    google.accounts.id.revoke( localStorage.getItem('correo'), done => {
        localStorage.clear()
    })
  })

  /**
   * Envia mensaje de chat
   */
  $('#mensajeForm').on('submit', evt => {
    evt.preventDefault()
  
    let mensaje = $('#mensaje').val()
    let uid = $('#uid').val()
  
    if(mensaje.length == 0)  return
  
    socket.emit('enviar-mensaje', { mensaje, uid })
    $('#mensaje').val("")
  })

}

const main = async () => {
  //validar JWT
  await validarJWT() 
}

const dibujarUsuarios = (usuarios = []) => {
  let usersHtml = '';
  usuarios.forEach( usuario => {
    usersHtml += `
    
      <li>
        <p>
          <h5 class="text-success">${usuario.nombre}</h5>
          <span class="fs-6 text-muted">${usuario.uid}</span>
        </p>
      </li>

    `
    ulUsuarios.innerHTML = usersHtml
  })
}

const dibujarMensajes = (mensajes = []) => {
  let mensajesHtml = '';
  mensajes.forEach( mensaje => {
    mensajesHtml += `
    
      <li>
        <p>
          <span class="text-success">${mensaje.nombre}: </span>
          <span class="fs-6 text-muted">${mensaje.mensaje}</span>
        </p>
      </li>

    `
    ulMensajes.innerHTML = mensajesHtml
  })
}


main()

