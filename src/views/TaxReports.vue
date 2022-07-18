<template>
  <v-container>
    <v-row>
      <v-col cols="8">
        <!-- <v-card>
          <v-card-title>
            <h2>Tax Report</h2>
          </v-card-title>
          <v-card-text>
            <v-card
              class="mb-2"
              v-for="(report, index) in tax.input.report"
              :key="report.id"
              outlined
            >
              <v-card-title
                v-text="
                  moment(monthlyIncome[index].startDate, 'YYYY-MM-DD').format('MMMM')
                "
              ></v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="4">
                    <v-subheader> Name </v-subheader>
                  </v-col>
                  <v-col>
                    <v-text-field
                      v-model="report.name"
                      label="Name"
                      solo
                      outlined
                      rounded
                      clearable
                      @change="tax.edited = true"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="4">
                    <v-subheader>NPTN</v-subheader>
                  </v-col>
                  <v-col>
                    <v-text-field
                      v-model="report.nptn"
                      label="NPTN"
                      solo
                      outlined
                      rounded
                      clearable
                      @change="tax.edited = true"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="4">
                    <v-subheader>Amount</v-subheader>
                  </v-col>
                  <v-col>
                    <v-text-field
                      v-model="report.amount"
                      label="Amount"
                      rounded
                      readonly
                      solo
                      outlined
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="4">
                    <v-subheader>Due Date</v-subheader>
                  </v-col>
                  <v-col>
                    <v-text-field
                      v-model="report.dueDate"
                      label="Due Date"
                      rounded
                      readonly
                      solo
                      outlined
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-card-text>
          <v-card-actions v-show="tax.edited">
            <v-spacer></v-spacer>
            <v-btn color="red">Discard</v-btn>
            <v-btn color="primary">Save</v-btn>
          </v-card-actions>
        </v-card> -->
        <v-expansion-panels inset v-if="isMonthlyIncomeLoading">
          <v-expansion-panel
            v-for="(report, index) in tax.input.report"
            :key="index"
          >
            <v-expansion-panel-header :ripple="true">{{
              moment(monthlyIncome[index].startDate, "YYYY-MM-DD").format(
                "MMMM"
              )
            }}</v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-row>
                <v-col cols="4">
                  <v-subheader> Name </v-subheader>
                </v-col>
                <v-col>
                  <v-text-field
                    v-model.trim="report.name"
                    :rules="rules.name"
                    label="Name"
                    solo
                    outlined
                    rounded
                    clearable
                    @change="tax.edited = true"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="4">
                  <v-subheader>NPTN</v-subheader>
                </v-col>
                <v-col>
                  <v-text-field
                    v-model.trim="report.nptn"
                    :rules="rules.nptn"
                    label="NPTN"
                    solo
                    outlined
                    rounded
                    clearable
                    @change="tax.edited = true"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="4">
                  <v-subheader>Amount</v-subheader>
                </v-col>
                <v-col>
                  <v-text-field
                    v-model.number="report.amount"
                    label="Amount"
                    rounded
                    readonly
                    solo
                    outlined
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="4">
                  <v-subheader>Due Date</v-subheader>
                </v-col>
                <v-col>
                  <v-text-field
                    v-model="report.dueDate"
                    label="Due Date"
                    rounded
                    readonly
                    solo
                    outlined
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
      <v-col>
        <v-row>
          <v-col cols="12">
            <v-card>
              <v-card-title>Generate Files.</v-card-title>
              <v-card-text>
                <router-link
                  v-for="(link, index) in links"
                  :key="index"
                  :to="link.path"
                  target="_top"
                >
                  <v-list rounded>
                    <v-list-item-group>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title
                            v-text="link.name"
                          ></v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list-item-group>
                  </v-list>
                </router-link>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" v-show="tax.edited">
            <v-row justify="center">
              <v-btn @click="discard" color="warning">Discard</v-btn>
              <v-btn @click="updateTaxReport" color="success">Save</v-btn>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import UPDATE_TAX_REPORT from "../graphql/updateTaxReport.gql";
import GET_MONTHLY_INCOME from "../graphql/GetMonthlyIncome.gql";

import { last } from "lodash";
import moment from "moment";
// import XLSX from "xlsx";

