<template>
  <v-container>
    <v-row>
      <v-col cols="4" v-for="user in Users" :key="user.id">
        <v-card @dblclick="edit(user)">
          <v-card-title v-text="user.username"> </v-card-title>
        </v-card>
      </v-col>
    </v-row>
    <v-speed-dial
      v-model="fab"
      open-on-hover
      transition="slide-y-reverse"
      large
      bottom
      right
      fixed
      ><template v-slot:activator>
        <v-btn v-model="fab" color="blue darken-2" fab>
          <v-icon v-if="fab"> mdi-close </v-icon>
          <v-icon v-else>mdi-format-list-bulleted-square</v-icon>
        </v-btn>
      </template>
      <v-tooltip left>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            fab
            small
            dark
            icon
            color="primary"
            v-bind="attrs"
            v-on="on"
            @click="user.dialog = !user.dialog"
          >
            <v-icon>mdi-bank-plus</v-icon>
          </v-btn>
        </template>
        <span>Add User</span>
      </v-tooltip>
    </v-speed-dial>
    <v-dialog v-model="user.dialog" persistent>
      <v-card>
        <v-toolbar flat>
          <h2 v-text="user.input.id ? 'Update a User' : 'Create a User'"></h2>
          <v-spacer></v-spacer>
          <v-btn icon @click="user.dialog = !user.dialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <v-text-field
            v-model.trim="user.input.username"
            :rules="rules.username"
            label="Username"
            solo
            clearable
          ></v-text-field>
          <v-text-field
            v-model.trim="user.input.email"
            :rules="rules.email"
            label="Email"
            solo
            clearable
          ></v-text-field>
          <v-text-field
            v-model.trim="user.input.npwp"
            :rules="rules.npwp"
            label="NPWP"
            solo
            clearable
          ></v-text-field>
          <v-text-field
            v-model.trim="user.input.phoneNumber"
            :rules="rules.phoneNumber"
            label="Phone Number"
            solo
            clearable
          ></v-text-field>
          <v-text-field
            v-model.trim="user.input.address"
            :rules="rules.address"
            label="Address"
            solo
            clearable
          ></v-text-field>
          <v-text-field
            v-model.trim="user.input.password"
            :rules="rules.password"
            label="Password"
            solo
            clearable
          ></v-text-field>
          <v-select
            v-model="user.input.position"
            :rules="rules.position"
            label="Position"
            :items="position"
            single-line
            persistent-hint
            solo
            clearable
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="user.dialog = !user.dialog" color="red">Discard</v-btn>
          <v-btn
            @click="saveUser"
            color="primary"
            :disabled="
              !user.input.username ||
              !user.input.email ||
              !user.input.password ||
              !user.input.phoneNumber ||
              !user.input.address ||
              !user.input.npwp ||
              !user.input.position
            "
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import GET_USER from "../graphql/GetUser.gql";
import CREATE_USER from "../graphql/createUser.gql";
import UPDATE_USER from "../graphql/updateUser.gql";

import store from "../store";
export default {
  computed: {
    Users() {
      return this.$store.getters.getUsers
    }
  },
  data() {
    return {
      activeTab: null,
      fab: false,
      user: {
        input: {
          id: null,
          username: null,
          email: null,
          npwp: null,
          password: null,
          address: null,
          phoneNumber: null,
          position: null,
        },
        dialog: false,
      },
      rules: {
        email: [
          (v) => !!v || "E-mail is required",
          (v) => /.+@.+/.test(v) || "E-mail must be valid",
        ],
        username: [
          (v) => !!v || "Username field is required",
          (v) =>
            (v || "12345").length > 4 ||
            "Username field must be 5 characters or more",
        ],
        password: [
          (v) => !!v || "Password field is required",
          (v) =>
            (v || "1234").length > 3 ||
            "Password field must be 4 characters or more",
        ],
        address: [
          (v) => !!v || "Address field is required",
          (v) =>
            (v || "1234").length > 3 ||
            "Address field must be 4 characters or more",
        ],
        position: [(v) => !!v || "Position field is required"],
        phoneNumber: [
          (v) =>
            (v || "12345789012").length > 11 ||
            "Phone Number field is required",
        ],
        npwp: [
          (v) =>
            (v || "123456789012345").length > 14 ||
            "Npwp must be 15 characters",
        ],
      },
      position: ["Staff", "Member"],
    };
  },
  apollo: {
    users: {
      query: GET_USER,
      update: ({ Users }) => Users.user,
      result({ data }) {
        const {
          Users: { user },
        } = data;
        store.commit("addUser", user)
      },
    },
  },
  methods: {
    edit(data) {
      console.log(data);
      let { input } = this.user;
      Object.keys(input).map((key) => {
        input[key] = data[key];
      });
      this.user.dialog = !this.user.dialog;
    },
    async saveUser() {
      try {
        const { input } = this.user;
        const { id } = input;

        const result = await this.$apollo.mutate({
          mutation: id ? UPDATE_USER : CREATE_USER,
          variables: {
            input,
          },
        });

        const { ok, user, error } =
          result.data[id ? "updateUser" : "createUser"];
          console.log(user)
        if (!ok) alert(error.message);
        else {
          store.commit(id ? "updateUser" : "addUser", user);
          this.user.dialog = !this.user.dialog;
        }
      } catch ({ message }) {
        alert(message);
      }
    },
  },
};
</script>

<style></style>
