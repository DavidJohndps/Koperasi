<template>
  <v-container>
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
      <v-btn fab small @click="product.dialog = !product.dialog">
        <v-icon>mdi-playlist-plus</v-icon>
      </v-btn>
    </v-speed-dial>
    <v-dialog v-model="product.dialog">
      <v-card>
        <v-toolbar flat>
          <h2>Create Product</h2>
          <v-spacer></v-spacer>
          <v-btn icon @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <v-text-field
            v-model="product.input.name"
            label="Name"
            clearable
            solo
            rounded
          ></v-text-field>
          <v-text-field
            v-model="product.input.desc"
            label="Description"
            clearable
            solo
            rounded
          ></v-text-field>
          <v-text-field
            v-model="product.input.basePrice"
            type="number"
            label="Base Price"
            clearable
            solo
            rounded
          ></v-text-field>
          <v-text-field
            v-model="product.input.profit"
            type="number"
            label="Profit"
            clearable
            solo
            rounded
          ></v-text-field>
          <v-text-field
            v-model="product.input.stock"
            type="number"
            label="Stock"
            clearable
            solo
            rounded
          >
            <v-icon
              slot="prepend-inner"
              color="red"
              @click="product.input.stock--"
              >mdi-minus</v-icon
            >
            <v-icon slot="append" color="green" @click="product.input.stock++"
              >mdi-plus</v-icon
            >
          </v-text-field>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeDialog">Discard</v-btn>
          <v-btn text @click="CreateProduct">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-row>
      <v-col cols="4" v-for="product in Products" :key="product.id">
        <Product
          v-show="Products.length > 0"
          :product="product"
          :key="product.name"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import store from "../store";
import Product from "../components/Product.vue";
import GET_PRODUCT from "../graphql/GetProduct.gql";
import CREATE_PRODUCT from "../graphql/createProduct.gql";
export default {
  components: {
    Product,
  },
  computed: {
    Products() {
      return this.$store.getters.getProducts
    }
  },
  data() {
    return {
      fab: false,
      product: {
        input: {
          name: null,
          desc: null,
          basePrice: null,
          profit: null,
          stock: null,
        },
        dialog: false,
      },
    };
  },
  apollo: {
    products: {
      query: GET_PRODUCT,
      update: (data) => data.Products.product,
      result: ({ data }) => {
        store.commit("addProduct", data.Products.product);
      },
    },
  },
  methods: {
    closeDialog() {
      let { input } = this.product;
      Object.keys(input).map((key) => (input[key] = null));
      this.product.dialog = !this.product.dialog;
    },
    //Remember to refractor function, so that this function can be used for create and update product
    async CreateProduct() {
      try {
        const { basePrice, profit, stock, ...input } = this.product.input;
        const result = await this.$apollo.mutate({
          mutation: CREATE_PRODUCT,
          variables: {
            input: {
              ...input,
              basePrice: parseFloat(basePrice),
              profit: parseInt(profit),
              stock: parseInt(stock),
            },
          },
        });
        const { ok, product, error } = result.data.createProduct;
        if (!ok) alert(error);
        else {
          this.$store.commit("addProduct", product);
          this.product.dialog = !this.product.dialog;
        }
      } catch (err) {
        alert(err);
      }
    },
  },
};
</script>

<style></style>
