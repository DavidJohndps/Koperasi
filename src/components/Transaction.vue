<template>
  <v-card class="my-2">
    <v-card-title>Transaction id:<br />{{ transaction.id }}</v-card-title>
    <v-card-text>
      Item:
      <v-spacer></v-spacer>
      <v-divider></v-divider>
      <v-list-item
        two-line
        v-for="(product, index) in transaction.product"
        :key="product.id"
      >
        <v-list-item-content>
          <v-list-item-title>{{ product.name }}</v-list-item-title>
          <v-list-item-subtitle
            >Qty: {{ transaction.qty[index] }} @ {{ Price(transaction.basePrice[index], transaction.profit[index]) }}/
            Pcs</v-list-item-subtitle
          >
        </v-list-item-content>
      </v-list-item>
      Total : {{ transaction.total }}
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      {{ CreatedAt }}, {{ transaction.verBy.username }}
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  props: ["transaction"],
  computed: {
    CreatedAt() {
      let date = new Date(this.transaction.createdAt).toLocaleDateString(
          "id-ID",
          {
            weekday: "long",
            year: "numeric",
            month: "short",
            day: "numeric",
          }
        ),
        time = new Date(this.transaction.createdAt).toLocaleTimeString(
          "id-ID",
          { timeStyle: "short", hour12: true }
        );
      return `${date}, ${time}`;
    },
    Price() {
      return (basePrice, profit) =>
        basePrice * (parseFloat(profit + 100) / 100);
    },
  },
};
</script>

<style></style>
