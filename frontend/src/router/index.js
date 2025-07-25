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
      path: '/category/new',
      name: 'NewProducts',
      component: () => import('../views/CategoryDetail.vue'),
      props: { id: 'new' } // Pasar 'new' como prop especial
    },
    {
      path: '/category/discount',
      name: 'DiscountProducts', 
      component: () => import('../views/CategoryDetail.vue'),
      props: { id: 'discount' } // Pasar 'discount' como prop especial
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
  // Solo aplicar guards si la ruta requiere autenticación o es admin
  if (to.meta.requiresAuth || to.meta.requiresAdmin) {
    // Verificar localStorage directamente sin usar el store fuera del contexto
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData || userData === 'undefined' || userData === 'null') {
      if (to.meta.requiresAuth) {
        return { name: 'Login' };
      }
    }
    
    try {
      const user = JSON.parse(userData);
      
      if (to.meta.requiresAdmin && user?.role !== 'admin') {
        return { name: 'Home' };
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      if (to.meta.requiresAuth) {
        return { name: 'Login' };
      }
    }
  }
  
  return true;
});

// Guardia global afterEach para ejecutar scrollToTop en cada cambio de ruta
router.afterEach(() => {
  scrollToTop();
});

export default router
