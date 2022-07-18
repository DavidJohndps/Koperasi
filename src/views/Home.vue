<template>
  <v-container fluid fill-height>
    <v-row>
      <!-- Recent Transactions -->
      <v-col cols="3">
        <Transaction
          v-show="RecentTransactions.length > 0"
          v-for="transaction in RecentTransactions"
          :transaction="transaction"
          :key="transaction.id"
        />
        <p v-show="RecentTransactions.length == 0">No Recent Transactions</p>
      </v-col>
      <!-- Product Shortage -->
      <v-col cols="5">
        <Product
          v-show="ProductShortage.length > 0"
          v-for="product in ProductShortage"
          :product="product"
          :key="product.id"
          @updatedProduct="getRecentActivity"
        />
        <p v-show="ProductShortage.length == 0">No Product Shortage</p>
      </v-col>
      <v-col cols="4">
        <Activity
          v-for="activity in RecentActivities"
          :key="activity.id"
          :activity="activity"
        />
        <p v-show="RecentActivities.length == 0">No Recent Activities</p>
      </v-col>
    </v-row>
    <SearchDialog />
  </v-container>
</template>

<script>
import GET_COMPANY_DETAIL from "../graphql/GetCompanyDetails.gql";
import GET_TRANSACTION from "../graphql/GetTransaction.gql";
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
      await this.GetCompanyDetails()
      await this.getTransaction();
      await this.getRecentTransactions();
      await this.getProductShortage();
      await this.getRecentActivity();
    } catch (err) {
      console.log(err);
    }
  },

  computed: {
    ShopCart() {
      return this.$store.getters.getShopCart;
    },
    RecentTransactions() {
      return this.$store.getters.getRecentTransactions;
    },
    RecentActivities() {
      return this.$store.getters.getRecentActivities;
    },
    ProductShortage() {
      return this.$store.getters.getProducts.filter(
        (product) => product.stock <= 10
      );
    },
  },
  data() {
    return {
      drawer: true,
    };
  },
  methods: {
    async getTransaction() {
      try {
        const result = await this.$apollo.mutate({
          mutation: GET_TRANSACTION,
          variables: { sort: 'desc' },
        });
        const docs = result.data.Transactions;
        const { ok, transaction, error } = docs;
        if (ok) {
          this.$store.commit("addTransaction", transaction);
        } else alert(error);
      } catch (err) {
        console.log(err);
      }
    },
    async getRecentTransactions() {
      try {
        const result = await this.$apollo.mutate({
          mutation: GET_RECENT_TRANSACTION,
          variables: { isRecent: true },
        });
        const docs = result.data.Transactions;
        const { ok, transaction, error } = docs;
        if (ok) {
          this.$store.commit("addRecentTransaction", transaction);
          this.$store.commit("addTransaction", transaction);
        } else alert(error);
      } catch (err) {
        console.log(err);
      }
    },
    async getProductShortage() {
      try {
        const result = await this.$apollo.mutate({
          mutation: GET_PRODUCT_SHORTAGE,
          variables: { stock: 10, sort: "asc" },
        });
        const docs = result.data.Products;
        const { ok, product, error } = docs;
        if (ok) this.$store.commit("addProduct", product);
        else alert(error);
      } catch (err) {
        console.log(err);
      }
    },
    async getRecentActivity() {
      try {
        const result = await this.$apollo.mutate({
          mutation: GET_ACTIVITY,
          variables: {
            isRecent: true,
            sort: "desc",
          },
        });
        const { ok, activity, error } = result.data.Activities;
        if (ok) {
          this.$store.commit("addRecentActivity", activity);
          this.$store.commit("addActivity", activity);
        } else alert(error);
      } catch (err) {
        console.log(err);
      }
    },
    async GetCompanyDetails() {
      try {
        const result = await this.$apollo.mutate({
          mutation: GET_COMPANY_DETAIL,
        });
        const { ok, companyDetail, error } = result.data.CompanyDetails;
        if (!ok) alert(error);
        this.$store.commit("updateCompanyDetails", companyDetail);
      } catch (err) {
        console.log(err);
      }
    },
  },
};
</script>

<style scoped>
.width-200 {
  width: 250px;
}
</style>
