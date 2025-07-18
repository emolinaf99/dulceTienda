import { createRouter, createWebHistory } from 'vue-router'
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

  ]
})

// Función para desplazarse al inicio de la página
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}


// Guardia global afterEach para ejecutar scrollToTop en cada cambio de ruta
router.afterEach(() => {
  scrollToTop();
});

export default router
