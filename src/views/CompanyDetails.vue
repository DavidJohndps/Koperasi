<template>
  <v-container>
    <v-card>
      <v-card-title>Company Details</v-card-title>
      <v-card-subtitle>Manage your Company Details</v-card-subtitle>
      <v-divider></v-divider>
      <v-card-text>
        <v-row>
          <!-- Name -->
          <v-col cols="12">
            <v-row>
              <v-col cols="4"> Company name </v-col>
              <v-col>
                <v-text-field
                  v-model.trim="companyDetail.input.name"
                  :rules="rules.name"
                  label="Name"
                  clearable
                  solo
                  rounded
                  @change="companyDetail.edited = true"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-col>
          <!-- NPWP -->
          <v-col cols="12">
            <v-row>
              <v-col cols="4"> NPWP </v-col>
              <v-col>
                <v-text-field
                  v-model.trim="companyDetail.input.npwp"
                  :rules="rules.npwp"
                  label="NPWP"
                  required
                  clearable
                  solo
                  rounded
                  @change="companyDetail.edited = true"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-col>
          <!-- Balance -->
          <v-col cols="12">
            <v-row>
              <v-col cols="4"> Balance </v-col>
              <v-col>
                {{ companyDetail.input.balance || 0 }}
              </v-col>
            </v-row>
          </v-col>
          <!-- Revenue -->
          <v-col cols="12">
            <v-row>
              <v-col cols="4"> Revenue </v-col>
              <v-col>
                {{ companyDetail.input.revenue || 0 }}
              </v-col>
            </v-row>
          </v-col>
          <!-- NetProfit -->
          <v-col cols="12">
            <v-row>
              <v-col cols="4"> Net Profit </v-col>
              <v-col>
                {{ companyDetail.input.netProfit || 0 }}
              </v-col>
            </v-row>
          </v-col>
          <!-- Asset -->
          <v-col cols="12">
            <!-- <v-list two-line outlined>
              <v-list-item-group>
                <template
                  v-for="(tangibleAsset, index) in companyDetail.input
                    .tangibleAsset"
                >
                  <v-list-item :key="tangibleAsset.id" @dblclick="editAsset('tangibleAsset', tangibleAsset)">
                    <template>
                      <v-list-item-content>
                        <v-list-item-title
                          v-text="tangibleAsset.name"
                        ></v-list-item-title>

                        <v-list-item-subtitle
                          class="text--primary"
                          v-text="tangibleAsset.assetCode"
                        ></v-list-item-subtitle>

                        <v-list-item-subtitle>
                          <v-card>
                            <v-card-title>Description</v-card-title>
                            <v-card-text>
                              <div class="py-1">
                                <v-chip>Bough Since</v-chip>
                                {{ tangibleAsset.boughtSince }}
                              </div>
                              <div class="py-1">
                                <v-chip>Bought Price</v-chip>
                                {{ tangibleAsset.boughtPrice }}
                              </div>
                              <div class="py-1">
                                <v-chip>Note</v-chip> {{ tangibleAsset.desc }}
                              </div>
                            </v-card-text>
                          </v-card>
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </template>
                  </v-list-item>

                  <v-divider
                    v-if="index < tangibleAsset.length - 1"
                    :key="index"
                  ></v-divider>
                </template>
              </v-list-item-group>
            </v-list> -->
            <v-tabs v-model="activeTab">
              <v-tab v-for="(tab, index) in companyAssetTabs" :key="index">
                {{ tab }}
              </v-tab>
            </v-tabs>
            <v-tabs-items v-model="activeTab">
              <v-tab-item v-for="(tab, index) in companyAssetTabs" :key="index">
                <!-- {{ companyDetail.input[`${camelCase(tab)}`] }} -->
                <v-card>
                  <v-card-text>
                    <v-list two-line outlined>
                      <v-list-item-group>
                        <template
                          v-for="(asset, index) in companyDetail.input[
                            `${camelCase(tab)}`
                          ]"
                        >
                          <v-list-item
                            :key="asset.id"
                            @dblclick="editAsset(`${camelCase(tab)}`, asset)"
                          >
                            <template>
                              <v-list-item-content>
                                <v-list-item-icon @click="deleteAsset(`${camelCase(tab)}`, asset.id)">
                                  <v-icon>mdi-close</v-icon>
                                </v-list-item-icon>
                                <v-list-item-title
                                  v-text="asset.name"
                                ></v-list-item-title>

                                <v-list-item-subtitle
                                  class="text--primary"
                                  v-text="asset.depCategory"
                                ></v-list-item-subtitle>

                                <v-list-item-subtitle>
                                  <v-card>
                                    <v-card-title>Description</v-card-title>
                                    <v-card-text>
                                      <div class="py-1">
                                        <v-chip>Bough Since</v-chip>
                                        {{ asset.boughtSince }}
                                      </div>
                                      <div class="py-1">
                                        <v-chip>Bought Price</v-chip>
                                        {{ asset.boughtPrice }}
                                      </div>
                                      <div class="py-1">
                                        <v-chip>Note</v-chip>
                                        {{ asset.desc }}
                                      </div>
                                    </v-card-text>
                                  </v-card>
                                </v-list-item-subtitle>
                              </v-list-item-content>
                            </template>
                          </v-list-item>

                          <v-divider
                            v-if="index < asset.length - 1"
                            :key="index"
                          ></v-divider>
                        </template>
                      </v-list-item-group>
                    </v-list>
                  </v-card-text>
                </v-card>
              </v-tab-item>
            </v-tabs-items>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <div v-show="companyDetail.edited">
          <v-btn color="red" @click="discardChanges">Discard</v-btn>
          <v-btn color="primary" @click="updateCompanyDetails"
            >Save Changes</v-btn
          >
        </div>
      </v-card-actions>
    </v-card>
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
      <v-tooltip left>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            fab
            small
            dark
            icon
            color="primary"
            v-bind="attrs"
            v-on="on"
            @click="tangibleAsset.dialog = !tangibleAsset.dialog"
          >
            <v-icon>mdi-bank-plus</v-icon>
          </v-btn>
        </template>
        <span>Add Tangiable Asset</span>
      </v-tooltip>
      <v-tooltip left>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            fab
            small
            dark
            icon
            color="primary"
            v-bind="attrs"
            v-on="on"
            @click="intangibleAsset.dialog = !intangibleAsset.dialog"
          >
            <v-icon>mdi-bank-plus</v-icon>
          </v-btn>
        </template>
        <span>Add intangible Asset</span>
      </v-tooltip>
      <v-tooltip left>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            fab
            small
            dark
            icon
            color="primary"
            v-bind="attrs"
            v-on="on"
            @click="propertyAsset.dialog = !propertyAsset.dialog"
          >
            <v-icon>mdi-bank-plus</v-icon>
          </v-btn>
        </template>
        <span>Add Property Asset</span>
      </v-tooltip>
      <!-- <v-tooltip left>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            fab
            small
            dark
            icon
            color="primary"
            v-bind="attrs"
            v-on="on"
            @click="tangibleAsset.dialog = !tangibleAsset.dialog"
          >
            <v-icon>mdi-office-plus</v-icon>
          </v-btn>
        </template>
        <span>Add Asset</span>
      </v-tooltip> -->
    </v-speed-dial>
    <v-dialog v-model="tangibleAsset.dialog" persistent>
      <v-card>
        <v-toolbar flat>
          <h2>
            {{
              tangibleAsset.input.id
                ? "Update an Tangiable Asset"
                : "Add an Tangible Asset"
            }}
          </h2>
          <v-spacer></v-spacer>
          <v-btn icon @click="closeDialog('tangibleAsset')">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <v-text-field
            v-model.trim="tangibleAsset.input.name"
            :rules="rules.name"
            label="Asset Name"
            clearable
            solo
            rounded
          ></v-text-field>
          <v-select
            v-model="tangibleAsset.input.depCategory"
            :rules="rules.category"
            :items="tangibleAssetCode"
            label="Select"
            rounded
            dense
            solo
            single-line
          ></v-select>
          <v-dialog
            ref="dialog"
            v-model="tangibleAsset.boughtSinceModal"
            :return-value.sync="tangibleAsset.input.boughtSince"
            persistent
            width="290px"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="tangibleAsset.input.boughtSince"
                :rules="rules.date"
                label="Picker in dialog"
                prepend-icon="mdi-calendar"
                readonly
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              :value="tangibleAsset.input.boughtSince"
              @input="(event) => momentFormated(event, 'tangibleAsset')"
            >
              <v-spacer></v-spacer>
              <v-btn
                text
                color="primary"
                @click="
                  tangibleAsset.boughtSinceModal =
                    !tangibleAsset.boughtSinceModal
                "
              >
                Cancel
              </v-btn>
              <v-btn
                text
                color="primary"
                @click="$refs.dialog.save(tangibleAsset.input.boughtSince)"
              >
                OK
              </v-btn>
            </v-date-picker>
          </v-dialog>
          <v-text-field
            v-model.number="tangibleAsset.input.boughtPrice"
            :rules="rules.price"
            :max="CompanyDetail.balance"
            type="number"
            label="Bought Price"
            clearable
            solo
            rounded
          ></v-text-field>
          <v-text-field
            v-model.trim="tangibleAsset.input.desc"
            label="Description"
            clearable
            solo
            rounded
          ></v-text-field>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeDialog('tangibleAsset')">Discard</v-btn>
          <v-btn
            text
            @click="
              tangibleAsset.input.id
                ? updateAsset('tangible')
                : createAsset('tangible')
            "
            :disabled="isDisabled('tangibleAsset')"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="intangibleAsset.dialog" persistent>
      <v-card>
        <v-toolbar flat>
          <h2>
            {{
              intangibleAsset.input.id
                ? "Update an Intangiable Asset"
                : "Add an Intangiable Asset"
            }}
          </h2>
          <v-spacer></v-spacer>
          <v-btn icon @click="closeDialog('intangibleAsset')">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <v-text-field
            v-model.trim="intangibleAsset.input.name"
            :rules="rules.name"
            label="Asset Name"
            clearable
            solo
            rounded
          ></v-text-field>
          <v-select
            v-model="intangibleAsset.input.depCategory"
            :rules="rules.category"
            :items="intangibleAssetCode"
            label="Select"
            rounded
            dense
            solo
            single-line
          ></v-select>
          <v-dialog
            ref="dialog"
            v-model="intangibleAsset.boughtSinceModal"
            :return-value.sync="intangibleAsset.input.boughtSince"
            persistent
            width="290px"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="intangibleAsset.input.boughtSince"
                :rules="rules.date"
                label="Picker in dialog"
                prepend-icon="mdi-calendar"
                readonly
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              :value="intangibleAsset.input.boughtSince"
              @input="(event) => momentFormated(event, 'intangibleAsset')"
            >
              <v-spacer></v-spacer>
              <v-btn
                text
                color="primary"
                @click="
                  intangibleAsset.boughtSinceModal =
                    !intangibleAsset.boughtSinceModal
                "
              >
                Cancel
              </v-btn>
              <v-btn
                text
                color="primary"
                @click="$refs.dialog.save(intangibleAsset.input.boughtSince)"
              >
                OK
              </v-btn>
            </v-date-picker>
          </v-dialog>
          <v-text-field
            v-model.number="intangibleAsset.input.boughtPrice"
            :rules="rules.price"
            :max="CompanyDetail.balance"
            type="number"
            label="Bought Price"
            clearable
            solo
            rounded
          ></v-text-field>
          <v-text-field
            v-model.trim="intangibleAsset.input.desc"
            label="Description"
            clearable
            solo
            rounded
          ></v-text-field>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeDialog('intangibleAsset')">Discard</v-btn>
          <v-btn
            text
            @click="
              intangibleAsset.input.id
                ? updateAsset('intangible')
                : createAsset('intangible')
            "
            :disabled="isDisabled('intangibleAsset')"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="propertyAsset.dialog" persistent>
      <v-card>
        <v-toolbar flat>
          <h2>
            {{
              propertyAsset.input.id
                ? "Update an Property Asset"
                : "Add an Property Asset"
            }}
          </h2>
          <v-spacer></v-spacer>
          <v-btn icon @click="closeDialog('propertyAsset')">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <v-text-field
            v-model.trim="propertyAsset.input.name"
            :rules="rules.name"
            label="Asset Name"
            clearable
            solo
            rounded
          ></v-text-field>
          <v-select
            v-model="propertyAsset.input.depCategory"
            :rules="rules.category"
            :items="propertyAssetCode"
            label="Select"
            rounded
            dense
            solo
            single-line
          ></v-select>
          <v-dialog
            ref="dialog"
            v-model="propertyAsset.boughtSinceModal"
            :return-value.sync="propertyAsset.input.boughtSince"
            persistent
            width="290px"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="propertyAsset.input.boughtSince"
                :rules="rules.date"
                label="Picker in dialog"
                prepend-icon="mdi-calendar"
                readonly
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              :value="propertyAsset.input.boughtSince"
              @input="(event) => momentFormated(event, 'propertyAsset')"
            >
              <v-spacer></v-spacer>
              <v-btn
                text
                color="primary"
                @click="
                  propertyAsset.boughtSinceModal =
                    !propertyAsset.boughtSinceModal
                "
              >
                Cancel
              </v-btn>
              <v-btn
                text
                color="primary"
                @click="$refs.dialog.save(propertyAsset.input.boughtSince)"
              >
                OK
              </v-btn>
            </v-date-picker>
          </v-dialog>
          <v-text-field
            v-model.number="propertyAsset.input.boughtPrice"
            :rules="rules.price"
            :max="CompanyDetail.balance"
            type="number"
            label="Bought Price"
            clearable
            solo
            rounded
          ></v-text-field>
          <v-text-field
            v-model.trim="propertyAsset.input.desc"
            label="Description"
            clearable
            solo
            rounded
          ></v-text-field>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeDialog('propertyAsset')">Discard</v-btn>
          <v-btn
            text
            @click="
              propertyAsset.input.id
                ? updateAsset('property')
                : createAsset('property')
            "
            :disabled="isDisabled('propertyAsset')"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import moment from "moment";
