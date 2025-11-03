<script setup>
import { reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useApi } from '@/js/composables/useFetch.js'
import { validateForm } from '@/js/composables/useValidateForm.js'

const form = reactive({
    email: ''
})

const isLoading = ref(false)
const errors = ref({})
const successMessage = ref('')

// Reglas de validación
const validationRules = {
    email: {
        required: true,
        email: true
    }
}

const validateFormData = () => {
    errors.value = validateForm(form, validationRules)
    return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
    // Limpiar mensajes anteriores
    successMessage.value = ''
    errors.value = {}

    // Validar formulario
    if (!validateFormData()) {
        return
    }

    isLoading.value = true

    try {
        const { data, error } = await useApi('/api/password-reset/request', 'POST', {
            email: form.email
        })

        if (error.value) {
            errors.value.general = error.value.message || 'Error al procesar la solicitud'
            return
        }

        if (data.value && data.value.success) {
            successMessage.value = data.value.message
            form.email = '' // Limpiar formulario
        } else {
            errors.value.general = 'Error al enviar el correo de recuperación'
        }
    } catch (err) {
        errors.value.general = 'Error de conexión. Por favor intenta de nuevo.'
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <section class="contenedorForgotPassword">
        <div class="bloqueForgotPassword">
            <!-- Icono de cabecera -->
            <div class="iconHeader">
                <i class="fas fa-lock"></i>
            </div>

            <h1>¿Olvidaste tu contraseña?</h1>
            <p class="descripcion">
                No te preocupes, ingresa tu correo electrónico y te enviaremos un enlace para recuperarla.
            </p>

            <!-- Mensaje de éxito -->
            <div v-if="successMessage" class="successMessage">
                <i class="fas fa-check-circle"></i>
                <p>{{ successMessage }}</p>
            </div>

            <!-- Formulario -->
            <div v-if="!successMessage">
                <div class="inputBlock">
                    <label for="email">Correo electrónico</label>
                    <input
                        type="email"
                        id="email"
                        v-model="form.email"
                        :disabled="isLoading"
                        @blur="validateFormData"
                        @keyup.enter="handleSubmit"
                        placeholder="ejemplo@correo.com"
                    >
                    <div class="error" v-if="errors.email">
                        <p>{{ errors.email }}</p>
                    </div>
                </div>

                <div class="error" v-if="errors.general">
                    <p>{{ errors.general }}</p>
                </div>

                <div class="inputBlock">
                    <button @click="handleSubmit" :disabled="isLoading">
                        <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
                        {{ isLoading ? 'ENVIANDO...' : 'ENVIAR ENLACE DE RECUPERACIÓN' }}
                    </button>
                </div>
            </div>

            <!-- Links de navegación -->
            <div class="linksNavegacion">
                <RouterLink to="/login" class="link">
                    <i class="fas fa-arrow-left"></i>
                    Volver al inicio de sesión
                </RouterLink>
                <RouterLink to="/register" class="link">
                    ¿No tienes cuenta? Regístrate
                </RouterLink>
            </div>
        </div>
    </section>
</template>

<style scoped>
.contenedorForgotPassword {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(180deg, #fafafa 0%, #ffffff 100%);
    padding: 2rem 1rem;
    font-family: 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
    margin-top: 6rem;
}

.bloqueForgotPassword {
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    padding: 3rem 2rem;
    width: 100%;
    max-width: 480px;
    border: 1px solid rgba(0, 0, 0, 0.04);
}

.iconHeader {
    width: 80px;
    height: 80px;
    margin: 0 auto 1.5rem;
    background: linear-gradient(135deg, #f06baa, #e85a9b);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(240, 107, 170, 0.3);
}

.iconHeader i {
    font-size: 2rem;
    color: white;
}

.bloqueForgotPassword h1 {
    color: #333;
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0 0 0.75rem 0;
    text-align: center;
    letter-spacing: -0.5px;
}

.descripcion {
    color: #666;
    font-size: 0.9375rem;
    line-height: 1.6;
    text-align: center;
    margin: 0 0 2rem 0;
}

.inputBlock {
    margin-bottom: 1.5rem;
}

.inputBlock label {
    display: block;
    color: #333;
    font-weight: 600;
    font-size: 0.9375rem;
    margin-bottom: 0.5rem;
}

.inputBlock input {
    width: 100%;
    padding: 0.875rem 1rem;
    border: 2px solid #e0e0e0;
    border-radius: 10px;
    font-size: 0.9375rem;
    transition: all 0.3s ease;
    background: white;
    box-sizing: border-box;
}

.inputBlock input:focus {
    outline: none;
    border-color: #f06baa;
    box-shadow: 0 0 0 3px rgba(240, 107, 170, 0.1);
}

.inputBlock input:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
}

.inputBlock button {
    width: 100%;
    padding: 1rem 1.5rem;
    background: linear-gradient(135deg, #f06baa, #e85a9b);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 0.9375rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 12px rgba(240, 107, 170, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.inputBlock button:hover:not(:disabled) {
    background: linear-gradient(135deg, #e85a9b, #d0487d);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(240, 107, 170, 0.4);
}

.inputBlock button:disabled {
    background: linear-gradient(135deg, #e0e0e0, #d0d0d0);
    color: #999;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
}

.error {
    margin-top: 0.5rem;
}

.error p {
    color: #e74c3c;
    font-size: 0.8125rem;
    margin: 0;
}

.successMessage {
    background: #e8f5e9;
    border-left: 4px solid #4caf50;
    padding: 1rem 1.25rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
}

.successMessage i {
    color: #4caf50;
    font-size: 1.25rem;
    margin-top: 2px;
    flex-shrink: 0;
}

.successMessage p {
    color: #2e7d32;
    font-size: 0.9375rem;
    line-height: 1.5;
    margin: 0;
}

.linksNavegacion {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e0e0e0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.link {
    color: #666;
    font-size: 0.875rem;
    text-decoration: none;
    text-align: center;
    transition: color 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.link:hover {
    color: #f06baa;
}

.link i {
    font-size: 0.75rem;
}

@media screen and (min-width: 768px) {
    .bloqueForgotPassword {
        padding: 3rem 3rem;
    }

    .bloqueForgotPassword h1 {
        font-size: 2rem;
    }
}
</style>
