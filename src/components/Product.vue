<template>
  <v-card class="my-2">
    <v-card-title>{{ product.name }}</v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12">{{ product.desc }}</v-col>
        <v-col cols="12">{{ product.price }}</v-col>
        <v-col cols="12">{{ product.stock }}</v-col>
      </v-row>
    </v-card-text>
    <v-card-actions>
      <v-btn rounded color="primary" dark @click="select(product)">
        Update
      </v-btn>
    </v-card-actions>
    <v-dialog v-model="dialog" persistent max-width="290">
      <v-card>
        <v-card-title class="text-h5"> Update Product </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="input.name" label="Name"></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="input.desc"
                label="Description"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="input.price"
                type="number"
                label="Price"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="input.stock"
                type="number"
                label="Stock"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click="cancel"> Disagree </v-btn>
          <v-btn color="green darken-1" text @click="updateProduct">
            Agree
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import updateProduct from "../graphql/updateProduct.gql";
export default {
  props: ["product"],
  data() {
    return {
      input: {
        id: null,
        name: null,
        desc: null,
        price: null,
        stock: null,
      },
      dialog: false,
    };
  },
  methods: {
    select(selected) {
      Object.keys(this.input).map((key) => {
        this.input[key] = selected[key];
      });
      this.dialog = !this.dialog;
    },
    cancel() {
      Object.keys(this.input).map((key) => (this.input[key] = null));
      this.dialog = !this.dialog;
    },
    async updateProduct() {
      try {
        const { price, stock, ...input } = this.input;
        const result = await this.$apollo.mutate({
          mutation: updateProduct,
          variables: {
            input: {
              ...input,
              price: parseInt(price),
              stock: parseInt(stock),
            },
          },
        });
        const { ok, product, error } = await result.data.updateProduct;
        if (!ok) alert(error);
        else {
          this.$store.commit("updateProduct", product);
          this.dialog = !this.dialog;
        }
      } catch (err) {
        alert(err);
      }
    },
  },
};
</script>

<style></style>
