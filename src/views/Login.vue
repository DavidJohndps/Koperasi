<template>
  <v-container fluid fill-height>
    <v-layout align-center justify-center>
      <v-col cols="8">
        <v-card>
          <v-card-title>Login</v-card-title>
          <v-card-text>
            <v-text-field
              prepend-icon="person"
              name="email"
              label="Email"
              v-model="input.email"
              type="text"
            ></v-text-field>
            <v-text-field
              id="password"
              prepend-icon="lock"
              name="password"
              label="Password"
              v-model="input.password"
              type="password"
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="Login">Login</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-layout>
  </v-container>
</template>

<script>
import Cookie from 'js-cookie';
import LOGIN from "../graphql/Login.gql";

export default {
  data() {
    return {
      input: {
        email: "",
        password: "",
      },
    };
  },
  methods: {
    async Login() {
      try {
        const login = await this.$apollo.mutate({
          mutation: LOGIN,
          variables: {
            input: this.input,
          },
        });
        const { ok, user, error } = login.data.login;
        if (!ok) alert(error);
        else this.$store.commit("updateCredential", user[0]);
        Cookie.set('accessToken', user[0].accessToken)
        this.$router.push({ name: "Home" });
      } catch (err) {
        alert(err);
      }
    },
  },
};
</script>

<style></style>
