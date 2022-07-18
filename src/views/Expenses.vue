<template>
  <v-container>
    <v-tabs v-model="activeTab">
      <v-tab>Expenses</v-tab>
      <v-tab>Expense Category</v-tab>
    </v-tabs>
    <v-tabs-items v-model="activeTab">
      <v-tab-item :key="0">
        <v-card>
          <v-card-text>
            <v-row>
              <v-col cols="4" v-for="expense in Expenses" :key="expense.id">
                <v-card @dblclick="edit('expense', expense)">
                  <v-card-title v-text="expense.name"> </v-card-title>
                  <v-card-subtitle
                    v-text="expense.expCategory.name"
                  ></v-card-subtitle>
                  <v-card-text>
                    <v-row>
                      <v-col cols="4">Amount</v-col>
                      <v-col v-text="expense.amount"></v-col>
                    </v-row>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <div
                      v-text="`Authorized by ${expense.verBy.username}`"
                    ></div>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-tab-item>
      <v-tab-item :key="1">
        <v-card>
          <v-card-text>
            <v-col
              cols="4"
              v-for="category in ExpenseCategory"
              :key="category.id"
            >
              <v-card @dblclick="edit('expCategory', category)">
                <v-card-title v-text="category.name"> </v-card-title>
              </v-card>
            </v-col>
          </v-card-text>
        </v-card>
      </v-tab-item>
    </v-tabs-items>
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
            @click="expCategory.dialog = !expCategory.dialog"
          >
            <v-icon>mdi-bank-plus</v-icon>
          </v-btn>
        </template>
        <span>Add Expense Category</span>
      </v-tooltip>
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
            @click="expense.dialog = !expense.dialog"
          >
            <v-icon>mdi-bank-plus</v-icon>
          </v-btn>
        </template>
        <span>Add Expense</span>
      </v-tooltip>
    </v-speed-dial>
    <v-dialog v-model="expCategory.dialog" persistent>
      <v-card>
        <v-toolbar flat>
          <h2
            v-text="
              expCategory.input.id
                ? 'Update an Expense Category'
                : 'Create an Expense Category'
            "
          ></h2>
          <v-spacer></v-spacer>
          <v-btn icon @click="closeDialog('expCategory')">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <v-text-field
            v-model.trim="expCategory.input.name"
            :rules="rules.name"
            label="Name"
            solo
            clearable
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="closeDialog('expCategory')" color="red">Discard</v-btn>
          <v-btn
            @click="saveExpenseCategory"
            color="primary"
            :disabled="isEmpty(expCategory.input.name)"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="expense.dialog" persistent>
      <v-card>
        <v-toolbar flat>
          <h2
            v-text="
              expense.input.id ? 'Update an Expense' : 'Create an Expense'
            "
          ></h2>
          <v-spacer></v-spacer>
          <v-btn icon @click="closeDialog('expense')">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <v-text-field
            v-model.trim="expense.input.name"
            :rules="rules.name"
            label="Name"
            solo
            clearable
          ></v-text-field>
          <v-select
            v-model="expense.input.expCategory"
            :rules="rules.category"
            label="Expense Category"
            :items="ExpenseCategory"
            item-value="id"
            item-text="name"
            single-line
            persistent-hint
            solo
            clearable
          ></v-select>
          <v-text-field
            v-model.number="expense.input.amount"
            :rules="rules.amount"
            :max="CompanyBalance"
            type="number"
            label="Amount"
            clearable
            solo
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="closeDialog('expense')" color="red">Discard</v-btn>
          <v-btn
            @click="saveExpense"
            color="primary"
            :disabled="
              !expense.input.name ||
              !expense.input.expCategory ||
              !expense.input.amount
            "
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { isEmpty } from "lodash";

