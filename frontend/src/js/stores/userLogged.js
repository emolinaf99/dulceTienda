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
                    this.clearUser();
                }
            } catch (err) {
                console.error('Error al verificar autenticación:', err);
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
        }
    },
});