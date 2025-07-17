import { defineStore } from 'pinia';

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
        setUser(userInfo, token) {
            if (userInfo && token) {
                this.userLogged = userInfo;
                this.isAuthenticated = true;
                
                // Guardar en localStorage con validación
                try {
                    localStorage.setItem('authToken', token);
                    localStorage.setItem('user', JSON.stringify(userInfo));
                } catch (error) {
                    console.error('Error al guardar en localStorage:', error);
                }
            }
        },
        clearUser() {
            this.userLogged = null;
            this.isAuthenticated = false;
            
            // Limpiar localStorage
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
        },
        loadUserFromStorage() {
            const token = localStorage.getItem('authToken');
            const userData = localStorage.getItem('user');
            
            if (token && userData && userData !== 'undefined' && userData !== 'null') {
                try {
                    const parsedUser = JSON.parse(userData);
                    if (parsedUser && typeof parsedUser === 'object') {
                        this.userLogged = parsedUser;
                        this.isAuthenticated = true;
                    } else {
                        this.clearUser();
                    }
                } catch (error) {
                    console.error('Error al cargar datos del usuario:', error);
                    this.clearUser();
                }
            } else {
                this.clearUser();
            }
        },
        logout() {
            this.clearUser();
        },
        clearCorruptedData() {
            // Limpiar datos corruptos del localStorage
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            this.userLogged = null;
            this.isAuthenticated = false;
        }
    },
});