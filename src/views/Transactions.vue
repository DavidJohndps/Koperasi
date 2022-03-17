<template>
  <v-container>
    <v-row>
      <v-col
        cols="12"
        v-for="transaction in transactions"
        :key="transaction.id"
      >
        <Transaction :transaction="transaction" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import store from '../store'
import GetTransaction from "../graphql/GetTransaction.gql";

import Transaction from "../components/Transaction.vue";

export default {
  components: {
    Transaction,
  },
  data() {
    return {
      transactions: null,
    };
  },
  apollo: {
    transactions: {
      query: GetTransaction,
      update: (data) => data.Transactions.transaction,
      result: ({data}) => store.commit('addTransaction', data.Transactions.transaction)
    },
  },
};
</script>

<style></style>
