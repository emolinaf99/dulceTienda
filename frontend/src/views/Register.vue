<script setup>
    import {reactive, ref, onMounted} from 'vue'
    import { RouterLink, RouterView, useRouter } from 'vue-router'
    import { useApi } from '@/js/composables/useFetch.js'
    import { useUserStore } from '@/js/stores/userLogged.js'
    import { validateForm } from '@/js/composables/useValidateForm.js'

    const router = useRouter()
    const userStore = useUserStore()
    
    const form = reactive({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    })

    const isLoading = ref(false)
    const errors = ref({})

    // Reglas de validación para el formulario de registro
    const validationRules = {
        firstName: {
            required: true,
            minLength: 2,
            maxLength: 100
        },
        lastName: {
            required: true,
            minLength: 2,
            maxLength: 100
        },
        email: {
            required: true,
            email: true
        },
        password: {
            required: true,
            minLength: 6,
            hasNumber: true,
            hasSpecialChar: true
        },
        confirmPassword: {
            required: true,
            match: 'password'
        }
    }

    const validateFormData = () => {
        errors.value = validateForm(form, validationRules)
        return Object.keys(errors.value).length === 0
    }

    const handleRegister = async () => {
        // Validar formulario antes de enviar
        if (!validateFormData()) {
            return
        }

        isLoading.value = true
        errors.value = {}

        try {
            const { data, error } = await useApi('/api/auth/register', 'POST', {
                first_name: form.firstName,
                last_name: form.lastName,
                email: form.email,
                password: form.password
            })

            if (error.value) {
                errors.value.general = error.value.message || 'Error al registrar usuario'
                return
            }

            if (data.value && data.value.success) {
                // Usar el store para guardar el usuario (el token ya está en cookies)
                userStore.setUser(data.value.user)

                // Sincronizar datos del localStorage al backend
                await userStore.syncLocalStorageToBackend()

                router.push('/')
            } else {
                errors.value.general = 'Error al registrar usuario'
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
                <label for="">Nombre</label>
                <input type="text" v-model="form.firstName" :disabled="isLoading" @blur="validateFormData">
                <div class="error" v-if="errors.firstName">
                    <p>{{ errors.firstName }}</p>
                </div>
            </div>
            <div class="inputBlock">
                <label for="">Apellido</label>
                <input type="text" v-model="form.lastName" :disabled="isLoading" @blur="validateFormData">
                <div class="error" v-if="errors.lastName">
                    <p>{{ errors.lastName }}</p>
                </div>
            </div>
            <div class="inputBlock">
                <label for="">Correo electrónico</label>
                <input type="email" v-model="form.email" :disabled="isLoading" @blur="validateFormData">
                <div class="error" v-if="errors.email">
                    <p>{{ errors.email }}</p>
                </div>
            </div>
            <div class="inputBlock">
                <label for="">Contraseña</label>
                <input type="password" v-model="form.password" :disabled="isLoading" @blur="validateFormData">
                <div class="error" v-if="errors.password">
                    <p>{{ errors.password }}</p>
                </div>
            </div>
            <div class="inputBlock">
                <label for="">Confirmar Contraseña</label>
                <input type="password" v-model="form.confirmPassword" :disabled="isLoading" @keyup.enter="handleRegister" @blur="validateFormData">
                <div class="error" v-if="errors.confirmPassword">
                    <p>{{ errors.confirmPassword }}</p>
                </div>
            </div>
            
            <div class="error" v-if="errors.general">
                <p>{{ errors.general }}</p>
            </div>
            
            <div class="inputBlock">
                <button @click="handleRegister" :disabled="isLoading">
                    {{ isLoading ? 'REGISTRANDO...' : 'CREAR CUENTA' }}
                </button>
            </div>
            

            <RouterLink to="/login">Iniciar Sesión</RouterLink>
        </div>
    </section>
</template>



