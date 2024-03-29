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
            v-model.trim="product.input.name"
            :rules="rules.name"
            label="Name"
            clearable
            solo
            rounded
          ></v-text-field>
          <v-text-field
            v-model.trim="product.input.desc"
            label="Description"
            clearable
            solo
            rounded
          ></v-text-field>
          <v-text-field
            v-model.number="product.input.basePrice"
            :rules="rules.basePrice"
            type="number"
            label="Base Price"
            clearable
            solo
            rounded
          ></v-text-field>
          <v-text-field
            v-model.number="product.input.profit"
            :rules="rules.profit"
            type="number"
            label="Profit"
            clearable
            solo
            rounded
          ></v-text-field>
          <v-text-field
            v-model.number="product.input.stock"
            :rules="rules.stock"
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
          <v-btn
            text
            @click="CreateProduct"
            :disabled="
              !product.input.name ||
              !product.input.basePrice ||
              !product.input.profit ||
              !product.input.stock
            "
            >Save</v-btn
          >
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
      return this.$store.getters.getProducts;
    },
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
      rules: {
        name: [(v) => !!v || "Name field is required"],
        basePrice: [(v) => !!v || "Base Price field is required"],
        profit: [(v) => !!v || "Profit field is required"],
        stock: [(v) => !!v || "Stock field is required"],
      },
    };
  },
  apollo: {
    products: {
      query: GET_PRODUCT,
      update: ({ Products }) => Products.product,
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
        const { id: companyDetailId } = this.$store.getters.getCompanyDetails;
        const { basePrice, profit, stock, ...input } = this.product.input;
        const result = await this.$apollo.mutate({
          mutation: CREATE_PRODUCT,
          variables: {
            input: {
              ...input,
              companyDetailId,
              basePrice: parseFloat(basePrice),
              profit: parseInt(profit),
              stock: parseInt(stock),
            },
          },
        });
        const { ok, product, error } = result.data.createProduct;
        if (!ok) alert(error.message);
        else {
          this.$store.commit("addProduct", product);
          this.product.dialog = !this.product.dialog;
        }
      } catch ({ message }) {
        alert(message);
      }
    },
  },
};
</script>

<style></style>
