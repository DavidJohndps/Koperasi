import Vue from "vue";
import VueRouter from "vue-router";
import store from "../store";
import Home from "../views/Home.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    icon: "mdi-view-dashboard",
    component: Home,
    meta: {
      requiresAuth: true,
      staffOnly: true
    },
  },
  {
    path: "/companyDetails",
    name: "Company Profile",
    icon: "mdi-office-building-cog-outline",
    component: () => import('../views/CompanyDetails.vue'),
    meta: {
      requiresAuth: true,
      staffOnly: true
    },
  },
  // {
  //   path: "/transactions",
  //   name: "Transactions",
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () =>
  //     import(/* webpackChunkName: "about" */ "../views/Transactions.vue"),
  //   meta: {
  //     requiresAuth: true,
  //   },
  // },
  {
    path: "/activities",
    name: "Activities",
    icon: 'mdi-calendar-clock',
    component: () => import('../views/Activities.vue'),
    meta: {
      requiresAuth: true,
      staffOnly: true
    },
  },
  {
    path: "/transactions",
    name: "Transactions",
    icon: 'mdi-clipboard-text-clock',
    component: () => import("../views/Transactions.vue"),
    meta: {
      requiresAuth: true,
      staffOnly: true
    },
  },
  {
    path: "/products",
    name: "Products",
    icon: "mdi-inbox-multiple",
    component: () => import("../views/Products.vue"),
    meta: {
      requiresAuth: true,
      staffOnly: true
    },
  },
  {
    path: "/cashier",
    name: "Cashier",
    icon: 'mdi-cash-register',
    component: () => import("../views/Cashier.vue"),
    meta: {
      requiresAuth: true,
      staffOnly: true
    },
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/Login.vue"),
    meta: {
      requiresAuth: false,
    },
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

router.beforeResolve((to, from, next) => {
  const credential = store.getters.getCredentials;
  const isAuthenticated = !!credential.id;
  const isStaff = credential.position == 'ADMIN' || credential.position == 'Staff' ? true : false;
  store.commit("updateRoute", to.name);
  if (to.meta.requiresAuth && !isAuthenticated) next("Login");
  if (to.meta.requiresAuth && to.meta.staffOnly && !isStaff) next("Login")
  else next();
  //   return {
  //     name: "Login",
  //     query: {
  //       redirectTo: to.fullPath,
  //     },
  //   };
});
export default router;
