<template>
  <v-card class="my-2">
    <v-card-title>{{ product.name }}</v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12">
          <v-row>
            <v-col cols="4">
              <v-chip>Description</v-chip>
            </v-col>
            <v-col>{{ product.desc }}</v-col>
          </v-row>
        </v-col>
        <v-col cols="12">
          <v-row>
            <v-col cols="4">
              <v-chip>Base Price</v-chip>
            </v-col>
            <v-col>{{ product.basePrice }}</v-col>
          </v-row>
        </v-col>
        <v-col cols="12">
          <v-row>
            <v-col cols="4">
              <v-chip>Profit</v-chip>
            </v-col>
            <v-col>{{ product.profit }}</v-col>
          </v-row>
        </v-col>
        <v-col cols="12">
          <v-row>
            <v-col cols="4">
              <v-chip>Stock</v-chip>
            </v-col>
            <v-col>{{ product.stock }}</v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        color="red"
        @click="deleteProduct"
        v-show="CurrentRoute === 'Products'"
      >
        Delete
      </v-btn>
      <v-btn
        color="primary"
        dark
        v-show="CurrentRoute === 'Products'"
        @click="select(product)"
      >
        Update
      </v-btn>
    </v-card-actions>
    <v-dialog v-model="dialog" persistent max-width="50%">
      <v-card>
        <v-card-title class="text-h5"> Update Product </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-text-field v-model.trim="input.name" :rules="rules.name" label="Name"></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model.trim="input.desc"
                label="Description"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model.number="input.basePrice"
                :rules="rules.basePrice"
                type="number"
                label="Base Price"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model.number="input.profit"
                :rules="rules.profit"
                type="number"
                label="Profit"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model.number="input.stock"
                :rules="rules.stock"
                type="number"
                label="Stock"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click="cancel"> Disagree </v-btn>
          <v-btn color="green darken-1" text @click="updateProduct" :disabled="!input.name || !input.basePrice || !input.profit || !input.stock">
            Agree
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import UPDATE_PRODUCT from "../graphql/updateProduct.gql";
import DELETE_PRODUCT from "../graphql/deleteProduct.gql";
export default {
  props: ["product"],
  emit: ["updatedProduct"],
  computed: {
    CurrentRoute() {
      return this.$store.getters.getCurrentRoute;
    },
  },
  data() {
    return {
      input: {
        id: null,
        name: null,
        desc: null,
        basePrice: null,
        profit: null,
        stock: null,
      },
      rules: {
        name: [v => !!v || 'Name field is required'],
        basePrice: [v => !!v || 'Base Price field is required'],
        profit: [v => !!v || 'Profit field is required'],
        stock: [v => !!v || 'Stock field is required'],
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
        const { id: companyDetailId } = this.$store.getters.getCompanyDetails;
        const { basePrice, stock, profit, ...input } = this.input;
        const result = await this.$apollo.mutate({
          mutation: UPDATE_PRODUCT,
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
        const { ok, product, error } = await result.data.updateProduct;
        if (!ok) alert(error.message);
        else {
          this.$store.commit("updateProduct", product);
          this.$emit("updatedProduct");
          this.dialog = !this.dialog;
        }
      } catch ({ message }) {
        alert(message);
      }
    },
    async deleteProduct() {
      try {
        const {id: companyDetailId} = this.$store.getters.getCompanyDetails
        const result = await this.$apollo.mutate({
          mutation: DELETE_PRODUCT,
          variables: {
            companyDetailId,
            id: this.product.id,
          },
        });
        const { ok, error } = result.data.deleteProduct;
        if (!ok) alert(error.message);
        else {
          this.$store.commit("deleteProduct", this.product);
        }
      } catch ({ message }) {
        alert(message)
      }
    },
  },
};
</script>

<style></style>
