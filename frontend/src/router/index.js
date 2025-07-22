import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/js/stores/userLogged.js'
import HomeView from '../views/HomeView.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/Register.vue')
    },
    {
      path: '/wishlist',
      name: 'WishList',
      component: () => import('../views/WishList.vue')
    },
    {
      path: '/products/:id',
      name: 'ProductDetail',
      component: () => import('../views/ProductDetail.vue'),
      props: true // Pasar el parámetro 'id' como prop al componente
    },
    {
      path: '/cart',
      name: 'Cart',
      component: () => import('../views/Cart.vue')
    },
    {
      path: '/checkouts',
      name: 'Checkouts',
      component: () => import('../views/Checkouts.vue')
    },
    {
      path: '/category/:id',
      name: 'CategoryDetail',
      component: () => import('../views/CategoryDetail.vue'),
      props: true // Pasar el parámetro 'id' como prop al componente
    },
    {
      path: '/admin',
      name: 'AdminPanel',
      component: () => import('../views/AdminPanel.vue'),
      meta: {
        requiresAuth: true,
        requiresAdmin: true
      }
    },

  ]
})

// Función para desplazarse al inicio de la página
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}


// Guardia global beforeEach para autenticación y autorización
router.beforeEach((to) => {
  const userStore = useUserStore();
  
  // Cargar usuario del localStorage si no está cargado
  if (!userStore.isLoggedIn) {
    userStore.loadUserFromStorage();
  }
  
  // Verificar si la ruta requiere autenticación
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    return { name: 'Login' };
  }
  
  // Verificar si la ruta requiere rol de administrador
  if (to.meta.requiresAdmin && userStore.getUserRole !== 'admin') {
    return { name: 'Home' };
  }
  
  return true;
});

// Guardia global afterEach para ejecutar scrollToTop en cada cambio de ruta
router.afterEach(() => {
  scrollToTop();
});

export default router
