import { ref } from 'vue'

export function useModal() {
  const isModalOpen = ref(false)

  const abrirVentana = () => {
    isModalOpen.value = true
    // Prevenir scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden'
  }

  const cerrarVentana = () => {
    isModalOpen.value = false
    // Restaurar scroll del body
    document.body.style.overflow = 'auto'
  }

  const toggleVentana = () => {
    if (isModalOpen.value) {
      cerrarVentana()
    } else {
      abrirVentana()
    }
  }

  return {
    isModalOpen,
    abrirVentana,
    cerrarVentana,
    toggleVentana
  }
}