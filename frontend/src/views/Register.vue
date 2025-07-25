<script setup>
    import {reactive, ref, onMounted} from 'vue'
    import { RouterLink, RouterView, useRouter } from 'vue-router'
    import { useApi } from '@/js/composables/useFetch.js'
    import { useUserStore } from '@/js/stores/userLogged.js'

    const router = useRouter()
    const userStore = useUserStore()
    
    const form = reactive({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    })

    const isLoading = ref(false)
    const errorMessage = ref('')

    const handleRegister = async () => {
        if (!form.name || !form.email || !form.password || !form.confirmPassword) {
            errorMessage.value = 'Por favor completa todos los campos'
            return
        }

        if (form.password !== form.confirmPassword) {
            errorMessage.value = 'Las contraseñas no coinciden'
            return
        }

        if (form.password.length < 6) {
            errorMessage.value = 'La contraseña debe tener al menos 6 caracteres'
            return
        }

        isLoading.value = true
        errorMessage.value = ''

        try {
            const { data, error } = await useApi('/api/auth/register', 'POST', {
                name: form.name,
                email: form.email,
                password: form.password
            })

            if (error.value) {
                errorMessage.value = error.value.message || 'Error al registrar usuario'
                return
            }

            if (data.value && data.value.success) {
                // Usar el store para guardar el usuario (el token ya está en cookies)
                userStore.setUser(data.value.user)
                
                router.push('/')
            } else {
                errorMessage.value = 'Error al registrar usuario'
            }
        } catch (err) {
            errorMessage.value = 'Error de conexión'
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
                <input type="text" v-model="form.name" :disabled="isLoading">
            </div>
            <div class="inputBlock">
                <label for="">Correo electrónico</label>
                <input type="email" v-model="form.email" :disabled="isLoading">
            </div>
            <div class="inputBlock">
                <label for="">Contraseña</label>
                <input type="password" v-model="form.password" :disabled="isLoading">
            </div>
            <div class="inputBlock">
                <label for="">Confirmar Contraseña</label>
                <input type="password" v-model="form.confirmPassword" :disabled="isLoading" @keyup.enter="handleRegister">
            </div>
            
            <div class="error" v-if="errorMessage">
                <p>{{ errorMessage }}</p>
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



