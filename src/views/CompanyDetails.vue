<template>
  <v-container>
    <v-card>
      <v-card-title>Company Details</v-card-title>
      <v-card-subtitle>Manage your Company Details</v-card-subtitle>
      <v-divider></v-divider>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-row>
              <v-col cols="4"> Company name </v-col>
              <v-col>
                <v-text-field
                  v-model="companyDetail.input.name"
                  label="Name"
                  clearable
                  solo
                  rounded
                  @change="companyDetail.edited = true"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12">
            <v-row>
              <v-col cols="4"> NPWP </v-col>
              <v-col>
                <v-text-field
                  v-model="companyDetail.input.npwp"
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
          <v-col cols="12">
            <v-row>
              <v-col cols="4"> Balance </v-col>
              <v-col>
                {{ companyDetail.input.balance || 0 }}
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12">
            <v-row>
              <v-col cols="4"> Revenue </v-col>
              <v-col>
                {{ companyDetail.input.revenue || 0 }}
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12">
            <v-row>
              <v-col cols="4"> Net Profit </v-col>
              <v-col>
                {{ companyDetail.input.netProfit || 0 }}
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12">
            <v-list two-line outlined>
              <v-list-item-group>
                <template v-for="(asset, index) in companyDetail.input.asset">
                  <v-list-item :key="asset.id">
                    <template>
                      <v-list-item-content>
                        <v-list-item-title
                          v-text="asset.name"
                        ></v-list-item-title>

                        <v-list-item-subtitle
                          class="text--primary"
                          v-text="asset.assetCode"
                        ></v-list-item-subtitle>

                        <v-list-item-subtitle>
                          <v-card>
                            <v-card-title>Description</v-card-title>
                            <v-card-text>
                              <div class="py-1">
                                <v-chip>Bough Since</v-chip> {{asset.boughtSince}}
                              </div>
                              <div class="py-1">
                                <v-chip>Bought Price</v-chip> {{asset.boughtPrice}}
                              </div>
                              <div class="py-1">
                                <v-chip>Note</v-chip> {{asset.desc}}
                              </div>
                            </v-card-text>
                          </v-card>
                        </v-list-item-subtitle>
                      </v-list-item-content>

                      <v-list-item-action>
                        <!-- <v-list-item-action-text
                          v-text="item.action"
                        ></v-list-item-action-text>

                        <v-icon v-if="!active" color="grey lighten-1">
                          mdi-star-outline
                        </v-icon>

                        <v-icon v-else color="yellow darken-3">
                          mdi-star
                        </v-icon> -->
                      </v-list-item-action>
                    </template>
                  </v-list-item>

                  <v-divider
                    v-if="index < asset.length - 1"
                    :key="index"
                  ></v-divider>
                </template>
              </v-list-item-group>
            </v-list>
            <!-- <v-row>
              <v-col v-for="asset in companyDetail.input.asset" :key="asset.id">
              </v-col>
            </v-row> -->
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <div v-show="companyDetail.edited">
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
      <v-btn
        icon
        dark
        fab
        color="primary"
        @click="asset.dialog = !asset.dialog"
      >
        <v-icon>mdi-office-plus</v-icon>
      </v-btn>
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
            @click="companyDetail.dialog = !companyDetail.dialog"
          >
            <v-icon>mdi-bank-plus</v-icon>
          </v-btn>
        </template>
        <span>Add Company Balance</span>
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
            @click="asset.dialog = !asset.dialog"
          >
            <v-icon>mdi-office-plus</v-icon>
          </v-btn>
        </template>
        <span>Add Asset</span>
      </v-tooltip> -->
    </v-speed-dial>
    <v-dialog v-model="asset.dialog">
      <v-card>
        <v-toolbar flat>
          <h2>{{ asset.input.id ? "Update an Asset" : "Add an Asset" }}</h2>
          <v-spacer></v-spacer>
          <v-btn icon @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <v-text-field
            v-model="asset.input.name"
            label="Asset Name"
            clearable
            solo
            rounded
          ></v-text-field>
          <v-select
            v-model="asset.input.assetCode"
            :items="assetCode"
            label="Select"
            rounded
            dense
            solo
            single-line
          ></v-select>
          <v-dialog
            ref="dialog"
            v-model="asset.boughtSinceModal"
            :return-value.sync="asset.input.boughtSince"
            persistent
            width="290px"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="asset.input.boughtSince"
                label="Picker in dialog"
                prepend-icon="mdi-calendar"
                readonly
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker v-model="asset.input.boughtSince" scrollable>
              <v-spacer></v-spacer>
              <v-btn
                text
                color="primary"
                @click="asset.boughtSinceModal = !asset.boughtSinceModal"
              >
                Cancel
              </v-btn>
              <v-btn
                text
                color="primary"
                @click="$refs.dialog.save(asset.input.boughtSince)"
              >
                OK
              </v-btn>
            </v-date-picker>
          </v-dialog>
          <v-text-field
            v-model="asset.input.boughtPrice"
            type="number"
            label="Bought Price"
            clearable
            solo
            rounded
          ></v-text-field>
          <v-text-field
            v-model="asset.input.desc"
            label="Description"
            clearable
            solo
            rounded
          ></v-text-field>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeDialog">Discard</v-btn>
          <v-btn text @click="createAsset">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="companyDetail.dialog">
      <v-card>
        <v-toolbar flat>
          <h2>Add Company Balance</h2>
          <v-spacer></v-spacer>
          <v-btn icon @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <v-text-field
            v-model="companyDetail.input.balance"
            type="number"
            label="Add Balance"
            clearable
            solo
            rounded
          ></v-text-field>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeDialog">Discard</v-btn>
          <v-btn text @click="updateCompanyDetails">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import GET_ASSET_CODE from "../graphql/GetAssetCode.gql";
