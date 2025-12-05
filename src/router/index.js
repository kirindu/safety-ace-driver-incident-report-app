//Importaciones del Sistema
import { createRouter, createWebHistory } from 'vue-router'
// import UserAPI from '@/api/UserAPI';

//Importaciones del los Layouts
import DefaultAdminLayout from '@/layouts/DefaultAdminLayout.vue'
import DefaultDriverLayout from '@/layouts/DefaultDriverLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  linkActiveClass: 'active',
  routes: [
    // Rutas Protegidas
{
  path: '/',
  name: 'general',
  component: DefaultDriverLayout,
  meta: { requiresAuth: true },
  children: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('../views/DashboardDriverView.vue'),
    },
  ]
},
    {
      path: '/admin',
      name: 'general-admin',
      component: DefaultAdminLayout,
      redirect: '/admin/dashboard',
      meta: {requiresAuth: true},
      children: [
        {
          path: 'dashboard',
          name: 'dashboard-admin',
          component: () => import('../views/DashboardAdminView.vue'),
        },
        {
          path: 'reports/:type?',
          name: 'admin-reports',
          component: () => import('../views/ReportView.vue'),
        },
        {
          path: 'driver',
          name: 'admin-drivers',
          component: () => import('../views/DriversView.vue'),
        },
        {
          path: 'user',
          name: 'admin-users',
          component: () => import('../views/UsersView.vue'),
        },
        {
          path: 'route',
          name: 'admin-routes',
          component: () => import('../views/RoutesView.vue'),
        },
        {
          path: 'trailer',
          name: 'admin-trailers',
          component: () => import('../views/TrailersView.vue'),
        },
        {
          path: 'truck',
          name: 'admin-trucks',
          component: () => import('../views/TrucksView.vue'),
        },


        {
          path: 'designer',
          name: 'admin-reports-designer',
          component: () => import('../views/ReportDesignerView.vue'),
        },
      ]
    },

    // Rutas no protegidas
    {
      path: '/auth',
      name: 'auth',
      component: AuthLayout,
      redirect: '/auth/login',
      children: [
        {
          path: '/auth/login',
          name: 'login',
          component: () => import('../auth/views/LoginView.vue'),
        },
        {
          path: '/auth/register',
          name: 'register',
          component: () => import('../auth/views/RegisterView.vue'),
        },
      
      ]
    },
    {path: '/:pathMatch(.*)*', component: () => import('../views/NoFoundView.vue')},
  ]

})


router.beforeEach((to, from, next) => {
  const userRaw = localStorage.getItem('USER');
  const requiresAuth = to.matched.some(route => route.meta.requiresAuth);

  // Si la ruta requiere autenticación y no hay usuario, redirigir al login
  if (requiresAuth && !userRaw) {
    return next({ name: 'login' });
  }

  // Si hay un usuario autenticado, parsearlo y verificar el rol
  if (userRaw) {
    let user;
    try {
      user = JSON.parse(userRaw);
    } catch (e) {
      localStorage.removeItem('USER');
      return next({ name: 'login' });
    }

    let role = '';
    if (user?.data?.rol) {
      role = user.data.rol;
    } else if (user?.data?.user?.rol) {
      role = user.data.user.rol;
    } else {
      console.warn('No se encontró un rol válido en el objeto USER');
      localStorage.removeItem('USER');
      return next({ name: 'login' });
    }

    // Evitar que un usuario autenticado acceda a rutas de autenticación
    if (to.name === 'login' || to.name === 'register') {
      if (role === 'Admin') {
        return next({ name: 'dashboard-admin' });
      } else if (role === 'Driver') {
        return next({ name: 'dashboard' });
      }
    }

    // Redirección inteligente solo si el usuario está yendo a la ruta 'general'
    if (requiresAuth && to.name === 'general') {
      if (role === 'Admin') {
        return next({ name: 'dashboard-admin' });
      } else if (role === 'Driver') {
        return next({ name: 'dashboard' });
      }
    }
  }

  // Si no hay conflictos, continuar con la navegación
  return next();
});



// router.beforeEach(async (to, from, next) => { // En cada cambio de paginas que requieren autencicaion , checara el user sino, lo manda al login

//   const requiresAuth = to.matched.some(url => url.meta.requiresAuth);

//   if(requiresAuth) { 

//     try {

//       const {data} = await UserAPI.auth();
//       next();

//      // console.log(data);
      
//     } catch (error) {

//       next({name: 'login'});

//       console.log(error.response.data.msg);
      
//     }

//   } else {
//     next();

//   }

// })

export default router