<template>
  <v-container fluid fill-height>
    <v-row>
      <!-- Recent Transactions -->
      <v-col cols="3">
        <Transaction
          v-show="Transactions.length > 0"
          v-for="transaction in Transactions"
          :transaction="transaction"
          :key="transaction.id"
        />
        <p v-show="Transactions.length == 0">No Recent Transactions</p>
      </v-col>
      <!-- Product Shortage -->
      <v-col cols="5">
        <Product
          v-show="ProductShortage.length > 0"
          v-for="product in ProductShortage"
          :product="product"
          :key="product.id"
        />
        <p v-show="ProductShortage.length == 0">No Product Shortage</p>
      </v-col>
      <v-col cols="4">
        <Activity v-for="activity in Activities" :key="activity.id" :activity="activity"/>
      </v-col>
    </v-row>
    <SearchDialog />
  </v-container>
</template>

<script>
import GET_RECENT_TRANSACTION from "../graphql/GetRecentTransactions.gql";
import GET_PRODUCT_SHORTAGE from "../graphql/GetProductShortage.gql";
import GET_ACTIVITY from "../graphql/GetActivity.gql";

import SearchDialog from "../components/SearchDialog.vue";
import Transaction from "../components/Transaction.vue";
import Product from "../components/Product.vue";
import Activity from "../components/Activity.vue";

export default {
  name: "Home",

  components: {
    SearchDialog,
    Transaction,
    Product,
    Activity,
  },

  async mounted() {
    try {
      await this.getRecentTransactions();
      await this.getProductShortage();
      await this.getActivity();
    } catch (err) {
      console.log(err);
    }
  },

  computed: {
    // isEmpty() {
    //   return (product) => {
    //     const index = this.ShopCart.findIndex(
    //       (item) => item.product.id == product.id
    //     );
    //     if (index != -1) {
    //       const totalQty = product.qty + this.ShopCart[index].qty;
    //       if (totalQty >= product.stock) return true;
    //       else return false;
    //     } else {
    //       if (product.qty >= product.stock) return true;
    //       else return false;
    //     }
    //   };
    // },
    ShopCart() {
      return this.$store.getters.getShopCart;
    },
    Transactions() {
      return this.$store.getters.getTransactions;
    },
    Activities() {
      return this.$store.getters.getActivities;
    },
    ProductShortage() {
      return this.$store.getters.getProducts.filter(product => product.stock <= 10)
    },
  },
  data() {
    return {
      drawer: true,
    };
  },
  methods: {
    async getRecentTransactions() {
      try {
        const result = await this.$apollo.mutate({
          mutation: GET_RECENT_TRANSACTION,
          variables: { isRecent: true },
        });
        const docs = result.data.Transactions;
        const { ok, transaction, error } = docs;
        if (ok) this.$store.commit("addTransaction", transaction);
        else alert(error);
      } catch (err) {
        console.log(err);
      }
    },
    async getProductShortage() {
      try {
        const result = await this.$apollo.mutate({
          mutation: GET_PRODUCT_SHORTAGE,
          variables: { stock: 10 },
        });
        const docs = result.data.Products;
        const { ok, product, error } = docs;
        if (ok) this.$store.commit("addProduct", product);
        else alert(error);
      } catch (err) {
        console.log(err);
      }
    },
    async getActivity() {
      try {
        const result = await this.$apollo.mutate({mutation: GET_ACTIVITY, variables: {
          isRecent: true,
          sort: 'desc'
        }})
        const {ok, activity, error} = result.data.Activities
        ok ? this.$store.commit('addActivity', activity) : alert(error)
      } catch (err) {
        console.log(err)
      }
    }
  },
};
</script>

<style scoped>
.width-200 {
  width: 250px;
}
</style>
