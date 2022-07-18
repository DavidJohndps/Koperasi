<template>
  <v-container>
    <v-card width="70%">
      <div style="outline-style: solid">
        <p class="text-center">{{ CompanyDetail.name }}</p>
        <p class="text-center">Laporan Neraca Keuangan</p>
        <p class="text-center">Periode {{ Today }}</p>
      </div>
      <v-card-text v-show="isProductLoading">
        <v-row>
          <!-- Aset Cepat Cair & Tetap -->
          <v-col class="h-100" style="outline-style: solid">
            <v-row>
              <!-- Asset Cepat Cair-->
              <v-col cols="12">
                <h2>ASET LANCAR</h2>
                <v-row>
                  <!-- Uang -->
                  <v-col cols="12">
                    <v-row>
                      <v-col> Kas </v-col>
                      <v-col v-text="CompanyDetail.balance" class="text-right">
                      </v-col>
                    </v-row>
                  </v-col>
                  <!-- Besar Inventory -->
                  <v-col cols="12">
                    <v-row>
                      <v-col> Persediaan </v-col>
                      <v-col v-text="InventoryNetworth" class="text-right">
                      </v-col>
                    </v-row>
                  </v-col>
                  <!-- Jumlah Asset Lancar -->
                  <v-col cols="12">
                    <v-row>
                      <v-col>
                        <h3>Jumlah Aset Lancar</h3>
                      </v-col>
                      <v-col
                        v-text="TotalCashFlow"
                        class="text-right text-decoration-underline font-weight-medium"
                      ></v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-col>
              <!-- Asset Tetap -->
              <v-col cols="12">
                <h2>ASET TIDAK LANCAR</h2>
                <v-row>
                  <v-col
                    cols="12"
                    v-for="Asset of CompanyAsset"
                    :key="Asset.name"
                  >
                    <v-row>
                      <v-col v-text="upperFirst(Asset.name)"></v-col>
                      <v-col v-text="Asset.total" class="text-right"></v-col>
                    </v-row>
                  </v-col>
                  <v-col cols="12">
                    <v-row>
                      <v-col>Akumulasi Penyusutan Asset Tetap</v-col>
                      <v-col
                        v-text="AssetDepreciation"
                        class="text-right"
                      ></v-col>
                    </v-row>
                  </v-col>
                  <!-- Jumlah Aset Tidak Lancar -->
                  <v-col cols="12">
                    <v-row>
                      <v-col>
                        <h3>Jumlah Aset Tidak Lancar</h3>
                      </v-col>
                      <v-col
                        v-text="TotalAssetNetworth"
                        class="text-right text-decoration-underline font-weight-medium"
                      ></v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-col>
              <!-- Jumlah Asset -->
              <v-col cols="12">
                <v-row>
                  <v-col>
                    <h2>Jumlah Aset</h2>
                  </v-col>
                  <v-col
                    v-text="TotalAssetNetworth + TotalCashFlow"
                    class="text-right text-decoration-underline font-weight-bold"
                  ></v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-col>
          <!-- Liablitas & Ekuitas -->
          <v-col class="h-100" style="outline-style: solid">
            <v-row>
              <!-- Liabilitas -->
              <v-col cols="12">
                <h2>LIABILITAS</h2>
              </v-col>
              <!-- Ekuitas -->
              <v-col cols="12">
                <h2>EKUITAS</h2>
                <v-row>
                  <v-col
                    cols="12"
                    v-for="budget of CompanyBudget"
                    :key="budget.key"
                  >
                    <v-row>
                      <v-col>Modal {{ budget.key }}</v-col>
                      <v-col v-text="budget.total" class="text-right"></v-col>
                    </v-row>
                  </v-col>
                  <!-- Laba Berjalan -->
                  <v-col cols="12">
                    <v-row>
                      <v-col> Laba Berjalan </v-col>
                      <v-col
                        class="text-right"
                        v-text="CompanyDetail.netProfit - AssetDepreciation"
                      ></v-col>
                    </v-row>
                  </v-col>
                  <v-col cols="12">
                    <v-row>
                      <v-col>
                        <h3>Jumlah Ekuitas</h3>
                      </v-col>
                      <v-col
                        v-text="TotalEquity"
                        class="text-right text-decoration-underline font-weight-medium"
                      ></v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-col>
              <!-- Jumlah Kewajiban & Ekuitas -->
              <v-col cols="12">
                <v-row>
                  <v-col>
                    <h2>JUMLAH KEWAJIBAN DAN EKUITAS</h2>
                  </v-col>
                  <v-col
                    v-text="TotalEquity"
                    class="text-right text-decoration-underline font-weight-bold"
                  ></v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-btn @click="generateFile">Download</v-btn>
    <Vue-html2pdf
      v-show="false"
      :show-layout="true"
      :float-layout="true"
      :enable-download="true"
      :preview-modal="true"
      :paginate-elements-by-height="1400"
      filename="Neraca"
      :pdf-quality="2"
      :manual-pagination="false"
      pdf-format="a4"
      pdf-orientation="portrait"
      pdf-content-width="800px"
      ref="html2Pdf"
    >
      <section slot="pdf-content">
        <section class="v-card v-sheet theme--light" width="70%">
          <div style="outline-style: solid">
            <p class="text-center">{{ CompanyDetail.name }}</p>
            <p class="text-center">Laporan Neraca Keuangan</p>
            <p class="text-center">Periode {{ Today }}</p>
          </div>
          <section class="v-card__text" v-show="isProductLoading">
            <div class="row">
              <!-- Aset Cepat Cair & Tetap -->
              <div class="h-100 col" style="outline-style: solid">
                <div class="row">
                  <!-- Asset Cepat Cair-->
                  <div class="col col-12">
                    <h2>ASET LANCAR</h2>
                    <div class="row">
                      <!-- Uang -->
                      <div class="col col-12" cols="12">
                        <div class="row">
                          <div class="col">Kas</div>
                          <div
                            class="col text-right"
                            v-text="CompanyDetail.balance"
                          ></div>
                        </div>
                      </div>
                      <!-- Besar Inventory -->
                      <div class="col col-12" cols="12">
                        <div class="row">
                          <div class="col">Persediaan</div>
                          <div
                            v-text="InventoryNetworth"
                            class="col text-right"
                          ></div>
                        </div>
                      </div>
                      <!-- Jumlah Asset Lancar -->
                      <div class="col col-12" cols="12">
                        <div class="row">
                          <div class="col">
                            <h3>Jumlah Aset Lancar</h3>
                          </div>
                          <div
                            v-text="TotalCashFlow"
                            class="col text-right text-decoration-underline font-weight-medium"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- Asset Tetap -->
                  <div class="col col-12" cols="12">
                    <h2>ASET TIDAK LANCAR</h2>
                    <div class="row">
                      <div
                        class="col col-12"
                        cols="12"
                        v-for="Asset of CompanyAsset"
                        :key="Asset.name"
                      >
                        <div class="row">
                          <div
                            class="col"
                            v-text="upperFirst(Asset.name)"
                          ></div>
                          <div
                            v-text="Asset.total"
                            class="col text-right"
                          ></div>
                        </div>
                      </div>
                      <div class="col col-12" cols="12">
                        <div class="row">
                          <div class="col">
                            Akumulasi Penyusutan Asset Tetap
                          </div>
                          <div
                            v-text="AssetDepreciation"
                            class="col text-right"
                          ></div>
                        </div>
                      </div>
                      <!-- Jumlah Aset Tidak Lancar -->
                      <div class="col col-12" cols="12">
                        <div class="row">
                          <div class="col">
                            <h3>Jumlah Aset Tidak Lancar</h3>
                          </div>
                          <div
                            v-text="TotalAssetNetworth"
                            class="col text-right text-decoration-underline font-weight-medium"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- Jumlah Asset -->
                  <div class="col col-12" cols="12">
                    <div class="row">
                      <div class="col">
                        <h2>Jumlah Aset</h2>
                      </div>
                      <div
                        v-text="TotalAssetNetworth + TotalCashFlow"
                        class="col text-right text-decoration-underline font-weight-bold"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Liablitas & Ekuitas -->
              <div class="col h-100" style="outline-style: solid">
                <div class="row">
                  <!-- Liabilitas -->
                  <div class="col col-12">
                    <h2>LIABILITAS</h2>
                  </div>
                  <!-- Ekuitas -->
                  <div class="col col-12">
                    <h2>EKUITAS</h2>
                    <div class="row">
                      <div
                        class="col-12"
                        v-for="budget of CompanyBudget"
                        :key="budget.key"
                      >
                        <div class="row">
                          <div class="col">Modal {{ budget.key }}</div>
                          <div class="col text-right">{{ budget.total }}</div>
                        </div>
                      </div>
                      <!-- Laba Berjalan -->
                      <div class="col-12">
                        <div class="row">
                          <div class="col">Laba Berjalan</div>
                          <div class="col text-right">
                            {{ CompanyDetail.netProfit }}
                          </div>
                        </div>
                      </div>
                      <div class="col-12">
                        <div class="row">
                          <div class="col">
                            <h3>Jumlah Ekuitas</h3>
                          </div>
                          <div
                            class="col text-right text-decoration-underline font-weight-medium"
                          >
                            {{ CompanyDetail.netProfit }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- Jumlah Kewajiban & Ekuitas -->
                  <v-col cols="12">
                    <v-row>
                      <v-col>
                        <h2>JUMLAH KEWAJIBAN DAN EKUITAS</h2>
                      </v-col>
                      <v-col
                        v-text="CompanyDetail.netProfit"
                        class="text-right text-decoration-underline font-weight-bold"
                      ></v-col>
                    </v-row>
                  </v-col>
                </div>
              </div>
            </div>
          </section>
        </section>
      </section>
    </Vue-html2pdf>
  </v-container>
</template>

<script>
import VueHtml2pdf from "vue-html2pdf";

import store from "../store";
import { map, groupBy, upperFirst } from "lodash";
import moment from "moment";

import GET_PRODUCT from "../graphql/GetProduct.gql";
import GET_BUDGET from "../graphql/GetBudget.gql";
export default {
  mounted() {
    // this.generateFile();
  },
  computed: {
    Today() {
      return moment(moment.now()).format("LL");
    },
    CompanyDetail() {
      return this.$store.getters.getCompanyDetails;
    },
    CompanyBudget() {
      const budgets = this.budgets;
      const grouped = groupBy(budgets, (budget) => budget.user.username);
      const mapped = map(grouped, (group, key) => {
        let total = 0;
        for (var budget of group) {
          total += budget.amount;
        }
        return { key, total };
      });
      return mapped;
    },
    TotalCompanyBudget() {
      let total = 0;
      for (var budget of this.CompanyBudget) {
        total += budget.total;
      }
      return total;
    },
    CompanyAsset() {
      const { intangibleAsset, propertyAsset, tangibleAsset } =
        this.CompanyDetail;
      var Asset = {
        intangibleAsset: {
          list: intangibleAsset,
        },
        propertyAsset: {
          list: propertyAsset,
        },
        tangibleAsset: {
          list: tangibleAsset,
        },
      };
      for (var name of Object.keys(Asset)) Asset[name].name = name;

      return map(Asset, (assetCategory) => {
        let depTotal = 0,
          total = 0;
        for (var item of assetCategory.list) {
          depTotal += item.boughtPrice * item.depAmount;
          total += item.boughtPrice;
        }
        assetCategory.depTotal = depTotal;
        assetCategory.total = total;
        return assetCategory;
      });
    },
    TotalCashFlow() {
      return this.CompanyDetail.balance + this.InventoryNetworth;
    },
    InventoryNetworth() {
      const products = this.products;
      let total = 0;
      for (var product of products) {
        total += parseFloat(product.basePrice * parseFloat(product.stock));
      }
      return total;
    },
    AssetDepreciation() {
      const companyAsset = this.CompanyAsset;
      let total = 0;
      for (var asset of companyAsset) {
        total += asset.depTotal;
      }
      return total;
    },
    TotalAssetNetworth() {
      const Asset = this.CompanyAsset;
      const assetDepTotal = this.AssetDepreciation;
      let total = 0;
      for (var asset of Asset) total += asset.total;
      return (total -= assetDepTotal);
    },
    TotalEquity() {
      const assetDepreciation = this.AssetDepreciation;
      const { netProfit } = this.CompanyDetail;
      const totalBudget = this.TotalCompanyBudget;
      return totalBudget + netProfit - assetDepreciation;
    },
    isProductLoading() {
      const loading =
        this.$apollo.queries.products.loading &&
        this.$apollo.queries.budgets.loading;
      if (loading) return false;
      else return true;
    },
  },
  apollo: {
    products: {
      query: GET_PRODUCT,
      update: ({ Products }) => Products.product,
      result({ data }) {
        store.commit("addProduct", data.Products.product);
      },
    },
    budgets: {
      query: GET_BUDGET,
      update: ({ Budgets }) => Budgets.budget,
    },
  },
  methods: {
    map,
    moment,
    upperFirst,
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
.v-application p {
  margin-bottom: 16px;
}
.v-application .font-weight-medium {
  font-weight: 500 !important;
}
.v-application .font-weight-bold {
  font-weight: 700 !important;
}
.v-application .text-right {
  text-align: right !important;
}
.v-application .text-center {
  text-align: center !important;
}
.v-application .text-decoration-underline {
  text-decoration: underline !important;
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
.v-card__text {
  padding: 16px;
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
</style>
