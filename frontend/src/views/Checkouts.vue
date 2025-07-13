

<script setup>
    import {reactive,ref,onMounted, watch} from 'vue'

    onMounted(() => {

        function visibilityOtherAddressForm() {
            
            const hiddenBlock = document.querySelector('.contFormHidden');
            hiddenBlock.classList.toggle('visibleForm');
            hiddenBlock.classList.toggle('hiddenForm');
        
        }

        let radioDireccionFacturacion = document.getElementsByName('radio-dir')

        radioDireccionFacturacion.forEach(radio => {
            radio.addEventListener('change',() => {
                visibilityOtherAddressForm()
            })
        })

        
    })
</script>

<template>
    <section class="contenedorTotalCheckout">
        <div class="contenedorCheckout">
            <div class="infoContCheckout">
                <div class="blockCheckout">
                    <label class="labelCheckout" for="">Contacto</label>
                    <input class="inputCheckout" type="email" name="" placeholder="Correo Electronico">
                    <div class="checkCO"><input type="checkbox" name="">
                        <input type="checkbox" id="checkbox1" name="checkbox-group">
                        <label for="checkbox1"></label>
                        <p>Enviarme novedades y ofertas por correo electrónico</p>
                    </div>
                    <RouterLink to="/login">Iniciar sesión</RouterLink>
                </div>
                <div class="blockCheckout" style="gap: 0;">
                    <label class="labelCheckout" for="" style="margin-bottom: 0.3rem;">Entrega</label>
                    <div class="buttonCO selectedOption" >
                        <div class="blockIntoButton">
                            <input type="radio" checked id="radio1" name="radio-group">
                            <label for="radio1"></label>
                            <p>Envío a tu dirección</p>
                        </div>
                        <i class="fa-solid fa-truck-fast"></i>
                    </div>
                    
                    
                </div>
                <div class="blockCheckout">
                    
                    <select class="inputCheckout" name="">
                        <option value="">Colombia</option>
                    </select>
                    <div class="contRowFormCheckout">
                        <input class="inputCheckout" type="text" name="" placeholder="Nombre">
                        <input class="inputCheckout" type="text" name="" placeholder="Apellidos">
                    </div>
                    
                    <input class="inputCheckout" type="number" name="" placeholder="No. Documento">
                    <input class="inputCheckout" type="text" name="" placeholder="Direccion">
                    <input class="inputCheckout" type="text" name="" placeholder="Casa, Apartamento, Local, Barrio, etc...">
                    <div class="contRowFormCheckout">
                        <input class="inputCheckout " type="text" name="" placeholder="Municipio o Ciudad">
                        <input class="inputCheckout " type="text" name="" placeholder="Departamento">
                        <input class="inputCheckout " type="text" name="" placeholder="Codigo postal (opcional)"> 
                    </div>
                    
                    <input class="inputCheckout" type="text" name="" placeholder="Teléfono">
                    <div class="checkCO"><input type="checkbox" name="">
                        <input type="checkbox" id="checkbox1" name="checkbox-group">
                        <label for="checkbox1"></label>
                        <p>Guardar mi información y consultar más rápidamente la próxima vez</p>
                    </div>
                </div>
                <div class="blockCheckout" style="gap: 0;">
                    <label class="labelCheckout" for="" style="margin-bottom: 0.3rem;">Pago</label>
                    <p class="pPago">Todas las transaciones son seguras y están encriptadas</p>
                    <div class="buttonCO selectedOption">
                        <div class="blockIntoButton">
                            <input type="radio" checked id="radiopay1" name="pay">
                            <label for="radiopay1"></label>
                            <p>Paga a Crédito o Débito con PSE</p>
                        </div>
                        <div class="blockIntoButton">
                            <img src="/img/pseLogo.png" alt="">
                        </div>
                        
                    </div>
                    <div class="buttonCO" style="border-top: 0;">
                        <div class="blockIntoButton">
                            <input type="radio" id="radiopay2" name="pay">
                            <label for="radiopay2"></label>
                            <p>Mercado Pago</p>
                        </div>
                        <div class="blockIntoButton">
                            <img src="/img/mercadoPagoLogo.png" alt="">
                        </div>
                    </div>
                    
                    <div class="buttonCO" style="border-top: 0;">
                        <div class="blockIntoButton">
                            <input type="radio" id="radiopay4" name="pay">
                            <label for="radiopay4"></label>
                            <p>Pago a Crédito, Nequi o Daviplata con Wompi</p>
                        </div>
                        <div class="blockIntoButton">
                            <img src="/img/wompiLogo.png" alt="">
                        </div>
                    </div>
                </div>
                <div class="blockCheckout" style="gap: 0;">
                    <label class="labelCheckout" for="" style="margin-bottom: 0.3rem;">Entrega</label>
                    <div class="buttonCO selectedOption" >
                        <div class="blockIntoButton">
                            <input type="radio" checked id="radio1Dir" name="radio-dir">
                            <label for="radio1Dir"></label>
                            <p>La misma dirección de envío</p>
                        </div>
                       
                    </div>
                    <div class="buttonCO optMismaDireccion">
                        <div class="blockIntoButton">
                            <input type="radio" id="radio2Dir" name="radio-dir">
                            <label for="radio2Dir"></label>
                            <p>Usar una dirección de facturación distinta</p>
                        </div>
                        
                    </div>
                    <div class="contFormHidden hiddenForm">
                        
                        <div class="blockCheckout formOtherAddress">
                        
                            <select class="inputCheckout " name="">
                                <option value="">Colombia</option>
                            </select>
                            <div class="contRowFormCheckout">
                                <input class="inputCheckout " type="text" name="" placeholder="Nombre">
                            <input class="inputCheckout " type="text" name="" placeholder="Apellidos">
                            </div>
                            
                            <input class="inputCheckout " type="number" name="" placeholder="No. Documento">
                            <input class="inputCheckout " type="text" name="" placeholder="Direccion">
                            <input class="inputCheckout " type="text" name="" placeholder="Casa, Apartamento, Local, Barrio, etc...">
                            <div class="contRowFormCheckout">
                                <input class="inputCheckout " type="text" name="" placeholder="Municipio o Ciudad">
                                <input class="inputCheckout " type="text" name="" placeholder="Departamento">
                                <input class="inputCheckout " type="text" name="" placeholder="Codigo postal (opcional)"> 
                            </div>
                           
                            <input class="inputCheckout " type="text" name="" placeholder="Teléfono">
                            <div class="checkCO "><input type="checkbox" name="">
                                <input type="checkbox" id="checkbox1" name="checkbox-group">
                                <label for="checkbox1"></label>
                                <p>Guardar mi información y consultar más rápidamente la próxima vez</p>
                            </div>
                        </div>
                    </div>
                    
                    
                </div>
                <div class="blockCheckout">
                    
                    
                </div>

            </div>
        </div>
        
    </section>
</template>
