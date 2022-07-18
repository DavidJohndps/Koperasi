<template>
  <v-app id="inspire">
    <v-navigation-drawer
      v-show="useDrawer"
      v-model="drawer"
      class="pt-4"
      color="grey lighten-3"
      app
      permanent
      expand-on-hover
      mini-variant
    >
      <v-sheet color="grey lighten-4" class="pa-4">
        <v-avatar class="mb-4" color="grey darken-1" size="64"></v-avatar>

        <div>{{ Credential.username }}</div>
      </v-sheet>

      <v-divider></v-divider>

      <v-list nav>
        <router-link
          v-for="(route, index) in Routes"
          :key="index"
          :to="{ name: route.name }"
        >
          <v-list-item exact active-class="">
            <v-list-item-action>
              <v-icon>{{ route.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{ route.name }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </router-link>
        <a @click="logout">
          <v-list-item exact active-class="">
            <v-list-item-action>
              <v-icon>mdi-logout</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Logout</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </a>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import Cookie from "js-cookie";
export default {
  name: "App",

  computed: {
    Credential() {
      return this.$store.getters.getCredentials;
    },
    Routes() {
      let routes = this.$router.options.routes;
      const { position } = this.$store.getters.getCredentials;
      return routes.filter((route) => {
        if (!position) return;
        if (position.includes("ADMIN"))
          if (this.adminOnly.includes(route.name)) return route;
        if (position.includes("Member")) {
          if (this.memberOnly.includes(route.name)) return route;
        }
        if (position.includes("Staff")) {
          if (this.staffOnlyRoutes.includes(route.name)) return route;
        }

        // if (position.includes('Member')) {
        //   let restrictedRoute = [...this.notImportantRoutes, ...this.staffOnlyRoutes]
        //   if (restrictedRoute.includes(route.name) == false) return route
        // }
        // if (this.notImportantRoutes.includes(route.name) == false) return route;
      });
    },
    useDrawer() {
      const currentRoute = this.$store.getters.getCurrentRoute;
      const notImportant = this.notImportantRoutes;
      if (notImportant.includes(currentRoute)) return false;
      else return true;
    },
  },

  data: () => ({
    //
    drawer: true,
    notImportantRoutes: [
      "Login",
      "Tax List",
      "Income Statement",
      "Balance Sheet",
    ],
    staffOnlyRoutes: [
      'Products',
      'Home',
      'Activities',
      'Transactions',
      'Laporan SPT',
      'Cashier',
      "Budgets",
      "Expenses",
      "Tax Reports",
      "Company Profile",
      "LaporanSPT",
    ],
    adminOnly: ["Users"],
    memberOnly: ['Home', 'Activities','Transactions']
  }),
  methods: {
    logout() {
      this.$store.commit("removeCredential");
      Cookie.remove("accessToken", { path: "/" });
      this.$router.push({ name: "Login" });
    },
  },
};
</script>