export default {
  mounted() {
    let { input } = this.tax;
    const { taxReport } = this.$store.getters.getCompanyDetails;
    for (let index in taxReport) {
      Object.keys(input.report[index]).map(key => {
        input.report[index][key] = taxReport[index][key]
      })
    }
  },
  computed: {
    firstTransaction() {
      const transactions = this.$store.getters.getTransactions;
      return last(transactions);
    },
    isMonthlyIncomeLoading() {
      const loading = this.$apollo.queries.monthlyIncome.loading;
      if (loading) return false;
      else return true;
    },
  },
  data() {
    return {
      fab: false,
      tax: {
        input: {
          report: [
            {
              id: null,
              name: null,
              nptn: null,
              amount: null,
              isPaid: null,
              dueDate: null,
            },
            {
              id: null,
              name: null,
              nptn: null,
              amount: null,
              isPaid: null,
              dueDate: null,
            },
            {
              id: null,
              name: null,
              nptn: null,
              amount: null,
              isPaid: null,
              dueDate: null,
            },
            {
              id: null,
              name: null,
              nptn: null,
              amount: null,
              isPaid: null,
              dueDate: null,
            },
            {
              id: null,
              name: null,
              nptn: null,
              amount: null,
              isPaid: null,
              dueDate: null,
            },
            {
              id: null,
              name: null,
              nptn: null,
              amount: null,
              isPaid: null,
              dueDate: null,
            },
            {
              id: null,
              name: null,
              nptn: null,
              amount: null,
              isPaid: null,
              dueDate: null,
            },
            {
              id: null,
              name: null,
              nptn: null,
              amount: null,
              isPaid: null,
              dueDate: null,
            },
            {
              id: null,
              name: null,
              nptn: null,
              amount: null,
              isPaid: null,
              dueDate: null,
            },
            {
              id: null,
              name: null,
              nptn: null,
              amount: null,
              isPaid: null,
              dueDate: null,
            },
            {
              id: null,
              name: null,
              nptn: null,
              amount: null,
              isPaid: null,
              dueDate: null,
            },
            {
              id: null,
              name: null,
              nptn: null,
              amount: null,
              isPaid: null,
              dueDate: null,
            },
          ],
        },
        edited: false,
        dialog: false,
      },
      links: [
        {
          name: "Laba Rugi",
          path: "/incomeStatement",
        },
        {
          name: "Pembayaran Pajak",
          path: "/taxPaymentList",
        },
        {
          name: "Neraca",
          path: "/balanceSheet",
        },
      ],
      rules: {
        name: [(v) => !!v || "Name field is required"],
        nptn: [
          (v) =>
            (v || "123456789012345").length > 14 ||
            "NPTN must be 15 characters",
        ],
      },
    };
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
      update: (data) => data.MonthlyIncomes.monthlyIncome,
      result({ data }) {
        var { report } = this.tax.input;
        const monthlyIncome = data.MonthlyIncomes.monthlyIncome;
        report.forEach((report, index) => {
          if (monthlyIncome[index].total != 0) {
            report.dueDate = moment(
              monthlyIncome[index].startDate,
              "YYYY-MM-DD"
            )
              .add({ month: 1, day: 12 })
              .format("dddd, MMMM Do YYYY");
            report.amount = parseFloat(monthlyIncome[index].total * 0.05);
          }
        });
      },
    },
  },
  methods: {
    moment,
    discard() {
      let { input } = this.tax;
      const { taxReport } = this.$store.getters.getCompanyDetails;
      for (var [index, report] of taxReport.entries()) {
        Object.keys(report).map((key) => {
          input.report[index][key] = report[key];
        });
      }
    },
    async updateTaxReport() {
      try {
        const { id: companyDetailId } = this.$store.getters.getCompanyDetails;
        let { report: reports } = this.tax.input;
        reports = Object.values(
          Object.fromEntries(
            Object.entries(reports).filter((item) => {
              const report = last(item);
              if (report.nptn != null && report.name != null) {
                report.isPaid = true;
                return report;
              }
            })
          )
        );
        const result = await this.$apollo.mutate({
          mutation: UPDATE_TAX_REPORT,
          variables: {
            input: {
              companyDetailId,
              report: reports,
            },
          },
        });
        const { ok, taxReport, error } = result.data.updateTaxReport;
        if (!ok) alert(error.message);
        else this.$store.commit("updateTaxReport", taxReport);
      } catch ({ message }) {
        alert(message);
      }
    },
    // generateSPT() {
    //   const workbook = XLSX.readFile(FORM_SPT_1771, {
    //     cellDates: true,
    //     cellStyles: true,
    //     cellText: true,
    //     bookFiles: true,
    //   });
    // },
  },
};
</script>

<style></style>
