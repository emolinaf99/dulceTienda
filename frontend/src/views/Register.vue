<script setup>
    import {reactive, ref, onMounted} from 'vue'
    import { RouterLink, RouterView } from 'vue-router'


</script>

<template>
    <section class="contenedorLogin">
        <div class="bloqueLogin">
            <div class="inputBlock">
                <label for="">Nombre</label>
                <input type="text" name="">
            </div>
            <div class="inputBlock">
                <label for="">Contraseña</label>
                <input type="text" name="">
            </div>
            <div class="inputBlock">
                <label for="">Correo electrónico</label>
                <input type="email" name="">
            </div>
            <div class="inputBlock">
                <label for="">Contraseña</label>
                <input type="password" name="">
            </div>
            
            <div class="inputBlock">
                <button>CREAR CUENTA</button>
            </div>
            

            <RouterLink to="/login">Iniciar Sesión</RouterLink>
        </div>
    </section>
</template>



