<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-simple-table>
          <template v-slot:default>
            <thead>
              <tr>
                <th>Name</th>
                <th>Jumlah</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <!-- Pendapatan (Kotor)-->
              <tr>
                <td>Pendapatan</td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>Penjualan bersih</td>
                <td>{{ CompanyDetail.revenue }}</td>
                <td></td>
              </tr>
              <tr>
                <td>Total Pendapatan</td>
                <td></td>
                <td>{{ CompanyDetail.revenue }}</td>
              </tr>
              <!-- Beban -->
              <tr>
                <td>Beban</td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>Harga Pokok Penjualan</td>
                <td>{{ TotalCostOfGoods }}</td>
                <td></td>
              </tr>
              <tr v-for="(expense, index) in Expenses" :key="index">
                <td>{{ expense.name }}</td>
                <td>{{ expense.total }}</td>
                <td></td>
              </tr>
              <tr>
                <td>Akumulasi Penyusutan Asset</td>
                <td>{{ TotalAssetDepreciation }}</td>
                <td></td>
              </tr>
              <tr>
                <td>Total Beban</td>
                <td></td>
                <td>{{ TotalExpense + TotalAssetDepreciation }}</td>
              </tr>
              <!-- Laba -->
              <tr>
                <td>Laba Sebelum Pajak</td>
                <td></td>
                <td>{{ NetProfitBeforeTax }}</td>
              </tr>
              <tr>
                <td>Pajak</td>
                <td></td>
                <td>{{ NetProfitBeforeTax * 0.05 }}</td>
              </tr>
              <tr>
                <td>Laba Bersih</td>
                <td></td>
                <td>{{ NetProfitAfterTax }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-col>
    </v-row>
    <v-btn @click="generateFile">Download</v-btn>
    <Vue-html2pdf
      v-show="false"
      :show-layout="true"
      :float-layout="true"
      :enable-download="true"
      :preview-modal="true"
      :paginate-elements-by-height="1400"
      filename="LabaRugi"
      :pdf-quality="2"
      :manual-pagination="false"
      pdf-format="a4"
      pdf-orientation="portrait"
      pdf-content-width="800px"
      ref="html2Pdf"
    >
      <section class="v-main" slot="pdf-content">
        <div class="v-main__wrap">
          <div class="container">
            <div class="row">
              <div class="col col-12">
                <div class="v-data-table theme--light">
                  <div class="v-data-table__wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Jumlah</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Pendapatan</td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr>
                          <td>Penjualan Bersih</td>
                          <td>{{ CompanyDetail.revenue }}</td>
                          <td></td>
                        </tr>
                        <tr>
                          <td>Total Pendapatan</td>
                          <td></td>
                          <td>{{ CompanyDetail.revenue }}</td>
                        </tr>
                        <tr>
                          <td>Beban</td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr>
                          <td>Harga Pokok Penjualan</td>
                          <td>{{ TotalCostOfGoods }}</td>
                          <td></td>
                        </tr>
                        <tr v-for="(expense, index) in Expenses" :key="index">
                          <td>{{ expense.name }}</td>
                          <td>{{ expense.total }}</td>
                          <td></td>
                        </tr>
                        <tr>
                          <td>Akumulasi Penyusutan Asset</td>
                          <td>{{ TotalAssetDepreciation }}</td>
                          <td></td>
                        </tr>
                        <tr>
                          <td>Total Beban</td>
                          <td></td>
                          <td>{{ TotalExpense + TotalAssetDepreciation }}</td>
                        </tr>
                        <tr>
                          <td>Laba Sebelum Pajak</td>
                          <td></td>
                          <td>{{ NetProfitBeforeTax }}</td>
                        </tr>
                        <tr>
                          <td>Pajak</td>
                          <td></td>
                          <td>{{ NetProfitBeforeTax * 0.05 }}</td>
                        </tr>
                        <tr>
                          <td>Laba Bersih</td>
                          <td></td>
                          <td>{{ NetProfitAfterTax }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Vue-html2pdf>
  </v-container>
</template>

<script>
import VueHtml2pdf from "vue-html2pdf";

import GET_EXPENSES from "../graphql/GetExpense.gql";
import { groupBy, map } from "lodash";
export default {
  computed: {
    CompanyDetail() {
      return this.$store.getters.getCompanyDetails;
    },
    TotalCostOfGoods() {
      const { revenue, netProfit } = this.CompanyDetail;
      return revenue - netProfit;
    },
    Expenses() {
      const expenses = this.expenses;
      const grouped = groupBy(expenses, (expense) => expense.expCategory.name);
      const mapped = map(grouped, (category) => {
        let total = 0;
        for (var doc of category) {
          total += doc.amount;
        }
        const name = category[0].expCategory.name;
        return { ...category, name, total };
      });
      return mapped;
    },
    TotalAssetDepreciation() {
      const { tangibleAsset, intangibleAsset, propertyAsset } =
        this.$store.getters.getCompanyDetails;
      let depTotal = 0;
      for (let asset of tangibleAsset)
        depTotal += parseFloat(asset.boughtPrice) * asset.depAmount;
      for (let asset of intangibleAsset)
        depTotal += parseFloat(asset.boughtPrice) * asset.depAmount;
      for (let asset of propertyAsset)
        depTotal += parseFloat(asset.boughtPrice) * asset.depAmount;
      return depTotal;
    },
    TotalExpense() {
      const totalCostOfGoods = this.TotalCostOfGoods;

      var total = 0;
      total += totalCostOfGoods;
      for (var expense of this.Expenses) {
        total += expense.total;
      }
      return total;
    },
    NetProfitBeforeTax() {
      const { revenue } = this.CompanyDetail;
      const expenses = this.TotalExpense;
      const totAssetDep = this.TotalAssetDepreciation;
      return parseFloat(revenue - expenses - totAssetDep);
    },
    NetProfitAfterTax() {
      const netProfitbeforeTax = this.NetProfitBeforeTax;
      const tax = netProfitbeforeTax * 0.05;
      return netProfitbeforeTax - Math.abs(tax);
    },
  },
  apollo: {
    expenses: {
      query: GET_EXPENSES,
      update: ({ Expenses }) => Expenses.expense,
    },
  },
  methods: {
    groupBy,
    map,
    generateFile() {
      this.$refs.html2Pdf.generatePdf();
    },
  },
  components: {
    VueHtml2pdf,
  },
};
</script>

<style scoped>
/*! CSS Used from: https://cdn.jsdelivr.net/npm/@mdi/font@latest/css/materialdesignicons.min.css */
.mdi:before {
  display: inline-block;
  font: normal normal normal 24px/1 "Material Design Icons";
  font-size: inherit;
  text-rendering: auto;
  line-height: inherit;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.mdi-bank-minus::before {
  content: "\F0DB0";
}
.mdi-bank-plus::before {
  content: "\F0DB1";
}
.mdi-calendar-clock::before {
  content: "\F00F0";
}
.mdi-cash-register::before {
  content: "\F0CF4";
}
.mdi-clipboard-text-clock::before {
  content: "\F18F9";
}
.mdi-file-chart::before {
  content: "\F0215";
}
.mdi-inbox-multiple::before {
  content: "\F08B0";
}
.mdi-logout::before {
  content: "\F0343";
}
.mdi-office-building-cog-outline::before {
  content: "\F194A";
}
.mdi-view-dashboard::before {
  content: "\F056E";
}
/*! CSS Used from: Embedded */
.theme--light.v-application {
  background: #ffffff;
  color: rgba(0, 0, 0, 0.87);
}
.v-application {
  display: flex;
  position: relative;
}
.v-application a {
  cursor: pointer;
}
.v-application--wrap {
  flex: 1 1 auto;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: 100%;
  position: relative;
}
/*! CSS Used from: Embedded */
.v-avatar {
  align-items: center;
  border-radius: 50%;
  display: inline-flex;
  justify-content: center;
  line-height: normal;
  position: relative;
  text-align: center;
  vertical-align: middle;
  overflow: hidden;
}
/*! CSS Used from: Embedded */
.v-application .grey {
  background-color: #9e9e9e !important;
  border-color: #9e9e9e !important;
}
.v-application .grey.lighten-4 {
  background-color: #f5f5f5 !important;
  border-color: #f5f5f5 !important;
}
.v-application .grey.lighten-3 {
  background-color: #eeeeee !important;
  border-color: #eeeeee !important;
}
.v-application .grey.darken-1 {
  background-color: #757575 !important;
  border-color: #757575 !important;
}
*,
::before,
::after {
  background-repeat: no-repeat;
  box-sizing: inherit;
}
::before,
::after {
  text-decoration: inherit;
  vertical-align: inherit;
}
* {
  padding: 0;
  margin: 0;
}
hr {
  overflow: visible;
  height: 0;
}
main {
  display: block;
}
a {
  background-color: transparent;
}
a:active,
a:hover {
  outline-width: 0;
}
.v-application {
  font-family: "Roboto", sans-serif;
  line-height: 1.5;
}
.v-application ::-ms-clear,
.v-application ::-ms-reveal {
  display: none;
}
.v-application .mb-4 {
  margin-bottom: 16px !important;
}
.v-application .pa-4 {
  padding: 16px !important;
}
.v-application .pt-4 {
  padding-top: 16px !important;
}
/*! CSS Used from: Embedded */
.theme--light.v-divider {
  border-color: rgba(0, 0, 0, 0.12);
}
.v-divider {
  display: block;
  flex: 1 1 0px;
  max-width: 100%;
  height: 0px;
  max-height: 0px;
  border: solid;
  border-width: thin 0 0 0;
  transition: inherit;
}
/*! CSS Used from: Embedded */
.theme--light.v-icon {
  color: rgba(0, 0, 0, 0.54);
}
.theme--light.v-icon:focus::after {
  opacity: 0.12;
}
.v-icon.v-icon {
  align-items: center;
  display: inline-flex;
  font-feature-settings: "liga";
  font-size: 24px;
  justify-content: center;
  letter-spacing: normal;
  line-height: 1;
  position: relative;
  text-indent: 0;
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1), visibility 0s;
  vertical-align: middle;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.v-icon.v-icon::after {
  background-color: currentColor;
  border-radius: 50%;
  content: "";
  display: inline-block;
  height: 100%;
  left: 0;
  opacity: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  transform: scale(1.3);
  width: 100%;
  transition: opacity 0.2s cubic-bezier(0.4, 0, 0.6, 1);
}
/*! CSS Used from: Embedded */
.theme--light.v-list {
  background: #ffffff;
  color: rgba(0, 0, 0, 0.87);
}
.v-sheet.v-list {
  border-radius: 0;
}
.v-sheet.v-list:not(.v-sheet--outlined) {
  box-shadow: 0px 0px 0px 0px rgba(0, 0, 0, 0.2),
    0px 0px 0px 0px rgba(0, 0, 0, 0.14), 0px 0px 0px 0px rgba(0, 0, 0, 0.12);
}
.v-list {
  display: block;
  padding: 8px 0;
  position: static;
  transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);
}
.v-list--nav {
  padding-left: 8px;
  padding-right: 8px;
}
.v-list--nav .v-list-item {
  padding: 0 8px;
}
.v-list--nav .v-list-item,
.v-list--nav .v-list-item:before {
  border-radius: 4px;
}
/*! CSS Used from: Embedded */
.theme--light.v-sheet {
  background-color: #ffffff;
  border-color: #ffffff;
  color: rgba(0, 0, 0, 0.87);
}
.v-sheet {
  border-radius: 0;
}
.v-sheet:not(.v-sheet--outlined) {
  box-shadow: 0px 0px 0px 0px rgba(0, 0, 0, 0.2),
    0px 0px 0px 0px rgba(0, 0, 0, 0.14), 0px 0px 0px 0px rgba(0, 0, 0, 0.12);
}
/*! CSS Used from: Embedded */
.theme--light.v-list-item:not(.v-list-item--active):not(.v-list-item--disabled) {
  color: rgba(0, 0, 0, 0.87);
}
.theme--light.v-list-item:hover::before {
  opacity: 0.04;
}
.theme--light.v-list-item:focus::before {
  opacity: 0.12;
}
.v-list-item {
  align-items: center;
  display: flex;
  flex: 1 1 100%;
  letter-spacing: normal;
  min-height: 48px;
  outline: none;
  padding: 0 16px;
  position: relative;
  text-decoration: none;
}
.v-list-item::after {
  content: "";
  min-height: inherit;
  font-size: 0;
}
.v-list-item__action {
  align-self: center;
  margin: 12px 0;
}
.v-list-item__content {
  align-items: center;
  align-self: center;
  display: flex;
  flex-wrap: wrap;
  flex: 1 1;
  overflow: hidden;
  padding: 12px 0;
}
.v-list-item__content > * {
  line-height: 1.1;
  flex: 1 0 100%;
}
.v-application--is-ltr .v-list-item__action:first-child {
  margin-right: 32px;
}
.v-list-item__action {
  display: inline-flex;
  min-width: 24px;
}
.v-list-item .v-list-item__title {
  line-height: 1.2;
}
.v-list-item__title {
  flex: 1 1 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.v-list-item__title {
  align-self: center;
  font-size: 1rem;
}
/*! CSS Used from: Embedded */
.v-main {
  display: flex;
  flex: 1 0 auto;
  max-width: 100%;
  transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.v-main__wrap {
  flex: 1 1 auto;
  max-width: 100%;
  position: relative;
}
/*! CSS Used from: Embedded */
.theme--light.v-navigation-drawer {
  background-color: #ffffff;
}
.theme--light.v-navigation-drawer:not(.v-navigation-drawer--floating)
  .v-navigation-drawer__border {
  background-color: rgba(0, 0, 0, 0.12);
}
.theme--light.v-navigation-drawer .v-divider {
  border-color: rgba(0, 0, 0, 0.12);
}
.v-navigation-drawer {
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;
  left: 0;
  max-width: 100%;
  overflow: hidden;
  pointer-events: auto;
  top: 0;
  transition-duration: 0.2s;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-property: transform, visibility, width;
}
.v-navigation-drawer .v-list:not(.v-select-list) {
  background: inherit;
}
.v-navigation-drawer__border {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 1px;
}
.v-navigation-drawer__content {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}
.v-navigation-drawer--fixed {
  z-index: 6;
}
.v-navigation-drawer--fixed {
  position: fixed;
}
.v-navigation-drawer--mini-variant {
  overflow: hidden;
}
.v-navigation-drawer--mini-variant .v-list-item > *:first-child {
  margin-left: 0;
  margin-right: 0;
}
.v-navigation-drawer--mini-variant .v-list-item > *:not(:first-child) {
  position: absolute !important;
  height: 1px;
  width: 1px;
  overflow: hidden;
  clip: rect(1px, 1px, 1px, 1px);
  white-space: nowrap;
  display: initial;
}
/*! CSS Used from: Embedded */
.container {
  width: 100%;
  padding: 12px;
  margin-right: auto;
  margin-left: auto;
}
@media (min-width: 960px) {
  .container {
    max-width: 900px;
  }
}
@media (min-width: 1264px) {
  .container {
    max-width: 1185px;
  }
}
@media (min-width: 1904px) {
  .container {
    max-width: 1785px;
  }
}
.row {
  display: flex;
  flex-wrap: wrap;
  flex: 1 1 auto;
  margin: -12px;
}
.col,
.col-12 {
  width: 100%;
  padding: 12px;
}
.col {
  flex-basis: 0;
  flex-grow: 1;
  max-width: 100%;
}
.col-12 {
  flex: 0 0 100%;
  max-width: 100%;
}
/*! CSS Used from: Embedded */
.v-application a {
  color: #1976d2;
}
/*! CSS Used from: Embedded */
*[data-v-2d6c7b7c],
[data-v-2d6c7b7c]::before,
[data-v-2d6c7b7c]::after {
  background-repeat: no-repeat;
  box-sizing: inherit;
}
[data-v-2d6c7b7c]::before,
[data-v-2d6c7b7c]::after {
  text-decoration: inherit;
  vertical-align: inherit;
}
*[data-v-2d6c7b7c] {
  padding: 0;
  margin: 0;
}
.container[data-v-2d6c7b7c] {
  width: 100%;
  padding: 12px;
  margin-right: auto;
  margin-left: auto;
}
@media (min-width: 960px) {
  .container[data-v-2d6c7b7c] {
    max-width: 900px;
  }
}
@media (min-width: 1264px) {
  .container[data-v-2d6c7b7c] {
    max-width: 1185px;
  }
}
@media (min-width: 1904px) {
  .container[data-v-2d6c7b7c] {
    max-width: 1785px;
  }
}
.row[data-v-2d6c7b7c] {
  display: flex;
  flex-wrap: wrap;
  flex: 1 1 auto;
  margin: -12px;
}
.col[data-v-2d6c7b7c],
.col-12[data-v-2d6c7b7c] {
  width: 100%;
  padding: 12px;
}
.col[data-v-2d6c7b7c] {
  flex-basis: 0;
  flex-grow: 1;
  max-width: 100%;
}
.col-12[data-v-2d6c7b7c] {
  flex: 0 0 100%;
  max-width: 100%;
}
.v-data-table[data-v-2d6c7b7c] {
  border-radius: 4px;
}
.v-data-table
  > .v-data-table__wrapper
  tbody
  tr:first-child:hover
  td[data-v-2d6c7b7c]:first-child {
  border-top-left-radius: 4px;
}
.v-data-table
  > .v-data-table__wrapper
  tbody
  tr:first-child:hover
  td[data-v-2d6c7b7c]:last-child {
  border-top-right-radius: 4px;
}
.v-data-table
  > .v-data-table__wrapper
  tbody
  tr:last-child:hover
  td[data-v-2d6c7b7c]:first-child {
  border-bottom-left-radius: 4px;
}
.v-data-table
  > .v-data-table__wrapper
  tbody
  tr:last-child:hover
  td[data-v-2d6c7b7c]:last-child {
  border-bottom-right-radius: 4px;
}
.theme--light.v-data-table[data-v-2d6c7b7c] {
  background-color: #ffffff;
  color: rgba(0, 0, 0, 0.87);
}
.theme--light.v-data-table
  > .v-data-table__wrapper
  > table
  > thead
  > tr
  > th[data-v-2d6c7b7c] {
  color: rgba(0, 0, 0, 0.6);
}
.theme--light.v-data-table
  > .v-data-table__wrapper
  > table
  > thead
  > tr:last-child
  > th[data-v-2d6c7b7c] {
  border-bottom: thin solid rgba(0, 0, 0, 0.12);
}
.theme--light.v-data-table
  > .v-data-table__wrapper
  > table
  > tbody
  > tr:not(:last-child)
  > td[data-v-2d6c7b7c]:not(.v-data-table__mobile-row) {
  border-bottom: thin solid rgba(0, 0, 0, 0.12);
}
.theme--light.v-data-table
  > .v-data-table__wrapper
  > table
  > tbody
  > tr:not(:last-child)
  > td[data-v-2d6c7b7c]:last-child {
  border-bottom: thin solid rgba(0, 0, 0, 0.12);
}
.theme--light.v-data-table
  > .v-data-table__wrapper
  > table
  > tbody
  > tr[data-v-2d6c7b7c]:hover:not(.v-data-table__expanded__content):not(.v-data-table__empty-wrapper) {
  background: #eeeeee;
}
.v-data-table[data-v-2d6c7b7c] {
  line-height: 1.5;
  max-width: 100%;
}
.v-data-table
  > .v-data-table__wrapper
  > table
  > tbody
  > tr
  > td[data-v-2d6c7b7c],
.v-data-table
  > .v-data-table__wrapper
  > table
  > thead
  > tr
  > th[data-v-2d6c7b7c] {
  padding: 0 16px;
  transition: height 0.2s cubic-bezier(0.4, 0, 0.6, 1);
}
.v-data-table
  > .v-data-table__wrapper
  > table
  > thead
  > tr
  > th[data-v-2d6c7b7c] {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  font-size: 0.75rem;
  height: 48px;
}
.v-application--is-ltr
  .v-data-table
  > .v-data-table__wrapper
  > table
  > thead
  > tr
  > th[data-v-2d6c7b7c] {
  text-align: left;
}
.v-data-table
  > .v-data-table__wrapper
  > table
  > tbody
  > tr
  > td[data-v-2d6c7b7c] {
  font-size: 0.875rem;
  height: 48px;
}
/*! CSS Used from: Embedded */
.v-data-table {
  border-radius: 4px;
}
.v-data-table
  > .v-data-table__wrapper
  tbody
  tr:first-child:hover
  td:first-child {
  border-top-left-radius: 4px;
}
.v-data-table
  > .v-data-table__wrapper
  tbody
  tr:first-child:hover
  td:last-child {
  border-top-right-radius: 4px;
}
.v-data-table
  > .v-data-table__wrapper
  tbody
  tr:last-child:hover
  td:first-child {
  border-bottom-left-radius: 4px;
}
.v-data-table > .v-data-table__wrapper tbody tr:last-child:hover td:last-child {
  border-bottom-right-radius: 4px;
}
/*! CSS Used from: Embedded */
.theme--light.v-data-table {
  background-color: #ffffff;
  color: rgba(0, 0, 0, 0.87);
}
.theme--light.v-data-table > .v-data-table__wrapper > table > thead > tr > th {
  color: rgba(0, 0, 0, 0.6);
}
.theme--light.v-data-table
  > .v-data-table__wrapper
  > table
  > thead
  > tr:last-child
  > th {
  border-bottom: thin solid rgba(0, 0, 0, 0.12);
}
.theme--light.v-data-table
  > .v-data-table__wrapper
  > table
  > tbody
  > tr:not(:last-child)
  > td:not(.v-data-table__mobile-row) {
  border-bottom: thin solid rgba(0, 0, 0, 0.12);
}
.theme--light.v-data-table
  > .v-data-table__wrapper
  > table
  > tbody
  > tr:not(:last-child)
  > td:last-child {
  border-bottom: thin solid rgba(0, 0, 0, 0.12);
}
.theme--light.v-data-table
  > .v-data-table__wrapper
  > table
  > tbody
  > tr:hover:not(.v-data-table__expanded__content):not(.v-data-table__empty-wrapper) {
  background: #eeeeee;
}
.v-data-table {
  line-height: 1.5;
  max-width: 100%;
}
.v-data-table > .v-data-table__wrapper > table {
  width: 100%;
  border-spacing: 0;
}
.v-data-table > .v-data-table__wrapper > table > tbody > tr > td,
.v-data-table > .v-data-table__wrapper > table > thead > tr > th {
  padding: 0 16px;
  transition: height 0.2s cubic-bezier(0.4, 0, 0.6, 1);
}
.v-data-table > .v-data-table__wrapper > table > thead > tr > th {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  font-size: 0.75rem;
  height: 48px;
}
.v-application--is-ltr
  .v-data-table
  > .v-data-table__wrapper
  > table
  > thead
  > tr
  > th {
  text-align: left;
}
.v-data-table > .v-data-table__wrapper > table > tbody > tr > td {
  font-size: 0.875rem;
  height: 48px;
}
.v-data-table__wrapper {
  overflow-x: auto;
  overflow-y: hidden;
}
/*! CSS Used fontfaces */
@font-face {
  font-family: "Material Design Icons";
  src: url("https://cdn.jsdelivr.net/npm/@mdi/font@latest/fonts/materialdesignicons-webfont.eot?v=6.7.96");
  src: url("https://cdn.jsdelivr.net/npm/@mdi/font@latest/fonts/materialdesignicons-webfont.eot#iefix&v=6.7.96")
      format("embedded-opentype"),
    url("https://cdn.jsdelivr.net/npm/@mdi/font@latest/fonts/materialdesignicons-webfont.woff2?v=6.7.96")
      format("woff2"),
    url("https://cdn.jsdelivr.net/npm/@mdi/font@latest/fonts/materialdesignicons-webfont.woff?v=6.7.96")
      format("woff"),
    url("https://cdn.jsdelivr.net/npm/@mdi/font@latest/fonts/materialdesignicons-webfont.ttf?v=6.7.96")
      format("truetype");
  font-weight: normal;
  font-style: normal;
}
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 100;
  src: url(https://fonts.gstatic.com/s/roboto/v30/KFOkCnqEu92Fr1MmgVxFIzIFKw.woff2)
    format("woff2");
  unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F,
    U+FE2E-FE2F;
}
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 100;
  src: url(https://fonts.gstatic.com/s/roboto/v30/KFOkCnqEu92Fr1MmgVxMIzIFKw.woff2)
    format("woff2");
  unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
}
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 100;
  src: url(https://fonts.gstatic.com/s/roboto/v30/KFOkCnqEu92Fr1MmgVxEIzIFKw.woff2)
    format("woff2");
  unicode-range: U+1F00-1FFF;
}
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 100;
  src: url(https://fonts.gstatic.com/s/roboto/v30/KFOkCnqEu92Fr1MmgVxLIzIFKw.woff2)
    format("woff2");
  unicode-range: U+0370-03FF;
}
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 100;
  src: url(https://fonts.gstatic.com/s/roboto/v30/KFOkCnqEu92Fr1MmgVxHIzIFKw.woff2)
    format("woff2");
  unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1,
    U+01AF-01B0, U+1EA0-1EF9, U+20AB;
}
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 100;
  src: url(https://fonts.gstatic.com/s/roboto/v30/KFOkCnqEu92Fr1MmgVxGIzIFKw.woff2)
    format("woff2");
  unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB,
    U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 100;
  src: url(https://fonts.gstatic.com/s/roboto/v30/KFOkCnqEu92Fr1MmgVxIIzI.woff2)
    format("woff2");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
    U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215,
    U+FEFF, U+FFFD;
}
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 300;
  src: url(https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmSU5fCRc4EsA.woff2)
    format("woff2");
  unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F,
    U+FE2E-FE2F;
}
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 300;
  src: url(https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmSU5fABc4EsA.woff2)
    format("woff2");
  unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
}
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 300;
  src: url(https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmSU5fCBc4EsA.woff2)
    format("woff2");
  unicode-range: U+1F00-1FFF;
}
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 300;
  src: url(https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmSU5fBxc4EsA.woff2)
    format("woff2");
  unicode-range: U+0370-03FF;
}
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 300;
  src: url(https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmSU5fCxc4EsA.woff2)
    format("woff2");
  unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1,
    U+01AF-01B0, U+1EA0-1EF9, U+20AB;
}
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 300;
  src: url(https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmSU5fChc4EsA.woff2)
    format("woff2");
  unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB,
    U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 300;
  src: url(https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmSU5fBBc4.woff2)
    format("woff2");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
    U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215,
    U+FEFF, U+FFFD;
}
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 400;
  src: url(https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu72xKOzY.woff2)
    format("woff2");
  unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F,
    U+FE2E-FE2F;
}
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 400;
  src: url(https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu5mxKOzY.woff2)
    format("woff2");
  unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
}
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 400;
  src: url(https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu7mxKOzY.woff2)
    format("woff2");
  unicode-range: U+1F00-1FFF;
}
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 400;
  src: url(https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4WxKOzY.woff2)
    format("woff2");
  unicode-range: U+0370-03FF;
}
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 400;
  src: url(https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu7WxKOzY.woff2)
    format("woff2");
  unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1,
    U+01AF-01B0, U+1EA0-1EF9, U+20AB;
}
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 400;
  src: url(https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu7GxKOzY.woff2)
    format("woff2");
  unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB,
    U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 400;
  src: url(https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2)
    format("woff2");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
    U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215,
    U+FEFF, U+FFFD;
}
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 500;
  src: url(https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9fCRc4EsA.woff2)
    format("woff2");
  unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F,
    U+FE2E-FE2F;
}
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 500;
  src: url(https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9fABc4EsA.woff2)
    format("woff2");
  unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
}
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 500;
  src: url(https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9fCBc4EsA.woff2)
    format("woff2");
  unicode-range: U+1F00-1FFF;
}
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 500;
  src: url(https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9fBxc4EsA.woff2)
    format("woff2");
  unicode-range: U+0370-03FF;
}
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 500;
  src: url(https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9fCxc4EsA.woff2)
    format("woff2");
  unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1,
    U+01AF-01B0, U+1EA0-1EF9, U+20AB;
}
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 500;
  src: url(https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9fChc4EsA.woff2)
    format("woff2");
  unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB,
    U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 500;
  src: url(https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9fBBc4.woff2)
    format("woff2");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
    U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215,
    U+FEFF, U+FFFD;
}
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 700;
  src: url(https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfCRc4EsA.woff2)
    format("woff2");
  unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F,
    U+FE2E-FE2F;
}
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 700;
  src: url(https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfABc4EsA.woff2)
    format("woff2");
  unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
}
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 700;
  src: url(https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfCBc4EsA.woff2)
    format("woff2");
  unicode-range: U+1F00-1FFF;
}
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 700;
  src: url(https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBxc4EsA.woff2)
    format("woff2");
  unicode-range: U+0370-03FF;
}
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 700;
  src: url(https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfCxc4EsA.woff2)
    format("woff2");
  unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1,
    U+01AF-01B0, U+1EA0-1EF9, U+20AB;
}
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 700;
  src: url(https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfChc4EsA.woff2)
    format("woff2");
  unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB,
    U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 700;
  src: url(https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc4.woff2)
    format("woff2");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
    U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215,
    U+FEFF, U+FFFD;
}
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 900;
  src: url(https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmYUtfCRc4EsA.woff2)
    format("woff2");
  unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F,
    U+FE2E-FE2F;
}
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 900;
  src: url(https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmYUtfABc4EsA.woff2)
    format("woff2");
  unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
}
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 900;
  src: url(https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmYUtfCBc4EsA.woff2)
    format("woff2");
  unicode-range: U+1F00-1FFF;
}
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 900;
  src: url(https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmYUtfBxc4EsA.woff2)
    format("woff2");
  unicode-range: U+0370-03FF;
}
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 900;
  src: url(https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmYUtfCxc4EsA.woff2)
    format("woff2");
  unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1,
    U+01AF-01B0, U+1EA0-1EF9, U+20AB;
}
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 900;
  src: url(https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmYUtfChc4EsA.woff2)
    format("woff2");
  unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB,
    U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 900;
  src: url(https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmYUtfBBc4.woff2)
    format("woff2");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
    U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215,
    U+FEFF, U+FFFD;
}
</style>

