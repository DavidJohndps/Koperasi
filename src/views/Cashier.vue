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
              v-model.number="item.qty"
              class="width-200"
              min="1"
              :max="item.product.stock"
              type="number"
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
        {{ item.qty * Price(item.product.basePrice, item.product.profit) }}
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <v-icon small @click="removeCartItem(item)"> mdi-delete </v-icon>
      </template>
      <template v-slot:[`body.append`]>
        <tr>
          <td colspan="3" class="text-right">Total</td>
          <td colspan="1" class="text-right">{{ Total }}</td>
          <td colspan="1">
            <v-btn
              outlined
              text
              @click="dialog = !dialog"
              :disabled="ShopCart.length > 0 ? false : true"
              >Checkout</v-btn
            >
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
                  <v-spacer></v-spacer>
                  {{
                    item.qty *
                    Price(item.product.basePrice, item.product.profit)
                  }}
                </span>
              </v-list-item-title>
              <v-list-item-subtitle
                >{{
                  Price(item.product.basePrice, item.product.profit)
                }}
                /Pcs.</v-list-item-subtitle
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
import { round } from "lodash";

import SearchDialog from "../components/SearchDialog.vue";

import GET_TRANSACTION from "../graphql/GetTransaction.gql";
import CREATE_TRANSACTION from "../graphql/createTransaction.gql";
export default {
  components: {
    SearchDialog,
  },
  computed: {
    CompanyDetail() {
      const { id } = this.$store.getters.getCompanyDetails;
      return id;
    },
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
      items.forEach(
        (item) =>
          (total +=
            this.Price(item.product.basePrice, item.product.profit) * item.qty)
      );
      return total;
    },
    Price() {
      return (basePrice, profit) =>
        round(basePrice * (parseFloat(profit + 100) / 100), 2);
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
        basePrice: [],
        profit: [],
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
          basePrices = [],
          profits = [];
        this.ShopCart.forEach((cart) => {
          const { product: item, qty } = cart;
          const { id, basePrice, profit } = item;
          products.push(id);
          basePrices.push(basePrice);
          profits.push(parseInt(profit));
          qtys.push(parseInt(qty));
        });
        const { id } = this.$store.getters.getCredentials;
        const result = await this.$apollo.mutate({
          mutation: CREATE_TRANSACTION,
          variables: {
            input: {
              companyDetailId: this.CompanyDetail,
              product: products,
              basePrice: basePrices,
              profit: profits,
              qty: qtys,
              total: this.Total,
              verBy: id,
            },
          },
        });
        const { ok, error } = await result.data.createTransaction;
        if (!ok) alert(error.message);
        else {
          await this.getTransaction();
          this.$store.commit("emptyCartItem");
          this.dialog = !this.dialog;
        }
      } catch ({ message }) {
        alert(message);
      }
    },
    async getTransaction() {
      try {
        const result = await this.$apollo.mutate({ mutation: GET_TRANSACTION });
        const { ok, transaction, error } = await result.data.Transactions;
        if (!ok) alert(error.message);
        else this.$store.commit("addTransaction", transaction);
      } catch ({ message }) {
        alert(message);
      }
    },
  },
};
</script>
