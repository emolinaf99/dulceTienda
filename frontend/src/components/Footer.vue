<script setup>
    import {reactive,ref,onMounted} from 'vue'

    onMounted(() => {
        function scrollAlInicioDeLaPagina() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth' // Opcional: agrega un desplazamiento suave
            });
        }

        let btnScrollToTop = document.querySelector('.btnUpScroll')

        btnScrollToTop.addEventListener('click',() => {
            scrollAlInicioDeLaPagina()
        })
    })

</script>

<template>
    
    <div class="contenedorFooter">
        
        <div class="columnasFooter">
            <h3>CONTÁCTANOS</h3>
            <div class="columnaFooter">
                <ul class="listaColumna">
                    <li class="itemListaColumna"><a href="https://www.instagram.com/db_basic/" target="_blank"><i class="fa-brands fa-instagram"></i></a><a href="https://wa.link/xkeqni" target="_blank"><i class="fa-brands fa-whatsapp"></i></a></li>
                    <li class="itemListaColumna">(304)3741395</li>
                    <li class="itemListaColumna">correo@gmail.com</li>
                </ul>
            </div>
        </div>
        
    </div>

    <div class="blockeAbsolut">
        <a class="wpp" href="https://wa.link/znmxdo" target="_blank"><i class="fa-brands fa-whatsapp"></i></a>
        <button class="btnUpScroll"><i class="fa-solid fa-chevron-up"></i></button>
    </div>
    
</template>

