import { defineStore } from 'pinia';
import { useApi } from '../composables/useFetch.js';

export const useUserStore = defineStore('userLogged', {
    state: () => ({
        userLogged: null,
        isAuthenticated: false,
    }),
    getters: {
        isLoggedIn: (state) => !!state.userLogged,
        getUserInfo: (state) => state.userLogged,
        getUserRole: (state) => state.userLogged?.role || null,
    },
    actions: {
        setUser(userInfo) {
            if (userInfo) {
                this.userLogged = userInfo;
                this.isAuthenticated = true;
                // Guardar también en localStorage para compatibilidad con router guard
                localStorage.setItem('user', JSON.stringify(userInfo));
                localStorage.setItem('authToken', 'cookie-based'); // Indicador de que hay sesión
            }
        },
        clearUser() {
            this.userLogged = null;
            this.isAuthenticated = false;
            // Limpiar localStorage
            localStorage.removeItem('user');
            localStorage.removeItem('authToken');
            // Las cookies se manejan automáticamente por el backend al hacer logout
        },
        async loadUserFromStorage() {
            // Verificar estado de autenticación con el backend usando cookies
            try {
                const { data, error } = await useApi('/api/auth/profile', 'GET');

                if (!error.value && data.value?.success && data.value?.data?.user) {
                    this.setUser(data.value.data.user); // Usar setUser para guardar también en localStorage
                } else {
                    // Usuario no autenticado - esto es normal, no es un error
                    this.clearUser();
                }
            } catch (err) {
                // Solo mostrar error si no es 401 (no autenticado)
                if (!err.message?.includes('401')) {
                    console.error('Error al verificar autenticación:', err);
                }
                this.clearUser();
            }
        },
        async logout() {
            try {
                // Llamar al endpoint de logout para limpiar cookies del servidor
                await useApi('/api/auth/logout', 'POST');
            } catch (error) {
                console.error('Error durante logout:', error);
            } finally {
                this.clearUser();
            }
        },
        async syncLocalStorageToBackend() {
            console.log('🔄 [SYNC] Iniciando sincronización de localStorage a backend...');

            try {
                const CART_STORAGE_KEY = 'guest_cart';
                const FAVORITES_STORAGE_KEY = 'guest_favorites';

                // 1. Sincronizar carrito
                const cartString = localStorage.getItem(CART_STORAGE_KEY);
                if (cartString) {
                    try {
                        const cartItems = JSON.parse(cartString);
                        console.log('🛒 [SYNC] Carrito encontrado en localStorage:', cartItems);

                        if (Array.isArray(cartItems) && cartItems.length > 0) {
                            // Enviar cada item del carrito al backend
                            for (const item of cartItems) {
                                try {
                                    const cartData = {
                                        product_id: item.product_id,
                                        quantity: item.quantity,
                                        size_id: item.size_id,
                                        color_id: item.color_id
                                    };

                                    const { data, error } = await useApi('/api/cart', 'POST', cartData);

                                    if (error.value) {
                                        console.error('❌ [SYNC] Error sincronizando item del carrito:', item, error.value);
                                    } else {
                                        console.log('✅ [SYNC] Item del carrito sincronizado:', item);
                                    }
                                } catch (err) {
                                    console.error('❌ [SYNC] Error al enviar item del carrito:', err);
                                }
                            }

                            // Limpiar carrito del localStorage
                            localStorage.removeItem(CART_STORAGE_KEY);
                            console.log('🗑️ [SYNC] Carrito eliminado del localStorage');
                        }
                    } catch (err) {
                        console.error('❌ [SYNC] Error parseando carrito del localStorage:', err);
                    }
                }

                // 2. Sincronizar favoritos
                const favoritesString = localStorage.getItem(FAVORITES_STORAGE_KEY);
                if (favoritesString) {
                    try {
                        const favoriteIds = JSON.parse(favoritesString);
                        console.log('❤️ [SYNC] Favoritos encontrados en localStorage:', favoriteIds);

                        if (Array.isArray(favoriteIds) && favoriteIds.length > 0) {
                            // Enviar cada favorito al backend
                            for (const productId of favoriteIds) {
                                try {
                                    const { data, error } = await useApi('/api/favorites', 'POST', { product_id: productId });

                                    if (error.value) {
                                        // Si el error es 409, el producto ya está en favoritos - esto es OK
                                        const errorObj = error.value;
                                        console.log('🔍 [DEBUG] Error object:', errorObj);
                                        console.log('🔍 [DEBUG] Error message:', errorObj?.message);
                                        console.log('🔍 [DEBUG] Error response:', errorObj?.response);

                                        const isConflict = errorObj?.response?.status === 409 ||
                                                         errorObj?.message?.includes('409') ||
                                                         (errorObj?.response?.data?.message === 'El producto ya está en favoritos');

                                        if (isConflict) {
                                            console.log('✅ [SYNC] Favorito ya existe en backend:', productId);
                                        } else {
                                            console.error('❌ [SYNC] Error sincronizando favorito:', productId, error.value);
                                        }
                                    } else {
                                        console.log('✅ [SYNC] Favorito sincronizado:', productId);
                                    }
                                } catch (err) {
                                    console.error('❌ [SYNC] Error al enviar favorito:', err);
                                }
                            }

                            // Limpiar favoritos del localStorage
                            localStorage.removeItem(FAVORITES_STORAGE_KEY);
                            console.log('🗑️ [SYNC] Favoritos eliminados del localStorage');
                        }
                    } catch (err) {
                        console.error('❌ [SYNC] Error parseando favoritos del localStorage:', err);
                    }
                }

                console.log('✅ [SYNC] Sincronización completada');
            } catch (error) {
                console.error('❌ [SYNC] Error general durante sincronización:', error);
            }
        }
    },
});