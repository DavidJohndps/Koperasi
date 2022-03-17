<template>
  <v-app id="inspire">
    <v-navigation-drawer
      v-show="isRouteLogin"
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
      return routes.filter((route) => route.name !== "Login");
    },
    isRouteLogin() {
      const currentRoute = this.$store.getters.getCurrentRoute;
      if (currentRoute == "Login") return false;
      else return true;
    },
  },

  data: () => ({
    //
    drawer: true,
  }),
  methods: {
    logout() {
      this.$store.commit('removeCredential')
      Cookie.remove("accessToken", { path: "/" });
      this.$router.push({ name: "Login" });
    },
  },
};
</script>
