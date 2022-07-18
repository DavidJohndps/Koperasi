<template>
  <v-container>
    <v-row>
      <v-col v-for="budget of Budgets" :key="budget.id" cols="4">
        <v-card @dblclick="edit('budget', budget)">
          <v-card-title v-text="budget.amount"></v-card-title>
          <v-card-subtitle>By: {{ budget.user.username }}</v-card-subtitle>
          <v-card-actions
            >Verified by: {{ budget.verBy.username }}</v-card-actions
          >
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
            @click="budget.dialog = !budget.dialog"
          >
            <v-icon>mdi-bank-plus</v-icon>
          </v-btn>
        </template>
        <span>Add Company Budget</span>
      </v-tooltip>
    </v-speed-dial>
    <v-dialog v-model="budget.dialog" persistent>
      <v-card>
        <v-toolbar flat>
          <h2>{{ budget.input.id ? "Update Budget" : "Add Budget" }}</h2>
          <v-spacer></v-spacer>
          <v-btn icon @click="closeDialog('budget')">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <v-select
            v-model="budget.input.user"
            :rules="rules.user"
            label="Name"
            :items="Users"
            item-value="id"
            item-text="username"
            single-line
            persistent-hint
            solo
            clearable
          ></v-select>
          <v-text-field
            v-model.number="budget.input.amount"
            :rules="rules.amount"
            type="number"
            label="Add Budget"
            clearable
            solo
            rounded
            aria-required="required"
          ></v-text-field>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeDialog('budget')">Discard</v-btn>
          <v-btn
            text
            @click="saveBudget"
            :disabled="isEmpty(budget.input.user) || !budget.input.amount"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { isEmpty } from "lodash";

import GET_USERS from "../graphql/GetUser.gql";
import GET_BUDGETS from "../graphql/GetBudget.gql";
import CREATE_BUDGETS from "../graphql/createBudget.gql";
import UPDATE_BUDGETS from "../graphql/updateBudget.gql";

import store from "../store";
export default {
  computed: {
    Budgets() {
      return this.$store.getters.getBudgets;
    },
    Users() {
      const users = this.$store.getters.getUsers;
      return users.filter(
        (user) => !user.position.toLowerCase().includes("admin")
      );
    },
  },
  data() {
    return {
      fab: false,
      budget: {
        input: {
          id: null,
          user: null,
          amount: null,
        },
        dialog: false,
      },
      rules: {
        user: [(v) => !!v || "User field is required"],
        amount: [(v) => !!v || "Amount field is required"],
      },
    };
  },
  apollo: {
    budgets: {
      query: GET_BUDGETS,
      update: ({ Budgets }) => Budgets.budget,
      result({ data }) {
        const {
          Budgets: { budget },
        } = data;
        store.commit("addBudget", budget);
        store.commit("addPemilikModal", budget);
      },
    },
    users: {
      query: GET_USERS,
      update: ({ Users }) =>
        Users.user.filter(
          (user) => !user.position.toLowerCase().includes("admin")
        ),
      result({ data }) {
        const {
          Users: { user },
        } = data;
        store.commit("addUser", user);
        store.commit("addPengurus", user);
      },
    },
  },
  methods: {
    isEmpty,
    edit(name, budget) {
      const { input } = this[name];
      Object.keys(input).map((key) => {
        if (key == "user") input[key] = budget[key].id;
        else input[key] = budget[key];
      });
      this[name].dialog = !this[name].dialog;
    },
    closeDialog(name) {
      var { input } = this[name];
      Object.keys(input).map((key) => (input[key] = null));
      this[name].dialog = false;
    },
    async saveBudget() {
      try {
        const { id: companyDetailId } = this.$store.getters.getCompanyDetails;
        const { id: verBy } = this.$store.getters.getCredentials;
        const { input } = this.budget;
        const { id } = input;

        const result = await this.$apollo.mutate({
          mutation: id ? UPDATE_BUDGETS : CREATE_BUDGETS,
          variables: {
            input: {
              ...input,
              companyDetailId,
              verBy,
            },
          },
        });
        const { ok, error, budget } =
          result.data[id ? "updateBudget" : "createBudget"];
        if (!ok) alert(error.message);
        else {
          this.$store.commit(id ? "updateBudget" : "addBudget", budget);
          this.closeDialog("budget");
        }
      } catch (err) {
        alert(err.message);
      }
    },
  },
};
</script>

<style></style>
