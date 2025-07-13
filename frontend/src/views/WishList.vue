<script setup>
    import {reactive, ref, onMounted} from 'vue'
    import { RouterLink, RouterView } from 'vue-router'

</script>

<template>
    <section class="contenedorGeneralDeseos">
        <div class="contenedorDeseos">
            <h1>Mi lista de deseos</h1>
            <p>Para guardar tus favoritos por favor <RouterLink to="/login" class="subrayText">inicia sesión</RouterLink> o <RouterLink to="/register" class="subrayText">crea una cuenta</RouterLink></p>
        
            <div class="contenedorDeProductosLista">
                <div class="cajaProductoDeseo">
                    <i class="fa-solid fa-xmark equisProductList"></i>
                    <img src="/img/camisetaMuestra.jpg" alt="">
                    <div class="bloqueInformacionProductoLista">
                        <div class="productInfo">
                            <p class="nameProduct">Camiseta Michael Kors Bolas</p>
                            <p class="priceProduct">$40.000</p>

                        </div>
                        <select class="selectPresentation" name="" id="">
                            <option value="">XS</option>
                            <option value="">S</option>
                            <option value="">M</option>
                            <option value="">L</option>
                            <option value="">XL</option>
                            <option value="">XXL</option>
                        </select>
                        <button class="btnAddToCartList">Agregar al carrito</button>
                    </div>
                </div>
                <div class="cajaProductoDeseo">
                    <i class="fa-solid fa-xmark equisProductList"></i>
                    <img src="/img/camisetaMuestra.jpg" alt="">
                    <div class="bloqueInformacionProductoLista">
                        <div class="productInfo">
                            <p class="nameProduct">Camiseta Michael Kors Bolas</p>
                            <p class="priceProduct">$40.000</p>

                        </div>
                        <select class="selectPresentation" name="" id="">
                            <option value="">XS</option>
                            <option value="">S</option>
                            <option value="">M</option>
                            <option value="">L</option>
                            <option value="">XL</option>
                            <option value="">XXL</option>
                        </select>
                        <button class="btnAddToCartList">Agregar al carrito</button>
                    </div>
                </div>
                <div class="cajaProductoDeseo">
                    <i class="fa-solid fa-xmark equisProductList"></i>
                    <img src="/img/camisetaMuestra.jpg" alt="">
                    <div class="bloqueInformacionProductoLista">
                        <div class="productInfo">
                            <p class="nameProduct">Camiseta Michael Kors Bolas</p>
                            <p class="priceProduct">$40.000</p>

                        </div>
                        <select class="selectPresentation" name="" id="">
                            <option value="">XS</option>
                            <option value="">S</option>
                            <option value="">M</option>
                            <option value="">L</option>
                            <option value="">XL</option>
                            <option value="">XXL</option>
                        </select>
                        <button class="btnAddToCartList">Agregar al carrito</button>
                    </div>
                </div>
                <div class="cajaProductoDeseo">
                    <i class="fa-solid fa-xmark equisProductList"></i>
                    <img src="/img/camisetaMuestra.jpg" alt="">
                    <div class="bloqueInformacionProductoLista">
                        <div class="productInfo">
                            <p class="nameProduct">Camiseta Michael Kors Bolas</p>
                            <p class="priceProduct">$40.000</p>

                        </div>
                        <select class="selectPresentation" name="" id="">
                            <option value="">XS</option>
                            <option value="">S</option>
                            <option value="">M</option>
                            <option value="">L</option>
                            <option value="">XL</option>
                            <option value="">XXL</option>
                        </select>
                        <button class="btnAddToCartList">Agregar al carrito</button>
                    </div>
                </div>
                <div class="cajaProductoDeseo">
                    <i class="fa-solid fa-xmark equisProductList"></i>
                    <RouterLink to="/"><img src="/img/camisetaMuestra.jpg" alt=""></RouterLink>
                    <div class="bloqueInformacionProductoLista">
                        <RouterLink to="/" class="productInfo">
                            <p class="nameProduct">Camiseta Michael Kors Bolas</p>
                            <p class="priceProduct">$40.000</p>

                        </RouterLink>
                        <select class="selectPresentation" name="" id="">
                            <option value="">XS</option>
                            <option value="">S</option>
                            <option value="">M</option>
                            <option value="">L</option>
                            <option value="">XL</option>
                            <option value="">XXL</option>
                        </select>
                        <button class="btnAddToCartList">Agregar al carrito</button>
                    </div>
                </div>
            </div>
        </div>
        
    </section>
</template>



