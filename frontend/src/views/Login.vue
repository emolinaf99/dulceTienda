<script setup>
    import {reactive, ref, onMounted} from 'vue'
    import { RouterLink, RouterView } from 'vue-router'


</script>

<template>
    <section class="contenedorLogin">
        <div class="bloqueLogin">
            <div class="inputBlock">
                <label for="">Correo electrónico</label>
                <input type="text" name="">
            </div>
            <div class="inputBlock">
                <label for="">Contraseña</label>
                <input type="password" name="">
            </div>
            
            <div class="inputBlock">
                <button>INICIAR SESIÓN</button>
            </div>
            <RouterLink to="/register"  class="inputBlock">
                <button>CREAR CUENTA</button>
            </RouterLink>

            <RouterLink to="/">Recuperar contraseña</RouterLink>
        </div>
    </section>
</template>



