<template>
  <v-container fluid fill-height>
    <v-layout align-center justify-center>
      <v-col cols="8">
        <v-card>
          <v-card-title>Login</v-card-title>
          <v-card-text>
            <v-text-field
              prepend-icon="mdi-account"
              name="email"
              label="Email"
              v-model="input.email"
              :rules="rules.email"
              type="text"
            ></v-text-field>
            <v-text-field
              id="password"
              prepend-icon="mdi-lock"
              name="password"
              label="Password"
              v-model="input.password"
              :rules="rules.text"
              type="password"
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              @click="Login"
              :disabled="isEmpty(input.password) || isEmpty(input.email)"
              >Login</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-col>
    </v-layout>
  </v-container>
</template>

<script>
import { isEmpty } from "lodash";
import Cookie from "js-cookie";
import LOGIN from "../graphql/Login.gql";

export default {
  data() {
    return {
      input: {
        email: "",
        password: "",
      },
      rules: {
        text: [(v) => !!v || "Password is required"],
        email: [
          (v) => !!v || "E-mail is required",
          (v) => /.+@.+/.test(v) || "E-mail must be valid",
        ],
      },
    };
  },
  methods: {
    isEmpty,
    async Login() {
      try {
        const login = await this.$apollo.mutate({
          mutation: LOGIN,
          variables: {
            input: this.input,
          },
        });
        const { ok, user, error } = login.data.login;
        console.log(error);
        if (!ok) alert(error.message);
        else {
          this.$store.commit("updateCredential", user[0]);
          Cookie.set("accessToken", user[0].accessToken);
          this.$router.push({ name: "Home" });
        }
      } catch (err) {
        console.log(err);
        alert(err.message);
      }
    },
  },
};
</script>

<style></style>
