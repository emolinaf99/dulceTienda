import { ref } from 'vue'; // Importa ref de Vue para crear variables reactivas.

export function useApi(url, method = 'GET', body = null) {
    
  // Crea una variable reactiva para almacenar los datos de la respuesta.
  const data = ref(null); 
  
  // Crea una variable reactiva para almacenar cualquier error que ocurra.
  const error = ref(null); 
  
  // Crea una variable reactiva para indicar si la solicitud está en curso.
  const loading = ref(true); 

  // Configura las opciones para la solicitud fetch, incluyendo el método y los headers.
  const options = {
    method, // Define el método HTTP (GET, POST, etc.).
    headers: {
      'Content-Type': 'application/json' // Establece el tipo de contenido como JSON.
    },
    // Si hay un cuerpo (para métodos como POST), lo convierte a un string JSON.
    body: body ? JSON.stringify(body) : null 
  };

  // Realiza la solicitud fetch con la URL y las opciones configuradas.
  fetch(url, options)
    .then(response => {
      // Si la respuesta no es exitosa (status no en el rango 200-299), lanza un error.
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Si la respuesta es exitosa, la convierte a formato JSON.
      return response.json();
    })
    .then(json => {
      // Almacena los datos JSON en la variable data.
      data.value = json;
    })
    .catch(err => {
      // Si ocurre un error, lo almacena en la variable error.
      error.value = err.message;
    })
    .finally(() => {
      // Finalmente, marca que la solicitud ha terminado, independientemente de si fue exitosa o fallida.
      loading.value = false;
    });

  // Devuelve las variables reactivas para usarlas en los componentes Vue.
  return { data, error, loading };
}