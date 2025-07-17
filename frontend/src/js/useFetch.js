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

      const options = {
        method,
        headers,
        credentials: 'include', // Incluir cookies en las peticiones
        body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : null
      };

      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text(); 
      data.value = text ? JSON.parse(text) : null; // Si el cuerpo está vacío, asigna null
      
    } catch (err) {
      error.value = err.message; // Almacena el mensaje de error
    } finally {
      loading.value = false; // Indica que la solicitud ha finalizado
    }
  };

  await fetchData(); // Llama a la función fetchData para ejecutar la solicitud

  return { data, error, loading }; // Devuelve las variables reactivas
}