import { ref } from 'vue';

export async function useApi(url, method = 'GET', body = null, contentType = 'application/json') {
  const data = ref(null); // Variable reactiva para almacenar los datos
  const error = ref(null); // Variable reactiva para almacenar el error
  const loading = ref(true); // Variable reactiva para indicar si la solicitud está en curso


  
  const fetchData = async () => {
    
    try {
      
      const headers = {};

      // Solo asigna Content-Type si el body no es FormData
      if (!(body instanceof FormData)) {
        headers['Content-Type'] = contentType;
      }

      // El token se maneja automáticamente a través de cookies con credentials: 'include'
      // No necesitamos agregar el header Authorization manualmente

      const options = {
        method,
        headers,
        credentials: 'include', // Incluir cookies en las peticiones
        body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : null
      };

      const response = await fetch(url, options);
      const text = await response.text();
      const responseData = text ? JSON.parse(text) : null;

      if (!response.ok) {
        // Crear un error que preserve la información del response
        const httpError = new Error(`HTTP error! status: ${response.status}`);
        httpError.response = {
          status: response.status,
          statusText: response.statusText,
          data: responseData
        };
        throw httpError;
      }

      data.value = responseData;
      
    } catch (err) {
      error.value = err; // Almacena el objeto error completo, no solo el message
    } finally {
      loading.value = false; // Indica que la solicitud ha finalizado
    }
  };

  await fetchData(); // Llama a la función fetchData para ejecutar la solicitud

  return { data, error, loading }; // Devuelve las variables reactivas
}