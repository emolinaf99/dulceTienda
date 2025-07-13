<script setup>
    import {reactive,ref,onMounted, watch} from 'vue'
    import { RouterLink, RouterView, useRoute} from 'vue-router'
    import {scrollearConClick} from '/src/js/scrollWithClick'
    import Nuevo from '../components/Nuevo.vue'

    const props = defineProps({
        id: String
    })

    onMounted(() => {

        let contenedorScroll = document.querySelector('.vitrinaSlide')
        let itemIntoScroll = document.querySelector('.vitrinaSlide img')

        let scrollDerecha = document.querySelector('.scrollDerechaDetalle')
        let scrollIzquierda = document.querySelector('.scrollIzquierdaDetalle')

        let contenedorImagesMini = document.querySelector('.contenedorImagenesMini')
        let imagenesMini = document.querySelectorAll('.contenedorImagenesMini img')
        let imagenesGrandes = document.querySelectorAll('.vitrinaSlide img')

        function findVisibleImage(derechaOIzquierda) { // para encontrar la imagen visible
            const images = Array.from(imagenesMini);
            const contRect = contenedorImagesMini.getBoundingClientRect();

            for (let i = 0; i < images.length; i++) {
                const img = images[i];
                const rect = img.getBoundingClientRect();

                if (
                    rect.top >= contRect.top &&
                    rect.left >= contRect.left &&
                    rect.bottom <= contRect.bottom &&
                    rect.right <= contRect.right
                ) {
                    // Si el scroll es hacia la derecha (0), devolver la siguiente imagen
                    if (derechaOIzquierda === 0 && i < images.length - 1) {
                        return images[i + 1];
                    }
                    // Si el scroll es hacia la izquierda (1), devolver la imagen anterior
                    if (derechaOIzquierda === 1 && i > 0) {
                        return images[i - 1];
                    }
                    return img; // Devuelve la imagen actual si no hay siguiente/anterior
                }
            }
            return null;
        }

        function selectImgMini(img) {
            let imagenMiniEncontrada = Array.from(imagenesMini).find(imagenP => imagenP.src == img.src)

            imagenesMini.forEach((imagen) => {
                imagen.style.border = '0'
            })

            img.style.border = '2px solid #333333' 
                
            // Desplazar el contenedor hasta la imagen encontrada
            imagenMiniEncontrada.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
        
        scrollDerecha.addEventListener('click',() => {
            scrollearConClick(contenedorScroll,itemIntoScroll,0)
            const visibleImage = findVisibleImage(0)
            selectImgMini(visibleImage)
        })

        scrollIzquierda.addEventListener('click',() => {
            scrollearConClick(contenedorScroll,itemIntoScroll,1)
            
            const visibleImage = findVisibleImage(1)
            selectImgMini(visibleImage)
        })

        let previousScrollLeft = 0; // Almacena la posición anterior del scroll

        contenedorScroll.addEventListener('scroll', () => {
            const currentScrollLeft = contenedorScroll.scrollLeft; // Posición actual del scroll

            if (currentScrollLeft > previousScrollLeft) {
                const visibleImage = findVisibleImage(0)
                selectImgMini(visibleImage)
                
            } else if (currentScrollLeft < previousScrollLeft) {
                const visibleImage = findVisibleImage(1)
                selectImgMini(visibleImage)
            }

            // Actualiza la posición previa del scroll
            previousScrollLeft = currentScrollLeft;
        });


        imagenesMini.forEach(img => {
            img.addEventListener('click', () => { // cuando una imagen pequeña escucha click
                imagenesMini.forEach((imagen) => {
                    imagen.style.border = '0';
                });
                img.style.border = '2px solid #333333';
                
                // Encuentra la imagen grande correspondiente
                let imagenGrandeEncontrada = Array.from(imagenesGrandes).find(imagenG => imagenG.src === img.src);
                
                if (imagenGrandeEncontrada) {
                    // Calcula la posición horizontal para desplazar
                    const offsetLeft = imagenGrandeEncontrada.offsetLeft;
                    
                    // Desplazar el contenedor horizontalmente
                    contenedorScroll.scrollTo({
                        left: offsetLeft,
                        behavior: 'smooth'
                    });
                }
            });
        });
        
        
    })


</script>

<template>
    <section class="sectionDetailProduct">
        <div class="contenedorDetalleProducto">
            <div class="contenedorImagenesMini">
                <img src="/img/buzosMuestra.jpg" alt="" style="border: 2px solid #333333;;">
                <img src="/img/camisetaMuestra.jpg" alt="">
            </div>
            <div class="sectionSlide" id="sectionSlideDetail">
                <div class="botonesSlide">
                    <i class="fa-solid fa-chevron-left scrollIzquierdaDetalle"></i>
                    <i class="fa-solid fa-chevron-right scrollDerechaDetalle"></i>
                </div>
                <div class="contenedorImagenesDetalle">
                    <div class="vitrinaSlide">
                        <img src="/img/buzosMuestra.jpg" alt="">
                        <img src="/img/camisetaMuestra.jpg" alt="">
                        
                    </div>
                    
                </div>
            </div>
            <div class="contenedorInfoDetalleProd">
                <h3>NOMBRE DEL PRODUCTO MAYUSCULA</h3>
                <div class="precioDetalleProd">
                    <p class="preDetText">Precio</p>
                    <p class="preDet">$69.000</p>
                </div>
                <div class="precioDetalleProd">
                    <p class="preDetText">Color</p>
                    <div class="contColorDet">
                        <div class="cuadroColor"></div>
                        <div class="cuadroColor"></div>
                        <div class="cuadroColor"></div>
                    </div>
                </div>
                <div class="precioDetalleProd">
                    <p class="preDetText">Talla</p>
                    <div class="contColorDet">
                        <div class="cuadroColor cuadroTalla">XS</div>
                        <div class="cuadroColor cuadroTalla">S</div>
                        <div class="cuadroColor cuadroTalla">M</div>
                        <div class="cuadroColor cuadroTalla">L</div>
                        <div class="cuadroColor cuadroTalla">XL</div>
                        <div class="cuadroColor cuadroTalla">XXL</div>
                    </div>
                </div>
                <div class="precioDetalleProd">
                    <div class="contColorDet">
                        <div class="flechasCantidad">
                            <i class="fa-solid fa-chevron-up"></i>
                            <i class="fa-solid fa-chevron-down"></i>
                        </div>
                        <div class="cuadroColor cuadroCantidad">1</div>
                        <button class="btnAddToCartDetail">AGREGAR A LA BOLSA</button>
                    </div>
                </div>
                <div class="precioDetalleProd addFavDet">
                    <div class="contColorDet">
                        <p class="addFavText"><img src="/img/heartIcon.png" alt=""> AGREGAR A MIS FAVORITOS</p>
                    </div>
                </div>
                <div class="precioDetalleProd">
                    <p class="preDetText addFavText"><i class="fa-regular fa-file-lines"></i>Descripcion</p>
                    <div class="contColorDet">
                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea similique minima voluptas</p>
                    </div>
                </div>
                <div class="precioDetalleProd">
                    <p class="preDetText addFavText"><i class="fa-solid fa-truck-fast"></i>Envíos a todo Colombia</p>
                    <div class="contColorDet" style="flex-direction: column !important;">
                        <p>- Ciudades principales de 1 a 4 días hábiles.</p>
                        <p>- Resto del país de 3 a 8 días hábiles.</p>
                    </div>
                </div>

            </div>
            
        </div>
    </section>

    <Nuevo></Nuevo>
</template>