<style scoped>
/*! CSS Used from: Embedded */
*,
::before,
::after {
  background-repeat: no-repeat;
  box-sizing: inherit;
}
::before,
::after {
  text-decoration: inherit;
  vertical-align: inherit;
}
* {
  padding: 0;
  margin: 0;
}
.v-application ::-ms-clear,
.v-application ::-ms-reveal {
  display: none;
}
/*! CSS Used from: Embedded */
.v-main__wrap {
  flex: 1 1 auto;
  max-width: 100%;
  position: relative;
}
/*! CSS Used from: Embedded */
.container {
  width: 100%;
  padding: 12px;
  margin-right: auto;
  margin-left: auto;
}
@media (min-width: 960px) {
  .container {
    max-width: 900px;
  }
}
@media (min-width: 1264px) {
  .container {
    max-width: 1185px;
  }
}
@media (min-width: 1904px) {
  .container {
    max-width: 1785px;
  }
}
.row {
  display: flex;
  flex-wrap: wrap;
  flex: 1 1 auto;
  margin: -12px;
}
.col,
.col-12 {
  width: 100%;
  padding: 12px;
}
.col {
  flex-basis: 0;
  flex-grow: 1;
  max-width: 100%;
}
.col-12 {
  flex: 0 0 100%;
  max-width: 100%;
}
/*! CSS Used from: Embedded */
.v-data-table {
  border-radius: 4px;
}
.v-data-table
  > .v-data-table__wrapper
  tbody
  tr:first-child:hover
  td:first-child {
  border-top-left-radius: 4px;
}
.v-data-table
  > .v-data-table__wrapper
  tbody
  tr:first-child:hover
  td:last-child {
  border-top-right-radius: 4px;
}
.v-data-table
  > .v-data-table__wrapper
  tbody
  tr:last-child:hover
  td:first-child {
  border-bottom-left-radius: 4px;
}
.v-data-table > .v-data-table__wrapper tbody tr:last-child:hover td:last-child {
  border-bottom-right-radius: 4px;
}
/*! CSS Used from: Embedded */
.theme--light.v-data-table {
  background-color: #ffffff;
  color: rgba(0, 0, 0, 0.87);
}
.theme--light.v-data-table > .v-data-table__wrapper > table > thead > tr > th {
  color: rgba(0, 0, 0, 0.6);
}
.theme--light.v-data-table
  > .v-data-table__wrapper
  > table
  > thead
  > tr:last-child
  > th {
  border-bottom: thin solid rgba(0, 0, 0, 0.12);
}
.theme--light.v-data-table
  > .v-data-table__wrapper
  > table
  > tbody
  > tr:not(:last-child)
  > td:not(.v-data-table__mobile-row) {
  border-bottom: thin solid rgba(0, 0, 0, 0.12);
}
.theme--light.v-data-table
  > .v-data-table__wrapper
  > table
  > tbody
  > tr:not(:last-child)
  > td:last-child {
  border-bottom: thin solid rgba(0, 0, 0, 0.12);
}
.theme--light.v-data-table
  > .v-data-table__wrapper
  > table
  > tbody
  > tr:hover:not(.v-data-table__expanded__content):not(.v-data-table__empty-wrapper) {
  background: #eeeeee;
}
.v-data-table {
  line-height: 1.5;
  max-width: 100%;
}
.v-data-table > .v-data-table__wrapper > table {
  width: 100%;
  border-spacing: 0;
}
.v-data-table > .v-data-table__wrapper > table > tbody > tr > td,
.v-data-table > .v-data-table__wrapper > table > thead > tr > th {
  padding: 0 16px;
  transition: height 0.2s cubic-bezier(0.4, 0, 0.6, 1);
}
.v-data-table > .v-data-table__wrapper > table > thead > tr > th {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  font-size: 0.75rem;
  height: 48px;
}
.v-application--is-ltr
  .v-data-table
  > .v-data-table__wrapper
  > table
  > thead
  > tr
  > th {
  text-align: left;
}
.v-data-table > .v-data-table__wrapper > table > tbody > tr > td {
  font-size: 0.875rem;
  height: 48px;
}
.v-data-table__wrapper {
  overflow-x: auto;
  overflow-y: hidden;
}
</style>
