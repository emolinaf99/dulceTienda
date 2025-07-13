

<script setup>
    import InfoAdicional from '../components/InfoAdicional.vue'
</script>

<template>
    <section class="sectionBolsaDeCompras">
        <div class="contenedorBolsaDeCompras">
            <h4>BOLSA DE COMPRAS</h4>
            <div class="sectionProdsCart">
                <div class="productBoxCart" id="encabezadoCart">
                    <img src="" alt="">
                    <div class="infoProdCartBlock">
                        <p class="nameProdCart">Producto</p>
                        <div class="infoProdCart">
                            <div class="cantidadProductosBlock" id="cantProdColumn">
                                <p class="precioProdCart">Cantidad</p>
                            </div>
                            <p class="precioProdCart precioProd">Precio</p>
                            <p class="precioProdCart totalProd">Total</p>
                            <div class="equisProdCart" style="width: 20px;"></div>
                            
                        </div>
                    </div>
                </div>
            </div>
            <div class="sectionProdsCart" id="cajaDeProductos">
                

                <!-- Por cada producto aqui -->
                <div class="productBoxCart">
                    <img src="/img/camisetaMuestra.jpg" alt="">
                    <div class="infoProdCartBlock">
                        <p class="nameProdCart">Nombre del producto ahorasi que si</p>
                        <div class="infoProdCart">
                            <div class="cantidadProductosBlock">
                                <div class="minusCant">
                                    <i class="fa-solid fa-minus"></i>
                                </div>
                                <input class="cantProd" readonly value="1">
                                <div class="plusCant">
                                    <i class="fa-solid fa-plus"></i>
                                </div>
                            </div>
                            <p class="precioProdCart precioProd">$45.000</p>
                            <p class="precioProdCart totalProd">$45.000</p>
                            <i class="fa-solid fa-xmark equisProdCart"></i>
                        </div>
                    </div>
                </div>
                <div class="productBoxCart">
                    <img src="/img/camisetaMuestra.jpg" alt="">
                    <div class="infoProdCartBlock">
                        <p class="nameProdCart">Nombre del producto ahorasi que si</p>
                        <div class="infoProdCart">
                            <div class="cantidadProductosBlock">
                                <div class="minusCant">
                                    <i class="fa-solid fa-minus"></i>
                                </div>
                                <input class="cantProd" readonly value="1">
                                <div class="plusCant">
                                    <i class="fa-solid fa-plus"></i>
                                </div>
                            </div>
                            <p class="precioProdCart precioProd">$45.000</p>
                            <p class="precioProdCart totalProd">$45.000</p>
                            <i class="fa-solid fa-xmark equisProdCart"></i>
                        </div>
                    </div>
                </div>
                <div class="productBoxCart">
                    <img src="/img/camisetaMuestra.jpg" alt="">
                    <div class="infoProdCartBlock">
                        <p class="nameProdCart">Nombre del producto ahorasi que si</p>
                        <div class="infoProdCart">
                            <div class="cantidadProductosBlock">
                                <div class="minusCant">
                                    <i class="fa-solid fa-minus"></i>
                                </div>
                                <input class="cantProd" readonly value="1">
                                <div class="plusCant">
                                    <i class="fa-solid fa-plus"></i>
                                </div>
                            </div>
                            <p class="precioProdCart precioProd">$45.000</p>
                            <p class="precioProdCart totalProd">$45.000</p>
                            <i class="fa-solid fa-xmark equisProdCart"></i>
                        </div>
                    </div>
                </div>
                <div class="productBoxCart">
                    <img src="/img/camisetaMuestra.jpg" alt="">
                    <div class="infoProdCartBlock">
                        <p class="nameProdCart">Nombre del producto ahorasi que si</p>
                        <div class="infoProdCart">
                            <div class="cantidadProductosBlock">
                                <div class="minusCant">
                                    <i class="fa-solid fa-minus"></i>
                                </div>
                                <input class="cantProd" readonly value="1">
                                <div class="plusCant">
                                    <i class="fa-solid fa-plus"></i>
                                </div>
                            </div>
                            <p class="precioProdCart precioProd">$45.000</p>
                            <p class="precioProdCart totalProd">$45.000</p>
                            <i class="fa-solid fa-xmark equisProdCart"></i>
                        </div>
                    </div>
                </div>
                <div class="productBoxCart">
                    <img src="/img/camisetaMuestra.jpg" alt="">
                    <div class="infoProdCartBlock">
                        <p class="nameProdCart">Nombre del producto ahorasi que si</p>
                        <div class="infoProdCart">
                            <div class="cantidadProductosBlock">
                                <div class="minusCant">
                                    <i class="fa-solid fa-minus"></i>
                                </div>
                                <input class="cantProd" readonly value="1">
                                <div class="plusCant">
                                    <i class="fa-solid fa-plus"></i>
                                </div>
                            </div>
                            <p class="precioProdCart precioProd">$45.000</p>
                            <p class="precioProdCart totalProd">$45.000</p>
                            <i class="fa-solid fa-xmark equisProdCart"></i>
                        </div>
                    </div>
                </div>
                
            </div>
            <div class="sectionProdsCart" id="subtotalSection">
                <div class="subtotalBlock">Subtotal $<span class="subtotal">45.000</span></div>
                <RouterLink class="btnComprar" to="/checkouts"><div>Comprar</div></RouterLink>
            </div>

        </div>
    </section>
    <InfoAdicional></InfoAdicional>
</template>