import GET_COMPANY_DETAIL from "../graphql/GetCompanyDetails.gql";
import UPDATE_COMPANY_DETAIL from "../graphql/updateCompanyDetail.gql";
import CREATE_ASSET from "../graphql/createAsset.gql";
import UPDATE_ASSET from "../graphql/updateAsset.gql";
// import DELETE_ASSET from "../graphql/deleteAsset.gql";
import store from "../store";
export default {
  async beforeMount() {
    await this.GetCompanyDetails();
    const companyDetails = this.$store.getters.getCompanyDetails;
    Object.keys(this.companyDetail.input).map((key) => {
      this.companyDetail.input[key] = companyDetails[key];
    });
  },
  data() {
    return {
      fab: false,
      companyDetail: {
        input: {
          id: null,
          name: null,
          npwp: null,
          balance: null,
          revenue: null,
          netProfit: null,
          asset: [],
        },
        edited: false,
        dialog: false,
      },
      asset: {
        input: {
          id: null,
          name: null,
          assetCode: null,
          boughtPrice: null,
          boughtSince: null,
          desc: null,
        },
        menu: false,
        boughtSinceModal: false,
        dialog: false,
      },
    };
  },
  apollo: {
    // companyDetail: {
    //   query: GET_COMPANY_DETAIL,
    //   update: (data) => data.CompanyDetails.companyDetail,
    //   result: ({ data }) => {
    //     store.commit("updateCompanyDetails", data.CompanyDetails.companyDetail);
    //   },
    // },
    assetCode: {
      query: GET_ASSET_CODE,
      update: (data) =>
        data.__type.enumValues.map((enumValue) => enumValue.name),
    },
  },
  methods: {
    closeDialog() {
      this.companyDetail.input.balance = null;
      Object.keys(this.asset.input).map(
        (key) => (this.asset.input[key] = null)
      );
      this.companyDetail.dialog = false;
      this.asset.dialog = false;
    },
    editAsset(asset) {
      let { input } = this.asset;
      Object.keys(input).map((key) => {
        input[key] = asset[key];
      });
      this.asset.dialog = !this.asset.dialog;
    },
    async createAsset() {
      try {
        const {boughtPrice, ...input} = this.asset.input
        const result = await this.$apollo.mutate({
          mutation: CREATE_ASSET,
          variables: {
            input: {
              ...input,
              boughtPrice: parseFloat(boughtPrice)
            },
          },
        });

        const { ok, asset, error } = result.data.createAsset;
        if (!ok) alert(error);
        this.$store.commit("addAsset", asset);
      } catch (err) {
        alert(err);
        console.log(err);
      }
    },
    async updateAsset() {
      try {
        const result = await this.$apollo.mutate({
          mutation: UPDATE_ASSET,
          variables: {
            input: this.asset.input,
          },
        });

        const { ok, asset, error } = result.data.updateAsset;
        if (!ok) alert(error);
        this.$store.commit("updateAsset", asset);
      } catch (err) {
        alert(err);
        console.log(err);
      }
    },
    async GetCompanyDetails() {
      try {
        const result = await this.$apollo.mutate({
          mutation: GET_COMPANY_DETAIL,
        });
        const { ok, companyDetail, error } = result.data.CompanyDetails;
        if (!ok) alert(error);
        store.commit("updateCompanyDetails", companyDetail);
      } catch (err) {
        console.log(err);
      }
    },
    async updateCompanyDetails() {
      try {
        const doc = await this.$apollo.mutate({
          mutation: UPDATE_COMPANY_DETAIL,
          variables: { input: this.input },
        });

        const { ok, companyDetail, error } = doc;
        if (!ok) alert(error);
        this.$store.commit("updateCompanyDetails", companyDetail);
      } catch (err) {
        console.log(err);
      }
    },
  },
};

</script>