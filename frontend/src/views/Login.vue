<script setup>
    import {reactive, ref, onMounted} from 'vue'
    import { RouterLink, RouterView, useRouter } from 'vue-router'
    import { useApi } from '@/js/composables/useFetch.js'
    import { useUserStore } from '@/js/stores/userLogged.js'
    import { inputFromPasswordToText } from '@/js/inputFromPasswordToText.js'

    const router = useRouter()
    const userStore = useUserStore()
    
    const form = reactive({
        email: '',
        password: ''
    })

    const isLoading = ref(false)
    const errorMessage = ref('')

    const handleLogin = async () => {
        if (!form.email || !form.password) {
            errorMessage.value = 'Por favor ingresa tu correo y contraseña'
            return
        }

        isLoading.value = true
        errorMessage.value = ''

        try {
            const { data, error } = await useApi('/api/auth/login', 'POST', {
                email: form.email,
                password: form.password
            })

            if (error.value) {
                errorMessage.value = 'Credenciales incorrectas'
                return
            }

            if (data.value && data.value.success) {
                // Usar el store para guardar el usuario
                userStore.setUser(data.value.user, data.value.token)
                
                router.push('/')
            } else {
                errorMessage.value = 'Error al iniciar sesión'
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
                <label for="">Correo electrónico</label>
                <input type="email" v-model="form.email" :disabled="isLoading">
            </div>
            <div class="inputBlock" style="position: relative;">
                <label for="">Contraseña</label>
                <input type="password" v-model="form.password" :disabled="isLoading" @keyup.enter="handleLogin">
                <!-- Botón para mostrar/ocultar la contraseña -->
                <span class="passwordEye">
                    <i
                        class="fa fa-eye-slash"
                        @click="inputFromPasswordToText($event.target)" 
                    ></i>
                </span>
            </div>
            <div class="error" v-if="errorMessage">
                <p>{{ errorMessage }}</p>
            </div>
            
            <div class="inputBlock">
                <button @click="handleLogin" :disabled="isLoading">
                    {{ isLoading ? 'INICIANDO...' : 'INICIAR SESIÓN' }}
                </button>
            </div>
            <RouterLink to="/register"  class="inputBlock">
                <button>CREAR CUENTA</button>
            </RouterLink>

            <RouterLink to="/">Recuperar contraseña</RouterLink>
        </div>
    </section>
</template>



