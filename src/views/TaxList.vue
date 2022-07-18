<template>
  <v-container>
    <v-card>
      <v-card-title class="text-center">List Pembayaran PP23</v-card-title>
      <v-card-text>
        <v-simple-table>
          <template v-slot:default>
            <thead>
              <tr>
                <th>No</th>
                <th>Bulan</th>
                <th>NTPN</th>
                <th>Peredaran Bruto</th>
                <th>PPH</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(report, index) of TaxReport" :key="report.id">
                <td>{{ index + 1 }}</td>
                <td>{{ report.month }}</td>
                <td>{{ report.nptn }}</td>
                <td>{{ report.monthlyIncome }}</td>
                <td>{{ report.amount }}</td>
              </tr>
              <tr>
                <td></td>
                <td></td>
                <td>Jumlah</td>
                <td>{{ Total.annualIncome }}</td>
                <td>{{ Total.annualTax }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-card-text>
    </v-card>
    <Vue-html2pdf
      v-show="false"
      :show-layout="true"
      :float-layout="true"
      :enable-download="true"
      :preview-modal="true"
      :paginate-elements-by-height="1400"
      filename="Pembayaran Pajak"
      :pdf-quality="2"
      :manual-pagination="false"
      pdf-format="a4"
      pdf-orientation="portrait"
      pdf-content-width="800px"
      ref="html2Pdf"
    >
      <section slot="pdf-content">
        <main class="v-main">
          <div class="v-main__wrap">
            <div class="container">
              <div class="v-card v-sheet theme--light">
                <div class="v-card__title text-center">
                  List Pembayaran PP23
                </div>
                <div class="v-card__text">
                  <div class="v-data-table theme--light">
                    <div class="v-data-table__wrapper">
                      <table>
                        <thead>
                          <th>No</th>
                          <th>Bulan</th>
                          <th>NPTN</th>
                          <th>Peredaran Bruto</th>
                          <th>PPH</th>
                        </thead>
                        <tbody>
                          <tr
                            v-for="(report, index) of TaxReport"
                            :key="report.id"
                          >
                            <td>{{ index + 1 }}</td>
                            <td>{{ report.month }}</td>
                            <td>{{ report.nptn }}</td>
                            <td>{{ report.monthlyIncome }}</td>
                            <td>{{ report.amount }}</td>
                          </tr>
                          <tr>
                            <td></td>
                            <td></td>
                            <td>Jumlah</td>
                            <td>{{ Total.annualIncome }}</td>
                            <td>{{ Total.annualTax }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </section>
    </Vue-html2pdf>
    <v-btn @click="generateFile">Download</v-btn>
  </v-container>
</template>

<script>
import VueHtml2pdf from "vue-html2pdf";

import GET_MONTHLY_INCOME from "../graphql/GetMonthlyIncome.gql";
import moment from "moment";
import { map, last } from "lodash";
export default {
  computed: {
    TaxReport() {
      var { taxReport } = this.$store.getters.getCompanyDetails;
      var monthlyIncome = this.monthlyIncome;
      return map(taxReport, (report, index) => {
        report.monthlyIncome = monthlyIncome[index].total;
        report.month = moment(
          monthlyIncome[index].startDate,
          "YYYY-MM-DD"
        ).format("MMMM");
        return report;
      });
    },
    Total() {
      var { taxReport } = this.$store.getters.getCompanyDetails;
      var monthlyIncome = this.monthlyIncome;
      var annualIncome = 0,
        annualTax = 0;
      for (var [index, report] of taxReport.entries()) {
        annualTax += report.amount;
        annualIncome += monthlyIncome[index].total;
      }
      return {
        annualIncome,
        annualTax,
      };
    },
    firstTransaction() {
      const transactions = this.$store.getters.getTransactions;
      return last(transactions);
    },
  },
  apollo: {
    monthlyIncome: {
      query: GET_MONTHLY_INCOME,
      variables() {
        const firstTransaction = this.firstTransaction;
        return {
          startDate: moment(firstTransaction.createdAt).toISOString(),
        };
      },
      update: ({ MonthlyIncomes }) => MonthlyIncomes.monthlyIncome,
    },
  },
  methods: {
    last,
    moment,
    generateFile() {
      this.$refs.html2Pdf.generatePdf();
    }
  },
  components: {
    VueHtml2pdf,
  },
};
</script>

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
main {
  display: block;
}
.v-application ::-ms-clear,
.v-application ::-ms-reveal {
  display: none;
}
.v-application .text-center {
  text-align: center !important;
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
.theme--light.v-card {
  background-color: #ffffff;
  color: rgba(0, 0, 0, 0.87);
}
.theme--light.v-card > .v-card__text {
  color: rgba(0, 0, 0, 0.6);
}
.v-sheet.v-card {
  border-radius: 4px;
}
.v-sheet.v-card:not(.v-sheet--outlined) {
  box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2),
    0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12);
}
.v-card {
  border-width: thin;
  display: block;
  max-width: 100%;
  outline: none;
  text-decoration: none;
  transition-property: box-shadow, opacity;
  overflow-wrap: break-word;
  position: relative;
  white-space: normal;
}
.v-card > *:first-child:not(.v-btn):not(.v-chip):not(.v-avatar) {
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
}
.v-card > *:last-child:not(.v-btn):not(.v-chip):not(.v-avatar) {
  border-bottom-left-radius: inherit;
  border-bottom-right-radius: inherit;
}
.v-card__text {
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.375rem;
  letter-spacing: 0.0071428571em;
}
.v-card__text,
.v-card__title {
  padding: 16px;
}
.v-card__title {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  font-size: 1.25rem;
  font-weight: 500;
  letter-spacing: 0.0125em;
  line-height: 2rem;
  word-break: break-all;
}
.v-card__title + .v-card__text {
  padding-top: 0;
}
.v-card__text {
  width: 100%;
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
/*! CSS Used from: Embedded */
*[data-v-6997d11f],
[data-v-6997d11f]::before,
[data-v-6997d11f]::after {
  background-repeat: no-repeat;
  box-sizing: inherit;
}
[data-v-6997d11f]::before,
[data-v-6997d11f]::after {
  text-decoration: inherit;
  vertical-align: inherit;
}
*[data-v-6997d11f] {
  padding: 0;
  margin: 0;
}
.v-application .text-center[data-v-6997d11f] {
  text-align: center !important;
}
.theme--light.v-sheet[data-v-6997d11f] {
  background-color: #ffffff;
  border-color: #ffffff;
  color: rgba(0, 0, 0, 0.87);
}
.v-sheet[data-v-6997d11f] {
  border-radius: 0;
}
.v-sheet[data-v-6997d11f]:not(.v-sheet--outlined) {
  box-shadow: 0px 0px 0px 0px rgba(0, 0, 0, 0.2),
    0px 0px 0px 0px rgba(0, 0, 0, 0.14), 0px 0px 0px 0px rgba(0, 0, 0, 0.12);
}
.theme--light.v-card[data-v-6997d11f] {
  background-color: #ffffff;
  color: rgba(0, 0, 0, 0.87);
}
.theme--light.v-card > .v-card__text[data-v-6997d11f] {
  color: rgba(0, 0, 0, 0.6);
}
.v-sheet.v-card[data-v-6997d11f] {
  border-radius: 4px;
}
.v-sheet.v-card[data-v-6997d11f]:not(.v-sheet--outlined) {
  box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2),
    0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12);
}
.v-card[data-v-6997d11f] {
  border-width: thin;
  display: block;
  max-width: 100%;
  outline: none;
  text-decoration: none;
  transition-property: box-shadow, opacity;
  overflow-wrap: break-word;
  position: relative;
  white-space: normal;
}
.v-card
  > *[data-v-6997d11f]:first-child:not(.v-btn):not(.v-chip):not(.v-avatar) {
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
}
.v-card
  > *[data-v-6997d11f]:last-child:not(.v-btn):not(.v-chip):not(.v-avatar) {
  border-bottom-left-radius: inherit;
  border-bottom-right-radius: inherit;
}
.v-card__text[data-v-6997d11f] {
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.375rem;
  letter-spacing: 0.0071428571em;
}
.v-card__text[data-v-6997d11f],
.v-card__title[data-v-6997d11f] {
  padding: 16px;
}
.v-card__title[data-v-6997d11f] {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  font-size: 1.25rem;
  font-weight: 500;
  letter-spacing: 0.0125em;
  line-height: 2rem;
  word-break: break-all;
}
.v-card__title + .v-card__text[data-v-6997d11f] {
  padding-top: 0;
}
.v-card__text[data-v-6997d11f] {
  width: 100%;
}
.container[data-v-6997d11f] {
  width: 100%;
  padding: 12px;
  margin-right: auto;
  margin-left: auto;
}
@media (min-width: 960px) {
  .container[data-v-6997d11f] {
    max-width: 900px;
  }
}
@media (min-width: 1264px) {
  .container[data-v-6997d11f] {
    max-width: 1185px;
  }
}
@media (min-width: 1904px) {
  .container[data-v-6997d11f] {
    max-width: 1785px;
  }
}
.v-data-table[data-v-6997d11f] {
  border-radius: 4px;
}
.v-data-table
  > .v-data-table__wrapper
  tbody
  tr:first-child:hover
  td[data-v-6997d11f]:first-child {
  border-top-left-radius: 4px;
}
.v-data-table
  > .v-data-table__wrapper
  tbody
  tr:first-child:hover
  td[data-v-6997d11f]:last-child {
  border-top-right-radius: 4px;
}
.v-data-table
  > .v-data-table__wrapper
  tbody
  tr:last-child:hover
  td[data-v-6997d11f]:first-child {
  border-bottom-left-radius: 4px;
}
.v-data-table
  > .v-data-table__wrapper
  tbody
  tr:last-child:hover
  td[data-v-6997d11f]:last-child {
  border-bottom-right-radius: 4px;
}
.theme--light.v-data-table[data-v-6997d11f] {
  background-color: #ffffff;
  color: rgba(0, 0, 0, 0.87);
}
.theme--light.v-data-table
  > .v-data-table__wrapper
  > table
  > thead
  > tr
  > th[data-v-6997d11f] {
  color: rgba(0, 0, 0, 0.6);
}
.theme--light.v-data-table
  > .v-data-table__wrapper
  > table
  > thead
  > tr:last-child
  > th[data-v-6997d11f] {
  border-bottom: thin solid rgba(0, 0, 0, 0.12);
}
.theme--light.v-data-table
  > .v-data-table__wrapper
  > table
  > tbody
  > tr:not(:last-child)
  > td[data-v-6997d11f]:not(.v-data-table__mobile-row) {
  border-bottom: thin solid rgba(0, 0, 0, 0.12);
}
.theme--light.v-data-table
  > .v-data-table__wrapper
  > table
  > tbody
  > tr:not(:last-child)
  > td[data-v-6997d11f]:last-child {
  border-bottom: thin solid rgba(0, 0, 0, 0.12);
}
.theme--light.v-data-table
  > .v-data-table__wrapper
  > table
  > tbody
  > tr[data-v-6997d11f]:hover:not(.v-data-table__expanded__content):not(.v-data-table__empty-wrapper) {
  background: #eeeeee;
}
.v-data-table[data-v-6997d11f] {
  line-height: 1.5;
  max-width: 100%;
}
.v-data-table
  > .v-data-table__wrapper
  > table
  > tbody
  > tr
  > td[data-v-6997d11f],
.v-data-table
  > .v-data-table__wrapper
  > table
  > thead
  > tr
  > th[data-v-6997d11f] {
  padding: 0 16px;
  transition: height 0.2s cubic-bezier(0.4, 0, 0.6, 1);
}
.v-data-table
  > .v-data-table__wrapper
  > table
  > thead
  > tr
  > th[data-v-6997d11f] {
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
  > th[data-v-6997d11f] {
  text-align: left;
}
.v-data-table
  > .v-data-table__wrapper
  > table
  > tbody
  > tr
  > td[data-v-6997d11f] {
  font-size: 0.875rem;
  height: 48px;
}
</style>
