<template>
  <div>
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
      <v-btn fab small @click="search.dialog = !search.dialog">
        <v-icon>mdi-magnify</v-icon>
      </v-btn>
    </v-speed-dial>
    <v-dialog v-model="search.dialog" persistent max-width="80%">
      <v-card>
        <v-toolbar flat>
          Search Product
          <v-spacer></v-spacer>
          <v-btn icon @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <v-text-field
            v-model="search.input"
            label="Search product"
            append-outer-icon="mdi-magnify"
            clearable
            solo
            rounded
            @click:append-outer="searchProduct"
          ></v-text-field>
        </v-card-text>
        <v-divider></v-divider>
        <v-virtual-scroll :items="search.result" item-height="50" height="200">
          <template v-slot:default="{ item }">
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>{{ item.name }}</v-list-item-title>
              </v-list-item-content>
              <v-list-item-action>
                <!-- <v-text-field v-model="search.qty" type="number" single-line prepend-inner-icon="mdi-minus" append-icon="mdi-plus" append-outer-icon="mdi-cart-plus"></v-text-field> -->
                <v-tooltip left>
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-bind="attrs"
                      v-on="on"
                      v-model="item.qty"
                      class="width-200"
                      min="1"
                      rounded
                      single-line
                      solo
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
                      <v-icon
                        class="centered-input"
                        fab
                        icon
                        slot="append-outer"
                        color="blue"
                        @click="addCartItem(item)"
                        >mdi-cart-plus
                      </v-icon>
                    </v-text-field>
                  </template>
                  <span>{{
                    isEmpty(item)
                      ? "Theres no stock left on the shelf"
                      : "Add Item to Shopping Cart"
                  }}</span>
                </v-tooltip>
              </v-list-item-action>
            </v-list-item>
          </template>
        </v-virtual-scroll>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import SEARCH_PRODUCT from "../graphql/SearchProduct.gql";
export default {
  computed: {
    ShopCart() {
      return this.$store.getters.getShopCart;
    },
    isEmpty() {
      return (product) => {
        const index = this.ShopCart.findIndex(
          (item) => item.product.id == product.id
        );
        if (index != -1) {
          const totalQty = product.qty + this.ShopCart[index].qty;
          if (totalQty >= product.stock) return true;
          else return false;
        } else {
          if (product.qty >= product.stock) return true;
          else return false;
        }
      };
    },
  },
  data() {
    return {
      fab: false,
      search: {
        input: null,
        result: [],
        dialog: false,
      },
    };
  },
  methods: {
    closeDialog() {
      this.search.result = [];
      this.search.dialog = !this.search.dialog;
    },
    addCartItem(item) {
      const { qty, ...product } = item;
      this.$store.commit("addCartItem", { product, qty });
    },
    async searchProduct() {
      try {
        this.search.result = [];
        const result = await this.$apollo.mutate({
          mutation: SEARCH_PRODUCT,
          variables: { input: this.search.input },
        });
        const { ok, product, error } = result.data.Products;
        if (ok)
          product.forEach((item) => {
            console.log(item);
            this.search.result.push({ ...item, qty: 0 });
          });
        else alert(error);
      } catch (err) {
        console.log(err);
      }
    },
  },
};
</script>

<style></style>
