

<script setup>
    import { reactive, ref, onMounted, computed } from 'vue'
    import { RouterLink, useRouter } from 'vue-router'
    import { validateForm } from '@/js/composables/useValidateForm.js'
    import { useOrder } from '@/js/composables/useOrder.js'
    import { useCart } from '@/js/composables/useCart.js'
    import { useUserStore } from '@/js/stores/userLogged.js'
    import mostrarNotificacion from '@/js/mensajeNotificacionFront.js'

    // Composables
    const { createOrder, loading: orderLoading } = useOrder()
    const { cartItems, cartTotal, loadCart } = useCart()
    const userStore = useUserStore()
    const router = useRouter()

    // Estado del formulario
    const checkoutForm = reactive({
        // Contacto
        email: '',
        newsletter: false,
        
        // Información de envío
        country: 'Colombia',
        firstName: '',
        lastName: '',
        document: '',
        address: '',
        addressDetails: '',
        city: '',
        department: '',
        postalCode: '',
        phone: '',
        saveInfo: false,
        
        // Información de facturación (formulario alternativo)
        billing: {
            country: 'Colombia',
            firstName: '',
            lastName: '',
            document: '',
            address: '',
            addressDetails: '',
            city: '',
            department: '',
            postalCode: '',
            phone: '',
            saveInfo: false
        },
        
        // Opciones seleccionadas
        deliveryMethod: 'envio',
        paymentMethod: 'pse',
        billingAddress: 'same' // 'same' o 'different'
    })

    const errors = ref({})
    const showBillingForm = ref(false)

    // Estados adicionales
    const isAuthenticated = computed(() => userStore.isLoggedIn)
    const isCartEmpty = computed(() => cartItems.value?.length === 0)

    // Computed para verificar si se puede proceder con el checkout
    const canProceedToCheckout = computed(() => {
        return isAuthenticated.value && !isCartEmpty.value
    })

    // Reglas de validación
    const validationRules = {
        email: { 
            required: true, 
            email: true 
        },
        firstName: { 
            required: true, 
            minLength: 2,
            maxLength: 50
        },
        lastName: { 
            required: true, 
            minLength: 2,
            maxLength: 50
        },
        document: { 
            required: true, 
            numeric: true,
            minLength: 7
        },
        address: { 
            required: true, 
            minLength: 5
        },
        city: { 
            required: true, 
            minLength: 2
        },
        department: { 
            required: true, 
            minLength: 2
        },
        phone: { 
            required: true, 
            minLength: 10
        }
    }

    // Reglas para dirección de facturación diferente
    const billingValidationRules = {
        'billing.firstName': { 
            required: true, 
            minLength: 2,
            maxLength: 50
        },
        'billing.lastName': { 
            required: true, 
            minLength: 2,
            maxLength: 50
        },
        'billing.document': { 
            required: true, 
            numeric: true,
            minLength: 7
        },
        'billing.address': { 
            required: true, 
            minLength: 5
        },
        'billing.city': { 
            required: true, 
            minLength: 2
        },
        'billing.department': { 
            required: true, 
            minLength: 2
        },
        'billing.phone': { 
            required: true, 
            minLength: 10
        }
    }

    const validateFormData = () => {
        let currentRules = { ...validationRules }
        
        // Si se usa dirección de facturación diferente, agregar esas validaciones
        if (checkoutForm.billingAddress === 'different') {
            currentRules = { ...currentRules, ...billingValidationRules }
        }
        
        errors.value = validateForm(checkoutForm, currentRules)
        return Object.keys(errors.value).length === 0
    }

    const handleBillingAddressChange = (value) => {
        checkoutForm.billingAddress = value
        showBillingForm.value = value === 'different'
        
        // Limpiar errores de facturación si se cambia a "misma dirección"
        if (value === 'same') {
            Object.keys(errors.value).forEach(key => {
                if (key.startsWith('billing.')) {
                    delete errors.value[key]
                }
            })
        }
    }

    const handleSubmit = async () => {
        // Verificar autenticación y carrito
        if (!canProceedToCheckout.value) {
            if (!isAuthenticated.value) {
                mostrarNotificacion('Debes iniciar sesión para proceder con la compra', 0)
                router.push('/login')
                return
            }
            if (isCartEmpty.value) {
                mostrarNotificacion('Tu carrito está vacío', 0)
                router.push('/cart')
                return
            }
        }

        // Validar formulario
        if (!validateFormData()) {
            mostrarNotificacion('Por favor corrige los errores en el formulario', 0)
            return
        }

        try {
            console.log('🛒 [CHECKOUT] Procesando checkout...', checkoutForm)

            const orderData = {
                // Contacto
                email: checkoutForm.email,
                newsletter: checkoutForm.newsletter,
                
                // Información de envío
                country: checkoutForm.country,
                firstName: checkoutForm.firstName,
                lastName: checkoutForm.lastName,
                document: checkoutForm.document,
                address: checkoutForm.address,
                addressDetails: checkoutForm.addressDetails,
                city: checkoutForm.city,
                department: checkoutForm.department,
                postalCode: checkoutForm.postalCode,
                phone: checkoutForm.phone,
                
                // Información de facturación
                billing: checkoutForm.billingAddress === 'different' ? checkoutForm.billing : null,
                
                // Opciones
                deliveryMethod: checkoutForm.deliveryMethod,
                paymentMethod: checkoutForm.paymentMethod,
                billingAddress: checkoutForm.billingAddress
            }

            const result = await createOrder(orderData)

            if (result.success) {
                mostrarNotificacion('¡Orden creada exitosamente!', 1)
                console.log('🛒 [CHECKOUT] Orden creada:', result.data)
                
                // Redireccionar a página de confirmación o pedidos
                // router.push(`/orders/${result.data.order.id}`)
                router.push('/orders')
            } else {
                console.error('🛒 [CHECKOUT] Error creando orden:', result)
                
                // Mostrar errores específicos del backend
                if (result.errors && Array.isArray(result.errors)) {
                    result.errors.forEach(error => {
                        mostrarNotificacion(error.msg || error.message, 0)
                    })
                } else {
                    mostrarNotificacion(result.message || 'Error al procesar la orden', 0)
                }
            }
        } catch (error) {
            console.error('🛒 [CHECKOUT] Error procesando checkout:', error)
            mostrarNotificacion('Error de conexión al procesar la orden', 0)
        }
    }

    onMounted(async () => {
        // Cargar datos del usuario y carrito
        await userStore.loadUserFromStorage()
        
        if (isAuthenticated.value) {
            await loadCart()
            
            // Pre-llenar email si el usuario está autenticado
            if (userStore.user?.email) {
                checkoutForm.email = userStore.user.email
            }
        }

        // Configurar visibilidad del formulario de facturación
        function visibilityOtherAddressForm() {
            const hiddenBlock = document.querySelector('.contFormHidden');
            if (hiddenBlock) {
                hiddenBlock.classList.toggle('visibleForm');
                hiddenBlock.classList.toggle('hiddenForm');
            }
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
                    <input class="inputCheckout" type="email" v-model="checkoutForm.email" placeholder="Correo Electronico" @blur="validateFormData">
                    <div class="error" v-if="errors.email">
                        <p>{{ errors.email }}</p>
                    </div>
                    <div class="checkCO">
                        <input type="checkbox" v-model="checkoutForm.newsletter" id="newsletter" name="newsletter">
                        <label for="newsletter"></label>
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
                    
                    <select class="inputCheckout" v-model="checkoutForm.country">
                        <option value="Colombia">Colombia</option>
                    </select>
                    <div class="contRowFormCheckout">
                        <div>
                            <input class="inputCheckout" type="text" v-model="checkoutForm.firstName" placeholder="Nombre" @blur="validateFormData">
                            <div class="error" v-if="errors.firstName">
                                <p>{{ errors.firstName }}</p>
                            </div>
                        </div>
                        <div>
                            <input class="inputCheckout" type="text" v-model="checkoutForm.lastName" placeholder="Apellidos" @blur="validateFormData">
                            <div class="error" v-if="errors.lastName">
                                <p>{{ errors.lastName }}</p>
                            </div>
                        </div>
                    </div>
                    
                    <input class="inputCheckout" type="text" v-model="checkoutForm.document" placeholder="No. Documento" @blur="validateFormData">
                    <div class="error" v-if="errors.document">
                        <p>{{ errors.document }}</p>
                    </div>
                    <input class="inputCheckout" type="text" v-model="checkoutForm.address" placeholder="Direccion" @blur="validateFormData">
                    <div class="error" v-if="errors.address">
                        <p>{{ errors.address }}</p>
                    </div>
                    <input class="inputCheckout" type="text" v-model="checkoutForm.addressDetails" placeholder="Casa, Apartamento, Local, Barrio, etc...">
                    <div class="contRowFormCheckout">
                        <div>
                            <input class="inputCheckout" type="text" v-model="checkoutForm.city" placeholder="Municipio o Ciudad" @blur="validateFormData">
                            <div class="error" v-if="errors.city">
                                <p>{{ errors.city }}</p>
                            </div>
                        </div>
                        <div>
                            <input class="inputCheckout" type="text" v-model="checkoutForm.department" placeholder="Departamento" @blur="validateFormData">
                            <div class="error" v-if="errors.department">
                                <p>{{ errors.department }}</p>
                            </div>
                        </div>
                        <div>
                            <input class="inputCheckout" type="text" v-model="checkoutForm.postalCode" placeholder="Codigo postal (opcional)">
                        </div>
                    </div>
                    
                    <input class="inputCheckout" type="text" v-model="checkoutForm.phone" placeholder="Teléfono" @blur="validateFormData">
                    <div class="error" v-if="errors.phone">
                        <p>{{ errors.phone }}</p>
                    </div>
                    <div class="checkCO">
                        <input type="checkbox" v-model="checkoutForm.saveInfo" id="saveInfo" name="saveInfo">
                        <label for="saveInfo"></label>
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
                            <input type="radio" :checked="checkoutForm.billingAddress === 'same'" 
                                   @change="handleBillingAddressChange('same')" 
                                   id="radio1Dir" name="radio-dir" value="same">
                            <label for="radio1Dir"></label>
                            <p>La misma dirección de envío</p>
                        </div>
                       
                    </div>
                    <div class="buttonCO optMismaDireccion">
                        <div class="blockIntoButton">
                            <input type="radio" :checked="checkoutForm.billingAddress === 'different'" 
                                   @change="handleBillingAddressChange('different')" 
                                   id="radio2Dir" name="radio-dir" value="different">
                            <label for="radio2Dir"></label>
                            <p>Usar una dirección de facturación distinta</p>
                        </div>
                        
                    </div>
                    <div class="contFormHidden hiddenForm">
                        
                        <div class="blockCheckout formOtherAddress">
                        
                            <select class="inputCheckout" v-model="checkoutForm.billing.country">
                                <option value="Colombia">Colombia</option>
                            </select>
                            <div class="contRowFormCheckout">
                                <div>
                                    <input class="inputCheckout" type="text" v-model="checkoutForm.billing.firstName" placeholder="Nombre" @blur="validateFormData">
                                    <div class="error" v-if="errors['billing.firstName']">
                                        <p>{{ errors['billing.firstName'] }}</p>
                                    </div>
                                </div>
                                <div>
                                    <input class="inputCheckout" type="text" v-model="checkoutForm.billing.lastName" placeholder="Apellidos" @blur="validateFormData">
                                    <div class="error" v-if="errors['billing.lastName']">
                                        <p>{{ errors['billing.lastName'] }}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <input class="inputCheckout" type="text" v-model="checkoutForm.billing.document" placeholder="No. Documento" @blur="validateFormData">
                            <div class="error" v-if="errors['billing.document']">
                                <p>{{ errors['billing.document'] }}</p>
                            </div>
                            <input class="inputCheckout" type="text" v-model="checkoutForm.billing.address" placeholder="Direccion" @blur="validateFormData">
                            <div class="error" v-if="errors['billing.address']">
                                <p>{{ errors['billing.address'] }}</p>
                            </div>
                            <input class="inputCheckout" type="text" v-model="checkoutForm.billing.addressDetails" placeholder="Casa, Apartamento, Local, Barrio, etc...">
                            <div class="contRowFormCheckout">
                                <div>
                                    <input class="inputCheckout" type="text" v-model="checkoutForm.billing.city" placeholder="Municipio o Ciudad" @blur="validateFormData">
                                    <div class="error" v-if="errors['billing.city']">
                                        <p>{{ errors['billing.city'] }}</p>
                                    </div>
                                </div>
                                <div>
                                    <input class="inputCheckout" type="text" v-model="checkoutForm.billing.department" placeholder="Departamento" @blur="validateFormData">
                                    <div class="error" v-if="errors['billing.department']">
                                        <p>{{ errors['billing.department'] }}</p>
                                    </div>
                                </div>
                                <div>
                                    <input class="inputCheckout" type="text" v-model="checkoutForm.billing.postalCode" placeholder="Codigo postal (opcional)">
                                </div>
                            </div>
                           
                            <input class="inputCheckout" type="text" v-model="checkoutForm.billing.phone" placeholder="Teléfono" @blur="validateFormData">
                            <div class="error" v-if="errors['billing.phone']">
                                <p>{{ errors['billing.phone'] }}</p>
                            </div>
                            <div class="checkCO">
                                <input type="checkbox" v-model="checkoutForm.billing.saveInfo" id="saveBillingInfo" name="saveBillingInfo">
                                <label for="saveBillingInfo"></label>
                                <p>Guardar mi información y consultar más rápidamente la próxima vez</p>
                            </div>
                        </div>
                    </div>
                    
                    
                </div>
                <div class="blockCheckout">
                    <div class="error" v-if="errors.general">
                        <p>{{ errors.general }}</p>
                    </div>
                    <button
                        class="btnCheckout"
                        @click="handleSubmit"
                        :disabled="orderLoading || !canProceedToCheckout"
                    >
                        <span v-if="orderLoading">
                            <i class="fas fa-spinner fa-spin"></i>
                            PROCESANDO...
                        </span>
                        <span v-else-if="!isAuthenticated">
                            INICIA SESIÓN PARA CONTINUAR
                        </span>
                        <span v-else-if="isCartEmpty">
                            CARRITO VACÍO
                        </span>
                        <span v-else>
                            FINALIZAR COMPRA
                        </span>
                    </button>
                </div>

            </div>
        </div>
        
    </section>
</template>