import store from "../store";
import GET_EXPENSE from "../graphql/GetExpense.gql";
import GET_EXPENSE_CATEGORY from "../graphql/GetExpenseCategory.gql";
import CREATE_EXPENSE_CATEGORY from "../graphql/createExpenseCategory.gql";
import UPDATE_EXPENSE_CATEGORY from "../graphql/updateExpenseCategory.gql";
import CREATE_EXPENSE from "../graphql/createExpense.gql";
import UPDATE_EXPENSE from "../graphql/updateExpense.gql";
export default {
  computed: {
    CompanyBalance() {
      const { balance } = this.$store.getters.getCompanyDetails;
      return balance;
    },
    Expenses() {
      return this.$store.getters.getExpenses;
    },
    ExpenseCategory() {
      return this.$store.getters.getExpenseCategory;
    },
  },
  data() {
    return {
      activeTab: null,
      fab: false,
      expense: {
        input: {
          id: null,
          expCategory: null,
          amount: null,
          verBy: null,
          name: null,
        },
        dialog: false,
      },
      expCategory: {
        input: {
          id: null,
          name: null,
        },
        dialog: false,
      },
      rules: {
        name: [(v) => !!v || "Name field is required"],
        amount: [(v) => !!v || "Amount field is required"],
        category: [(v) => !!v || "Category field is required"],
      },
    };
  },
  apollo: {
    expenses: {
      query: GET_EXPENSE,
      update: (data) => data.Expenses.expense,
      result({ data }) {
        console.log(data.Expenses.expense);
        store.commit("addExpense", data.Expenses.expense);
        store.commit("setTotalPengeluaran", data.Expenses.expense);
        store.commit("setTotalPengeluaranGaji", data.Expenses.expense);
      },
    },
    expCategories: {
      query: GET_EXPENSE_CATEGORY,
      update: (data) => data.ExpenseCategories.expCategory,
      result({ data }) {
        store.commit("addExpenseCategory", data.ExpenseCategories.expCategory);
      },
    },
  },
  methods: {
    isEmpty,
    edit(name, data) {
      let { input } = this[name];
      Object.keys(input).map((key) => {
        if (key == "expCategory") input[key] = data[key].id;
        else input[key] = data[key];
      });
      this[name].dialog = !this[name].dialog;
    },
    closeDialog(name) {
      const { input } = this[name];
      Object.keys(input).map((key) => (input[key] = null));
      this[name].dialog = false;
    },
    async saveExpenseCategory() {
      try {
        const { id, ...input } = this.expCategory.input;
        const result = await this.$apollo.mutate({
          mutation: id ? UPDATE_EXPENSE_CATEGORY : CREATE_EXPENSE_CATEGORY,
          variables: {
            input: {
              ...input,
              id,
            },
          },
        });
        const { ok, error, expCategory } =
          result.data[id ? "updateExpenseCategory" : "createExpenseCategory"];
        if (!ok) alert(error.message);
        else {
          this.$store.commit(
            id ? "updateExpenseCategory" : "addExpenseCategory",
            expCategory
          );
          this.closeDialog("expCategory");
        }
      } catch ({ message }) {
        alert(message);
      }
    },
    async saveExpense() {
      try {
        var { id, amount, ...input } = this.expense.input;
        const { id: userId } = this.$store.getters.getCredentials;
        const { id: companyDetailId } = this.$store.getters.getCompanyDetails;
        const result = await this.$apollo.mutate({
          mutation: id ? UPDATE_EXPENSE : CREATE_EXPENSE,
          variables: {
            input: {
              ...input,
              id,
              companyDetailId,
              amount: parseFloat(amount),
              verBy: userId,
            },
          },
        });
        const { ok, error, expense } =
          result.data[id ? "updateExpense" : "createExpense"];
        if (!ok) alert(error.message);
        else {
          this.$store.commit(id ? "updateExpense" : "addExpense", expense);
          this.closeDialog("expense");
        }
      } catch ({ message }) {
        alert(message);
      }
    },
  },
};
</script>

<style></style>
