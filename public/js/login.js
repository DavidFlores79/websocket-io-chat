(function($){
    $.fn.getFormData = function(){
      var data = {};
      var dataArray = $(this).serializeArray();
      for(var i=0;i<dataArray.length;i++){
        data[dataArray[i].name] = dataArray[i].value;
      }
      return data;
    }
})(jQuery);

const url = 'http://localhost:3000/api/auth'

function handleCredentialResponse(response) {
    console.log("response", response)
    const body = {id_token: response.credential}

  fetch(url + '/google', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
  })
  .then(resp => resp.json())
  .then(resp =>  {
      console.log('response api', resp)
      localStorage.setItem('correo', resp.usuario.correo)
      localStorage.setItem('token', resp.token)
      location.href = '/chat.html'
  })
  .catch(err => console.log(err) )
}

$('#loginForm').on('submit', evt => {
  evt.preventDefault()
  const formData = $("#loginForm").getFormData()
  console.log('formData', formData)

  fetch(url + '/login', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
  })
  .then(resp => resp.json())
  .then(resp =>  {
      console.log('response api', resp)
      if(!resp.ok) {
        console.log('Error', resp.msg);
      } else {
            localStorage.setItem('token', resp.token)
            location.href = '/chat.html'
      }
  })
  .catch(err => console.log(err) )
  
})
