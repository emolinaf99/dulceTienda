<script setup>
import { reactive, ref, onMounted } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useApi } from '@/js/composables/useFetch.js'
import { validateForm } from '@/js/composables/useValidateForm.js'
import { inputFromPasswordToText } from '@/js/inputFromPasswordToText.js'

const router = useRouter()
const route = useRoute()

const form = reactive({
    newPassword: '',
    confirmPassword: ''
})

const isLoading = ref(false)
const isVerifying = ref(true)
const errors = ref({})
const tokenValid = ref(false)
const tokenError = ref('')
const userEmail = ref('')

// Obtener token de la URL
const token = route.params.token

// Reglas de validación
const validationRules = {
    newPassword: {
        required: true,
        minLength: 6,
        hasNumber: true,
        hasSpecialChar: true
    },
    confirmPassword: {
        required: true,
        match: 'newPassword'
    }
}

const validateFormData = () => {
    errors.value = validateForm(form, validationRules)
    return Object.keys(errors.value).length === 0
}

// Verificar token al cargar la página
onMounted(async () => {
    if (!token) {
        tokenError.value = 'Token no proporcionado'
        isVerifying.value = false
        return
    }

    try {
        const { data, error } = await useApi(`/api/password-reset/verify/${token}`, 'GET')

        if (error.value) {
            tokenError.value = error.value.message || 'Token inválido o expirado'
            tokenValid.value = false
        } else if (data.value && data.value.success) {
            tokenValid.value = true
            userEmail.value = data.value.email
        } else {
            tokenError.value = 'Token inválido o expirado'
            tokenValid.value = false
        }
    } catch (err) {
        tokenError.value = 'Error al verificar el token'
        tokenValid.value = false
    } finally {
        isVerifying.value = false
    }
})

const handleSubmit = async () => {
    // Validar formulario
    if (!validateFormData()) {
        return
    }

    isLoading.value = true
    errors.value = {}

    try {
        const { data, error } = await useApi('/api/password-reset/reset', 'POST', {
            token,
            newPassword: form.newPassword
        })

        if (error.value) {
            errors.value.general = error.value.message || 'Error al restablecer la contraseña'
            return
        }

        if (data.value && data.value.success) {
            // Mostrar mensaje de éxito y redirigir al login
            alert('Contraseña restablecida exitosamente. Ahora puedes iniciar sesión.')
            router.push('/login')
        } else {
            errors.value.general = 'Error al restablecer la contraseña'
        }
    } catch (err) {
        errors.value.general = 'Error de conexión. Por favor intenta de nuevo.'
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <section class="contenedorResetPassword">
        <div class="bloqueResetPassword">
            <!-- Estado de carga -->
            <div v-if="isVerifying" class="verifyingState">
                <div class="spinner"></div>
                <p>Verificando enlace de recuperación...</p>
            </div>

            <!-- Token inválido o expirado -->
            <div v-else-if="!tokenValid" class="errorState">
                <div class="iconHeader error">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h1>Enlace inválido o expirado</h1>
                <p class="descripcion">{{ tokenError }}</p>
                <div class="linksNavegacion">
                    <RouterLink to="/forgot-password" class="btnPrimary">
                        Solicitar nuevo enlace
                    </RouterLink>
                    <RouterLink to="/login" class="link">
                        Volver al inicio de sesión
                    </RouterLink>
                </div>
            </div>

            <!-- Formulario de cambio de contraseña -->
            <div v-else>
                <div class="iconHeader">
                    <i class="fas fa-key"></i>
                </div>

                <h1>Crear nueva contraseña</h1>
                <p class="descripcion">
                    Ingresa tu nueva contraseña para la cuenta asociada a <strong>{{ userEmail }}</strong>
                </p>

                <div class="inputBlock" style="position: relative;">
                    <label for="newPassword">Nueva contraseña</label>
                    <input
                        type="password"
                        id="newPassword"
                        v-model="form.newPassword"
                        :disabled="isLoading"
                        @blur="validateFormData"
                        placeholder="Mínimo 6 caracteres"
                    >
                    <span class="passwordEye">
                        <i
                            class="fa fa-eye-slash"
                            @click="inputFromPasswordToText($event.target)"
                        ></i>
                    </span>
                    <div class="error" v-if="errors.newPassword">
                        <p>{{ errors.newPassword }}</p>
                    </div>
                </div>

                <div class="inputBlock" style="position: relative;">
                    <label for="confirmPassword">Confirmar contraseña</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        v-model="form.confirmPassword"
                        :disabled="isLoading"
                        @blur="validateFormData"
                        @keyup.enter="handleSubmit"
                        placeholder="Repite tu contraseña"
                    >
                    <span class="passwordEye">
                        <i
                            class="fa fa-eye-slash"
                            @click="inputFromPasswordToText($event.target)"
                        ></i>
                    </span>
                    <div class="error" v-if="errors.confirmPassword">
                        <p>{{ errors.confirmPassword }}</p>
                    </div>
                </div>

                <div class="passwordRequirements">
                    <p><strong>La contraseña debe contener:</strong></p>
                    <ul>
                        <li>Al menos 6 caracteres</li>
                        <li>Al menos un número</li>
                        <li>Al menos un carácter especial (!@#$%^&*)</li>
                    </ul>
                </div>

                <div class="error" v-if="errors.general">
                    <p>{{ errors.general }}</p>
                </div>

                <div class="inputBlock">
                    <button @click="handleSubmit" :disabled="isLoading">
                        <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
                        {{ isLoading ? 'RESTABLECIENDO...' : 'RESTABLECER CONTRASEÑA' }}
                    </button>
                </div>

                <div class="linksNavegacion">
                    <RouterLink to="/login" class="link">
                        <i class="fas fa-arrow-left"></i>
                        Volver al inicio de sesión
                    </RouterLink>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.contenedorResetPassword {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(180deg, #fafafa 0%, #ffffff 100%);
    padding: 2rem 1rem;
    font-family: 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
    margin-top: 6rem;
}

.bloqueResetPassword {
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

.iconHeader.error {
    background: linear-gradient(135deg, #e74c3c, #c0392b);
    box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.iconHeader i {
    font-size: 2rem;
    color: white;
}

.bloqueResetPassword h1 {
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

.passwordEye {
    position: absolute;
    right: 1rem;
    top: 2.75rem;
    cursor: pointer;
    color: #999;
    transition: color 0.3s ease;
}

.passwordEye:hover {
    color: #f06baa;
}

.passwordRequirements {
    background: #f8f9fa;
    border-left: 4px solid #f06baa;
    padding: 1rem 1.25rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
}

.passwordRequirements p {
    color: #333;
    font-size: 0.875rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
}

.passwordRequirements ul {
    margin: 0;
    padding-left: 1.25rem;
}

.passwordRequirements li {
    color: #666;
    font-size: 0.8125rem;
    line-height: 1.8;
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

.btnPrimary {
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
    text-decoration: none;
    text-align: center;
    display: block;
}

.btnPrimary:hover {
    background: linear-gradient(135deg, #e85a9b, #d0487d);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(240, 107, 170, 0.4);
}

.verifyingState {
    text-align: center;
    padding: 2rem 0;
}

.spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #f06baa;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
    margin: 0 auto 1.5rem;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.verifyingState p {
    color: #666;
    font-size: 0.9375rem;
}

.errorState {
    text-align: center;
}

@media screen and (min-width: 768px) {
    .bloqueResetPassword {
        padding: 3rem 3rem;
    }

    .bloqueResetPassword h1 {
        font-size: 2rem;
    }
}
</style>
