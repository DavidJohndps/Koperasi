<template>
  <v-container class="my-2">
    <v-data-table
      :items="ShopCart"
      :headers="headers"
      class="elevation-1"
      hide-default-footer
    >
      <template v-slot:[`item.qty`]="{ item }">
        <v-tooltip left>
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-bind="attrs"
              v-on="on"
              v-model="item.qty"
              class="width-200"
              min="1"
              :max="item.product.stock"
            >
              <v-icon
                slot="prepend-inner"
                color="red"
                @click="item.qty--"
                :disabled="item.qty <= 1"
                >mdi-minus</v-icon
              >
              <v-icon
                slot="append"
                color="green"
                @click="item.qty++"
                :disabled="isEmpty(item)"
                >mdi-plus</v-icon
              >
            </v-text-field>
          </template>
          <span>{{
            isEmpty(item)
              ? "Theres no stock left on the shelf"
              : "Add Item to Shopping Cart"
          }}</span>
        </v-tooltip>
      </template>
      <template v-slot:[`item.total`]="{ item }">
        {{ item.qty * item.product.price }}
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <v-icon small @click="removeCartItem(item)"> mdi-delete </v-icon>
      </template>
      <template v-slot:[`body.append`]>
        <tr>
          <td colspan="3" class="text-right">Total</td>
          <td colspan="1" class="text-right">{{ Total }}</td>
          <td colspan="1">
            <v-btn outlined text @click="dialog = !dialog">Checkout</v-btn>
          </td>
        </tr>
      </template>
    </v-data-table>
    <v-dialog v-model="dialog" width="40%">
      <v-card>
        <v-toolbar color="primary" dark>Shopping Cart</v-toolbar>
        <v-list>
          <v-list-item two-line v-for="item in ShopCart" :key="item.product.id">
            <v-list-item-content>
              <v-list-item-title
                ><span
                  >{{ item.qty }} x {{ item.product.name }}
                  <v-spacer></v-spacer> {{ item.qty * item.product.price }}
                </span>
              </v-list-item-title>
              <v-list-item-subtitle
                >{{ item.product.price }} /Pcs.</v-list-item-subtitle
              >
            </v-list-item-content>
          </v-list-item>
          <v-subheader>
            <span>Total :</span>
            <v-spacer></v-spacer>
            <span>{{ Total }}</span>
          </v-subheader>
        </v-list>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn outlined color="primary" @click="createTransaction"
            >Submit</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <SearchDialog />
  </v-container>
</template>

<script>
// import {uniq} from 'lodash'
import SearchDialog from "../components/SearchDialog.vue";

import GetTransaction from "../graphql/GetTransaction.gql";
import createTransaction from "../graphql/createTransaction.gql";
export default {
  components: {
    SearchDialog,
  },
  computed: {
    ShopCart() {
      return this.$store.getters.getShopCart;
    },
    isEmpty() {
      return (item) => {
        const index = this.ShopCart.findIndex(
          (item) => item.product.id == item.product.id
        );
        if (index != -1) {
          if (item.qty >= item.product.stock) return true;
          else return false;
        } else {
          if (item.product.qty >= item.product.stock) return true;
          else return false;
        }
      };
    },
    Total() {
      const items = this.ShopCart;
      let total = 0;
      items.forEach((item) => (total += item.product.price * item.qty));
      return total;
    },
  },
  data() {
    return {
      headers: [
        {
          text: "Name",
          align: "start",
          width: "30%",
          sortable: false,
          value: "product.name",
        },
        {
          text: "Price",
          align: "end",
          value: "product.price",
        },
        {
          text: "Quantity",
          align: "center",
          width: "200",
          value: "qty",
        },
        {
          text: "Total",
          align: "end",
          value: "total",
        },
        {
          text: "Actions",
          width: "200",
          sortable: false,
          value: "actions",
        },
      ],
      dialog: false,
      input: {
        product: [],
        price: [],
        qty: [],
      },
    };
  },
  methods: {
    removeCartItem(item) {
      this.$store.commit("removeCartItem", item);
    },
    async createTransaction() {
      try {
        let products = [],
          qtys = [],
          prices = [];
        this.ShopCart.forEach((cart) => {
          const { product: item, qty } = cart;
          const { id, price } = item;
          products.push(id);
          prices.push(price);
          qtys.push(parseInt(qty));
        });
        const { id } = this.$store.getters.getCredentials;
        const result = await this.$apollo.mutate({
          mutation: createTransaction,
          variables: {
            input: {
              product: products,
              price: prices,
              qty: qtys,
              total: this.Total,
              verBy: id,
            },
          },
        });
        await result.data.test;
        await this.getTransaction();
        this.$store.commit("emptyCartItem");
        this.dialog = !this.dialog;
      } catch (err) {
        console.log(err);
      }
    },
    async getTransaction() {
      try {
        const result = await this.$apollo.mutate({ mutation: GetTransaction });
        const { ok, transaction, error } = await result.data.Transactions;
        if (!ok) alert(error);
        else this.$store.commit("addTransaction", transaction);
      } catch (err) {
        console.log(err);
      }
    },
  },
};
</script>

<style scoped>
/* .width-200 {
  width: 250px;
} */
</style>
