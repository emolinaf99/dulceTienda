<script setup>
    import {reactive, ref, onMounted} from 'vue'
    import { RouterLink, RouterView, useRouter } from 'vue-router'
    import { useApi } from '@/js/composables/useFetch.js'
    import { useUserStore } from '@/js/stores/userLogged.js'
    import { inputFromPasswordToText } from '@/js/inputFromPasswordToText.js'
    import { validateForm } from '@/js/composables/useValidateForm.js'

    const router = useRouter()
    const userStore = useUserStore()
    
    const form = reactive({
        email: '',
        password: ''
    })

    const isLoading = ref(false)
    const errors = ref({})

    // Reglas de validación para el formulario de login
    const validationRules = {
        email: { 
            required: true, 
            email: true 
        },
        password: { 
            required: true, 
            minLength: 6 
        }
    }

    const validateFormData = () => {
        errors.value = validateForm(form, validationRules)
        return Object.keys(errors.value).length === 0
    }

    const handleLogin = async () => {
        // Validar formulario antes de enviar
        if (!validateFormData()) {
            return
        }

        isLoading.value = true
        errors.value = {}

        try {
            const { data, error } = await useApi('/api/auth/login', 'POST', {
                email: form.email,
                password: form.password
            })

            if (error.value) {
                errors.value.general = 'Credenciales incorrectas'
                return
            }

            if (data.value && data.value.success) {
                // Usar el store para guardar el usuario (el token ya está en cookies)
                userStore.setUser(data.value.user)

                // Sincronizar datos del localStorage al backend
                await userStore.syncLocalStorageToBackend()

                router.push('/')
            } else {
                errors.value.general = 'Error al iniciar sesión'
            }
        } catch (err) {
            errors.value.general = 'Error de conexión'
        } finally {
            isLoading.value = false
        }
    }

</script>

<template>
    <section class="contenedorLogin">
        <div class="bloqueLogin">
            
            <div class="inputBlock">
                <label for="">Correo electrónico</label>
                <input type="email" v-model="form.email" :disabled="isLoading" @blur="validateFormData">
                <div class="error" v-if="errors.email">
                    <p>{{ errors.email }}</p>
                </div>
            </div>
            <div class="inputBlock" style="position: relative;">
                <label for="">Contraseña</label>
                <input type="password" v-model="form.password" :disabled="isLoading" @keyup.enter="handleLogin" @blur="validateFormData">
                <!-- Botón para mostrar/ocultar la contraseña -->
                <span class="passwordEye">
                    <i
                        class="fa fa-eye-slash"
                        @click="inputFromPasswordToText($event.target)" 
                    ></i>
                </span>
                <div class="error" v-if="errors.password">
                    <p>{{ errors.password }}</p>
                </div>
            </div>
            <div class="error" v-if="errors.general">
                <p>{{ errors.general }}</p>
            </div>
            
            <div class="inputBlock">
                <button @click="handleLogin" :disabled="isLoading">
                    {{ isLoading ? 'INICIANDO...' : 'INICIAR SESIÓN' }}
                </button>
            </div>
            <RouterLink to="/register"  class="inputBlock">
                <button>CREAR CUENTA</button>
            </RouterLink>

            <RouterLink to="/forgot-password">¿Olvidaste tu contraseña?</RouterLink>
        </div>
    </section>
</template>