import { isEmpty, upperFirst, camelCase } from "lodash";
import GET_TANGIBLE_ASSET_CODE from "../graphql/GetTangibleAssetCode.gql";
import GET_INTANGIBLE_ASSET_CODE from "../graphql/GetIntangibleAssetCode.gql";
import GET_PROPERTY_ASSET_CODE from "../graphql/GetPropertyAssetCode.gql";
import GET_COMPANY_DETAIL from "../graphql/GetCompanyDetails.gql";
import UPDATE_COMPANY_DETAIL from "../graphql/updateCompanyDetail.gql";
import CREATE_TANGIBLE_ASSET from "../graphql/createTangibleAsset.gql";
import UPDATE_TANGIBLE_ASSET from "../graphql/updateTangibleAsset.gql";
import DELETE_TANGIBLE_ASSET from "../graphql/deleteTangibleAsset.gql";
import CREATE_INTANGIBLE_ASSET from "../graphql/createIntangibleAsset.gql";
import UPDATE_INTANGIBLE_ASSET from "../graphql/updateIntangibleAsset.gql";
import DELETE_INTANGIBLE_ASSET from "../graphql/deleteIntangibleAsset.gql";
import CREATE_PROPERTY_ASSET from "../graphql/createPropertyAsset.gql";
import UPDATE_PROPERTY_ASSET from "../graphql/updatePropertyAsset.gql";
import DELETE_PROPERTY_ASSET from "../graphql/deletePropertyAsset.gql";
import store from "../store";
export default {
  async beforeMount() {
    const companyDetails = this.$store.getters.getCompanyDetails;
    if (isEmpty(companyDetails)) await this.GetCompanyDetails();
    Object.keys(this.companyDetail.input).map((key) => {
      this.companyDetail.input[key] = companyDetails[key];
    });
  },
  computed: {
    CompanyDetail() {
      return this.$store.getters.getCompanyDetails;
    },
  },
  data() {
    return {
      fab: false,
      activeTab: null,
      companyAssetTabs: [
        "Property Asset",
        "Tangible Asset",
        "Intangible Asset",
      ],
      companyDetail: {
        input: {
          id: null,
          name: null,
          npwp: null,
          balance: null,
          revenue: null,
          netProfit: null,
          tangibleAsset: [],
          intangibleAsset: [],
          propertyAsset: [],
        },
        edited: false,
      },
      tangibleAsset: {
        input: {
          id: null,
          name: null,
          boughtPrice: null,
          boughtSince: null,
          depCategory: null,
          depAmount: null,
          timePeriod: null,
          desc: null,
        },
        menu: false,
        boughtSinceModal: false,
        dialog: false,
      },
      intangibleAsset: {
        input: {
          id: null,
          name: null,
          boughtPrice: null,
          boughtSince: null,
          depCategory: null,
          depAmount: null,
          timePeriod: null,
          desc: null,
        },
        menu: false,
        boughtSinceModal: false,
        dialog: false,
      },
      propertyAsset: {
        input: {
          id: null,
          name: null,
          boughtPrice: null,
          boughtSince: null,
          depCategory: null,
          depAmount: null,
          timePeriod: null,
          desc: null,
        },
        menu: false,
        boughtSinceModal: false,
        dialog: false,
      },
      rules: {
        name: [(v) => !!v || "Name field is required"],
        npwp: [
          (v) =>
            (v || "123456789012345").length > 14 ||
            "NPWP must be 15 characters",
        ],
        price: [(v) => !!v || "Price field is required"],
        date: [(v) => !!v || "Date field is required"],
        category: [(v) => !!v || "Category field is required"],
      },
    };
  },
  watch: {
    "tangibleAsset.input.depCategory": {
      handler(category) {
        switch (category) {
          case "Kelompok1":
            // code block
            this.tangibleAsset.input.timePeriod = "4 Years";
            this.tangibleAsset.input.depAmount = 0.25;
            break;
          case "Kelompok2":
            // code block
            // console.log(category);
            this.tangibleAsset.input.timePeriod = "8 Years";
            this.tangibleAsset.input.depAmount = 0.125;
            break;
          case "Kelompok3":
            // code block
            // console.log(category);
            this.tangibleAsset.input.timePeriod = "16 Years";
            this.tangibleAsset.input.depAmount = 0.0625;
            break;
          case "Kelompok4":
            // code block
            // console.log(category);
            this.tangibleAsset.input.timePeriod = "20 Years";
            this.tangibleAsset.input.depAmount = 0.05;
            break;
        }
      },
      deep: true,
    },
    "intangibleAsset.input.depCategory": {
      handler(category) {
        switch (category) {
          case "Kategori1":
            this.intangibleAsset.input.depAmount = 0.25;
            this.intangibleAsset.input.timePeriod = "4 Years";
            break;
          case "Kategori2":
            this.intangibleAsset.input.depAmount = 0.125;
            this.intangibleAsset.input.timePeriod = "8 Years";
            break;
          case "Kategori3":
            this.intangibleAsset.input.depAmount = 0.0625;
            this.intangibleAsset.input.timePeriod = "16 Years";
            break;
          case "Kategori4":
            this.intangibleAsset.input.depAmount = 0.05;
            this.intangibleAsset.input.timePeriod = "20 Years";
            break;
        }
      },
      deep: true,
    },
    "propretyAsset.input.depCategory": {
      handler(category) {
        switch (category) {
          case category == 0:
            // code block
            this.propertyAsset.input.timePeriod = "20 Years";
            this.propertyAsset.input.depAmount = 0.05;
            break;
          case category == 1:
            // code block
            this.propertyAsset.input.timePeriod = "10 Years";
            this.propertyAsset.input.depAmount = 0.1;
            break;
        }
      },
      deep: true,
    },
  },
  apollo: {
    // companyDetail: {
    //   query: GET_COMPANY_DETAIL,
    //   update: (data) => data.CompanyDetails.companyDetail,
    //   result: ({ data }) => {
    //     store.commit("updateCompanyDetails", data.CompanyDetails.companyDetail);
    //   },
    //   onerror({ message }) {
    //     alert(message);
    //   },
    // },
    tangibleAssetCode: {
      query: GET_TANGIBLE_ASSET_CODE,
      update: (data) =>
        data.__type.enumValues.map((enumValue) => enumValue.name),
    },
    intangibleAssetCode: {
      query: GET_INTANGIBLE_ASSET_CODE,
      update: (data) =>
        data.__type.enumValues.map((enumValue) => enumValue.name),
    },
    propertyAssetCode: {
      query: GET_PROPERTY_ASSET_CODE,
      update: (data) =>
        data.__type.enumValues.map((enumValue) => enumValue.name),
    },
  },
  methods: {
    camelCase,
    moment,
    isDisabled(assetName) {
      const { input } = this[assetName];
      const { name, boughtPrice, boughtSince, depCategory } = input;
      return !name || !boughtPrice || !boughtSince || !depCategory;
    },
    momentFormated(event, target) {
      console.log(moment(event, "YYYY-MM-DD").format("LL"));
      this[target].input.boughtSince = moment(event, "YYYY-MM-DD").format("LL");
    },
    discardChanges() {
      const companyDetails = this.CompanyDetails;
      Object.keys(this.companyDetail.input).map((key) => {
        this.companyDetail.input[key] = companyDetails[key];
      });
      this.companyDetail.edited = false;
    },
    closeDialog(name) {
      const { balance } = this.CompanyDetail;
      if (name == "companyDetail") this.companyDetail.input.balance = balance;
      else
        Object.keys(this[name].input).map(
          (key) => (this[name].input[key] = null)
        );
      this[name].dialog = false;
    },
    editAsset(name, data) {
      let { input } = this[name];
      Object.keys(input).map((key) => {
        input[key] = data[key];
      });
      this[name].dialog = !this[name].dialog;
    },
    async createAsset(name) {
      try {
        const { id } = this.CompanyDetail;
        const { boughtPrice, depAmount, ...input } = this[`${name}Asset`].input;
        const result = await this.$apollo.mutate({
          mutation:
            name == "tangible"
              ? CREATE_TANGIBLE_ASSET
              : name == "intangible"
              ? CREATE_INTANGIBLE_ASSET
              : CREATE_PROPERTY_ASSET,
          variables: {
            input: {
              ...input,
              companyDetailId: id,
              boughtPrice: parseFloat(boughtPrice),
              depAmount: parseFloat(depAmount),
            },
          },
        });

        const { ok, error, ...data } =
          name == "tangible"
            ? result.data.createTangibleAsset
            : name == "intangible"
            ? result.data.createIntangibleAsset
            : result.data.createPropertyAsset;
        if (!ok) alert(error.message);
        else {
          this.$store.commit(`add${upperFirst(name)}Asset`, data);
          this.closeDialog(`${name}Asset`);
        }
      } catch ({ message }) {
        alert(message);
      }
    },
    async updateAsset(name) {
      try {
        const { id } = this.CompanyDetail;
        const { boughtPrice, depAmount, ...input } = this[`${name}Asset`].input;
        const result = await this.$apollo.mutate({
          mutation:
            name == "tangible"
              ? UPDATE_TANGIBLE_ASSET
              : name == "intangible"
              ? UPDATE_INTANGIBLE_ASSET
              : UPDATE_PROPERTY_ASSET,
          variables: {
            input: {
              ...input,
              companyDetailId: id,
              boughtPrice: parseFloat(boughtPrice),
              depAmount: parseFloat(depAmount),
            },
          },
        });

        const { ok, error, ...data } =
          name == "tangible"
            ? result.data.updateTangibleAsset
            : name == "intangible"
            ? result.data.updateIntangibleAsset
            : result.data.updatePropertyAsset;
        if (!ok) alert(error.message);
        else {
          this.$store.commit(`update${upperFirst(name)}Asset`, data);
          this.closeDialog(`${name}Asset`);
        }
      } catch ({ message }) {
        alert(message);
      }
    },
    async deleteAsset(name, id) {
      try {
        const { id:companyDetailId } = this.CompanyDetail;
        const result = await this.$apollo.mutate({
          mutation:
            name == "tangibleAsset"
              ? DELETE_TANGIBLE_ASSET
              : name == "intangibleAsset"
              ? DELETE_INTANGIBLE_ASSET
              : DELETE_PROPERTY_ASSET,
          variables: {
            id,
            companyDetailId
          },
        });

        const { ok, error, ...data } =
          name == "tangibleAsset"
            ? result.data.deleteTangibleAsset
            : name == "intangibleAsset"
            ? result.data.deleteIntangibleAsset
            : result.data.deletePropertyAsset;
        if (!ok) alert(error.message);
        else {
          this.$store.commit(`delete${upperFirst(name)}`, data);
        }
      } catch ({ message }) {
        alert(message);
      }
    },
    async GetCompanyDetails() {
      try {
        const result = await this.$apollo.mutate({
          mutation: GET_COMPANY_DETAIL,
        });
        const { ok, companyDetail, error } = result.data.CompanyDetails;
        if (!ok) alert(error.message);
        else store.commit("updateCompanyDetails", companyDetail);
      } catch ({ message }) {
        alert(message);
      }
    },
    async updateCompanyDetails() {
      const { name, npwp } = this.companyDetail.input;
      try {
        const result = await this.$apollo.mutate({
          mutation: UPDATE_COMPANY_DETAIL,
          variables: { input: { name, npwp } },
        });

        const { ok, companyDetail, error } = result.data.updateCompanyDetail;
        if (!ok) alert(error.message);
        else this.$store.commit("updateCompanyDetails", companyDetail);
      } catch ({ message }) {
        alert(message);
      }
    },
  },
};
</script>
