<template>
  <v-container>
    <!-- <v-row>
      <v-col v-for="[sheet, detail] of Object.entries(mapped1771)" :key="sheet">
        {{ sheet }}
        <p v-for="({ name, origin }, index) of detail" :key="index">
          {{ name }}, {{ origin }}
        </p>
      </v-col>
    </v-row> -->
    <v-row>
      <v-col>
        <v-card>
          <v-card-title>Formulir SPT 1771</v-card-title>
          <v-card-text>
            <v-file-input
              show-size
              label="Select File"
              @change="LampiranSPT1771"
            ></v-file-input>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col>
        <v-card>
          <v-card-title>Formulir Lampiran Khusus SPT 1771</v-card-title>
          <v-card-text>
            <v-file-input
              show-size
              label="Select File"
              @change="LampiranKhusus"
            ></v-file-input>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <!-- <Xlsx-read :file="file">
      <XlsxTable></XlsxTable>
    </Xlsx-read> -->
  </v-container>
</template>

<script>
import moment from "moment";
import { read, utils, writeFile } from "xlsx";
// import { XlsxRead, XlsxTable } from "vue-xlsx/dist/vue-xlsx.es";

export default {
  mounted() {
    Object.keys(this.mapped1771).map((key) => {
      var currentSheet = this.mapped1771[key];
      for (var detail of currentSheet) {
        detail.value = [];
      }
    });
    this.LampiranInduk();
    this.LampiranInduk2();
    this.Lampiran1();
    this.Lampiran2();
    this.Lampiran4();
    this.Lampiran5();
    this.Lampiran8A();
    this.Lampiran1A();
  },
  computed: {
    Today() {
      const now = moment.now();
      return moment(moment(now).format("LL"));
    },
    CompanyCostOfGood() {
      const { netProfit, revenue } = this.$store.getters.getCompanyDetails;
      return revenue - netProfit;
    },
    CompanyBalance() {
      const { balance } = this.$store.getters.getCompanyDetails;
      return balance;
    },
    CompanyNetProfit() {
      const { netProfit } = this.$store.getters.getCompanyDetails;
      return netProfit;
    },
    CompanyNetProfitBeforeTax() {
      const { netProfit } = this.$store.getters.getCompanyDetails;
      const tangibleTotalDep = this.TotalCompanyTangibleAsset.totalDepreciation;
      const intangibleTotalDep =
        this.TotalCompanyIntangibleAsset.totalDepreciation;
      const propertyTotalDep = this.TotalCompanyPropertyAsset.totalDepreciation;
      return Math.abs(
        netProfit - (tangibleTotalDep + intangibleTotalDep + propertyTotalDep)
      );
    },
    CompanyNetProfitTax() {
      const netProfitbeforeTax = this.CompanyNetProfitBeforeTax;
      if (netProfitbeforeTax > 0) return parseFloat(netProfitbeforeTax) * 0.05;
      else return 0;
    },
    CompanyNetProfitAfterTax() {
      const netProfitbeforeTax = this.CompanyNetProfitBeforeTax;
      const tax = this.CompanyNetProfitTax;
      return netProfitbeforeTax - tax;
    },
    CompanyRevenue() {
      const { revenue } = this.$store.getters.getCompanyDetails;
      return revenue;
    },
    CompanyRevenueTax() {
      const revenue = this.CompanyRevenue;
      return parseFloat(revenue) * 0.05;
    },
    CompanyTotalBudgets() {
      const budgets = this.$store.getters.getBudgets;
      let total = 0;
      for (var budget of budgets) total += budget.amount;
      return total;
    },
    TotalExpense() {
      const expenses = this.$store.getters.getExpenses;
      let total = 0;
      for (var expense of expenses) total += expense.amount;
      return total;
    },
    TangibleAsset() {
      const { tangibleAsset } = this.$store.getters.getCompanyDetails;
      return tangibleAsset;
      // return Object.keys(tangibleAsset).map((index) => {
      //   const { name, boughtSince, boughtPrice, desc } = tangibleAsset[index];
      //   return {
      //     name,
      //     boughtSince,
      //     boughtPrice,
      //     desc,
      //   };
      // });
    },
    IntangibleAsset() {
      const { intangibleAsset } = this.$store.getters.getCompanyDetails;
      return intangibleAsset;
      // return Object.keys(intangibleAsset).map((index) => {
      //   const { name, boughtSince, boughtPrice, desc } = intangibleAsset[index];
      //   return {
      //     name,
      //     boughtSince,
      //     boughtPrice,
      //     desc,
      //   };
      // });
    },
    PropertyAsset() {
      const { propertyAsset } = this.$store.getters.getCompanyDetails;
      return propertyAsset;
      // return Object.keys(propertyAsset).map((index) => {
      //   const { name, boughtSince, boughtPrice, desc } = propertyAsset[index];
      //   return {
      //     name,
      //     boughtSince,
      //     boughtPrice,
      //     desc,
      //   };
      // });
    },
    TotalCompanyPropertyAsset() {
      const { propertyAsset: assets } = this.$store.getters.getCompanyDetails;
      let totalDep = 0;
      let total = 0;
      const now = moment(moment.now());
      for (var asset of assets) {
        const boughtSince = moment(
          asset.boughtSince,
          "ddd MMM DD YYYY HH:mm:ss"
        );
        const yearOwned = now.diff(boughtSince, "year");
        const depreciation =
          yearOwned > 0
            ? this.depreciationCalculator(
                asset.boughtPrice,
                asset.depAmount,
                parseFloat(yearOwned)
              )
            : 0;
        totalDep += depreciation;
        total += asset.boughtPrice;
      }
      return {
        total: total,
        totalDepreciation: totalDep,
      };
    },
    TotalCompanyTangibleAsset() {
      const { tangibleAsset: assets } = this.$store.getters.getCompanyDetails;
      let totalDep = 0;
      let total = 0;

      const now = moment(moment.now());
      for (var asset of assets) {
        const boughtSince = moment(
          asset.boughtSince,
          "ddd MMM DD YYYY HH:mm:ss"
        );
        const yearOwned = now.diff(boughtSince, "year");
        const depreciation =
          yearOwned > 0
            ? this.depreciationCalculator(
                asset.boughtPrice,
                asset.depAmount,
                parseFloat(yearOwned)
              )
            : 0;
        totalDep += depreciation;
        total += asset.boughtPrice;
      }
      return {
        total: total,
        totalDepreciation: totalDep,
      };
    },
    TotalCompanyIntangibleAsset() {
      const { intangibleAsset: assets } = this.$store.getters.getCompanyDetails;
      let totalDep = 0;
      let total = 0;
      const now = moment(moment.now());
      for (var asset of assets) {
        const boughtSince = moment(
          asset.boughtSince,
          "ddd MMM DD YYYY HH:mm:ss"
        );
        const yearOwned = now.diff(boughtSince, "year");
        const depreciation =
          yearOwned > 0
            ? this.depreciationCalculator(
                asset.boughtPrice,
                asset.depAmount,
                parseFloat(yearOwned)
              )
            : 0;
        totalDep += depreciation;
        total += asset.boughtPrice;
      }
      return {
        total: total,
        totalDepreciation: totalDep,
      };
    },
    TotalCompanyAssetDepreciation() {
      const { totalDep: tangibleAssetDep } = this.TotalCompanyTangibleAsset;
      const { totalDep: inangibleAssetDep } = this.TotalCompanyIntangibleAsset;
      const { totalDep: propertyAssetDep } = this.TotalCompanyPropertyAsset;

      return tangibleAssetDep + inangibleAssetDep + propertyAssetDep;
    },
  },
  data() {
    return {
      mapped1771: {
        1771: [
          {
            name: "TAHUN PAJAK",
            origin: "AK4",
            interval: null,
            value: [],
          },
          {
            name: "NPWP",
            origin: "J11",
            interval: "2, null, 3, null, 3, null, 1, null, 3, null, 3",
            value: [],
          },
          {
            name: "NAMA WAJIB PAJAK",
            origin: "J13",
            interval: null,
            value: [],
          },
          {
            name: "KLASIFIKASI LAPANGAN USAHA",
            origin: "AH15",
            interval: null,
            value: [],
          },
          {
            name: "NO TELP",
            origin: "J17",
            interval: "4, null, null, null, null, 8",
            value: [],
          },
          {
            name: "PERIODE PEMBUKUAN",
            origin: "J19",
            interval: "4, null, 4",
            value: [],
          },
        ],
        "1771 (2)": [
          {
            name: "TOTAL PAJAK PPH",
            origin: "W31",
            interval: null,
            value: [],
          },
          {
            name: "TANGGAL, BULAN, TAHUN PENGISIAN",
            origin: "AB89",
            interval: "1,null, 1, null, 1",
            value: [],
          },
          {
            name: "NAMA PENGURUS",
            origin: "K100",
            interval: null,
            value: [],
          },
          {
            name: "NPWP",
            origin: "K102",
            interval: "2, null, 3, null, 3, null, 1, null, 3, null, 3",
            value: [],
          },
        ],
        "1771 I": [
          {
            name: "TOTAL PENDAPATAN PENJUALAN",
            origin: "W20",
            interval: null,
            value: [],
          },
          {
            name: "TOTAL MODAL PENJUALAN",
            origin: "W22",
            interval: null,
            value: [],
          },
          {
            name: "TOTAL BIAYA USAHA LAINNYA",
            origin: "W24",
            interval: null,
            value: [],
          },
          {
            name: "JUMLAH (TOTAL PEREDARAN USAHA - MODAL PENJUALAN - BIAYA)",
            origin: "W26",
            interval: null,
            value: [],
          },
        ],
        "1771 II": [
          {
            name: "TOTAL MODAL PENJUALAN",
            origin: "L17",
            interval: "1, null, null, 1",
            value: [],
          },
          {
            name: "TOTAL PENGELUARAN GAJI",
            origin: "Z20",
            interval: null,
            value: [],
          },
          {
            name: "TOTAL SEWA",
            origin: "Z30",
            interval: null,
            value: [],
          },
          {
            name: "TOTAL MODAL PENJUALAN",
            origin: "L57",
            interval: "1, null, null, 1",
            value: [],
          },
        ],
        "1771 IV": [
          {
            name: "TOTAL OMZET, TOTAL PAJAK PPH",
            origin: "N53",
            interval: "1, null, 1",
            value: [],
          },
          {
            name: "TOTAL PAJAK PPH",
            origin: "AC55",
            interval: null,
            value: [],
          },
        ],
        "1771 V": [
          {
            name: "LIST PEMILIK MODAL (NAMA, ALAMAT, NPWP, JUMLAH RUPIAH, DIVIDEN)",
            origin: "B23",
            interval: null,
            value: [],
          },
          {
            name: "LIST PENGURUS (NAMA, ALAMAT, NPWP, JABATAN)",
            origin: "B48",
            interval: null,
            value: [],
          },
        ],
      },
      mappedLampiranKhusus: {
        "8A-1": [
          {
            name: "Kas dan setara kas",
            interval: null,
            origin: "O17",
            value: [],
          },
          {
            name: "Persediaan",
            interval: null,
            origin: "O24",
            value: [],
          },
          // {
          //   name: "beban bayar dimuka",
          //   interval: null,
          //   origin: "O25",
          //   value: [],
          // },
          {
            name: "asset tanah dan bangunan",
            interval: null,
            origin: "O29",
            value: [],
          },
          {
            name: "aktiva tetap lainnya",
            interval: null,
            origin: "O30",
            value: [],
          },
          {
            name: "akumulasi penyusutan",
            interval: null,
            origin: "O31",
            value: [],
          },
          {
            name: "harta tidak berwujud",
            interval: null,
            origin: "O34",
            value: [],
          },
          // {
          //   name: "aktiva tidak lancar lainnya",
          //   interval: null,
          //   origin: "O36",
          //   value: [],
          // },
          {
            name: "modal saham",
            interval: null,
            origin: "AI32",
            value: [],
          },
          // {
          //   name: "ekuitas lain-lain",
          //   interval: null,
          //   origin: "AI36",
          //   value: [],
          // },
          {
            name: "penjualan bersih",
            interval: null,
            origin: "AG42",
            value: [],
          },
          {
            name: "hpp",
            interval: null,
            origin: "W43",
            value: [],
          },
          {
            name: "harga pokok penjualan",
            interval: null,
            origin: "AG52",
            value: [],
          },
          {
            name: "laba kotor",
            interval: null,
            origin: "AG53",
            value: [],
          },
          {
            name: "beban umum dan administrasi (pengeluaran)",
            interval: null,
            origin: "AG55",
            value: [],
          },
          {
            name: "laba bersih",
            interval: null,
            origin: "AG56",
            value: [],
          },
          {
            name: "laba sebelum pajak penghasilan",
            interval: null,
            origin: "AG59",
            value: [],
          },
          {
            name: "beban pajak penghasilan (total pajak pendapatan)",
            interval: null,
            origin: "AG60",
            value: [],
          },
          {
            name: "laba bersih (setelah pajak)",
            interval: null,
            origin: "AG61",
            value: [],
          },
        ],
        "1A": [
          {
            name: "Tangiable Kelompok 1",
            interval:
              "1, 4|null, 1, 6|null, 1, 10|null, 1,1|null, 1, 6|null, 1",
            origin: "L15",
            value: [],
          },
          {
            name: "Tangiable Kelompok 2",
            interval:
              "1, 4|null, 1, 6|null, 1, 10|null, 1,1|null, 1, 6|null, 1",
            origin: "L17",
            value: [],
          },
          {
            name: "Tangiable Kelompok 3",
            interval:
              "1, 4|null, 1, 6|null, 1, 10|null, 1,1|null, 1, 6|null, 1",
            origin: "L19",
            value: [],
          },
          {
            name: "Tangiable Kelompok 4",
            interval:
              "1, 4|null, 1, 6|null, 1, 10|null, 1,1|null, 1, 6|null, 1",
            origin: "L21",
            value: [],
          },
          {
            name: "Property Permanen",
            interval:
              "1, 4|null, 1, 6|null, 1, 10|null, 1,1|null, 1, 6|null, 1",
            origin: "L24",
            value: [],
          },
          {
            name: "Property Tidak Permanen",
            interval:
              "1, 4|null, 1, 6|null, 1, 10|null, 1,1|null, 1, 6|null, 1",
            origin: "L26",
            value: [],
          },
          {
            name: "Intangiable Kelompok 1",
            interval:
              "1, 4|null, 1, 6|null, 1, 10|null, 1,1|null, 1, 6|null, 1",
            origin: "L32",
            value: [],
          },
          {
            name: "Intangiable Kelompok 2",
            interval:
              "1, 4|null, 1, 6|null, 1, 10|null, 1,1|null, 1, 6|null, 1",
            origin: "L34",
            value: [],
          },
          {
            name: "Intangiable Kelompok 3",
            interval:
              "1, 4|null, 1, 6|null, 1, 10|null, 1,1|null, 1, 6|null, 1",
            origin: "L36",
            value: [],
          },
          {
            name: "Intangiable Kelompok 4",
            interval:
              "1, 4|null, 1, 6|null, 1, 10|null, 1,1|null, 1, 6|null, 1",
            origin: "L38",
            value: [],
          },
          {
            name: "Total Penyusutan Tangiable & Property",
            interval: null,
            origin: "AO28",
            value: [],
          },
          {
            name: "Total Penyusutan Intangiable",
            interval: null,
            origin: "AO42",
            value: [],
          },
        ],
      },
      file: null,
    };
  },
  methods: {
    depreciationCalculator(boughtPrice, depAmount, yearPassed) {
      let yearsPassed = parseInt(yearPassed);
      if (yearsPassed <= 0) return parseFloat(boughtPrice);
      const newBoughtPrice = parseFloat(boughtPrice) * (1 - depAmount);
      const remainingYearPassed = yearsPassed - 1;
      this.depreciationCalculator(
        newBoughtPrice,
        depAmount,
        remainingYearPassed
      );
    },
    async LampiranSPT1771(event) {
      try {
        const buffer = await event.arrayBuffer();
        this.file = read(buffer, {
          cellDates: true,
          cellStyles: true,
          bookFiles: true,
        });
        for (var [sheetName, detail] of Object.entries(this.mapped1771)) {
          const ws = this.file.Sheets[sheetName];
          for (const { origin, value } of detail) {
            utils.sheet_add_aoa(ws, value, { origin });
          }
        }
        utils;
        writeFile(this.file, "test.xlsx");
      } catch (err) {
        console.log(err);
      }
    },
    async LampiranKhusus(event) {
      try {
        const buffer = await event.arrayBuffer();
        this.file = read(buffer, {
          cellDates: true,
          cellStyles: true,
          bookFiles: true,
        });
        for (var [sheetName, detail] of Object.entries(
          this.mappedLampiranKhusus
        )) {
          const ws = this.file.Sheets[sheetName];
          for (const { origin, value } of detail) {
            utils.sheet_add_aoa(ws, value, { origin });
          }
        }
        writeFile(this.file, "test.xlsx");
      } catch (err) {
        console.log(err);
      }
    },
    slice(value, intervals, type) {
      let result = [];
      let intervalCounter = 0;
      let valueCounter = 0;
      for (var interval of intervals) {
        if (interval.includes("null")) {
          const [iteration] = interval.split("|");
          // eslint-disable-next-line
          for (var i = 0; i <= parseInt(iteration); i++) result.push(null);
        }
        if (
          !interval.includes("null") &&
          (type.includes("npwp") || type.includes("notelp"))
        ) {
          const string = value.slice(
            intervalCounter,
            intervalCounter + parseInt(interval)
          );
          result.push(string);
          intervalCounter += parseInt(interval);
        }
        if (
          !interval.includes("null") &&
          !type.includes("npwp") &&
          !type.includes("notelp")
        ) {
          result.push(value[valueCounter]);
          valueCounter++;
        }
      }
      return result;
    },
    // Form  SPT 1771
    Lampiran5() {
      var lampiran5 = this.mapped1771["1771 V"];
      const pemilikModal = this.$store.getters.getPemilikModal;
      const pengurus = this.$store.getters.getPengurus;

      // Pemilik Modal
      var [mappedPemilikModal, mappedPengurus] = lampiran5;
      for (let { username, address, npwp, amount } of pemilikModal) {
        mappedPemilikModal.value.push([
          username,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          address,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          npwp,
          null,
          null,
          null,
          null,
          null,
          amount,
        ]);
      }
      // Pengurus Koperasi
      for (let { username, address, npwp, position } of pengurus) {
        mappedPengurus.value.push([
          username,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          address,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          npwp,
          null,
          null,
          null,
          null,
          null,
          position,
        ]);
      }
    },
    Lampiran4() {
      var lampiran4 = this.mapped1771["1771 IV"];
      const pendapatanKotor = this.CompanyRevenue;
      const totalPajakPPH = this.CompanyRevenueTax;

      var [mappedPendapatanKotor, mappedPajakPPH] = lampiran4;
      mappedPendapatanKotor.value.push([
        [pendapatanKotor],
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        [pendapatanKotor],
      ]);
      mappedPajakPPH.value.push([totalPajakPPH]);
    },
    Lampiran2() {
      var lampiran2 = this.mapped1771["1771 II"];
      const hpp = this.CompanyRevenue - this.CompanyNetProfit;
      const totalPengeluaranGaji = this.$store.getters.getPengeluaranGaji;

      // eslint-disable-next-line
      var [mappedModalPenjualan, mappedGaji, mappedSewa, mappedTotalPenjualan] =
        lampiran2;

      mappedModalPenjualan.value.push([
        hpp,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        hpp,
      ]);
      mappedGaji.value.push([totalPengeluaranGaji]);
      mappedTotalPenjualan.value.push([
        hpp,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        hpp,
      ]);
    },
    Lampiran1() {
      var lampiran1 = this.mapped1771["1771 I"];
      const revenue = this.CompanyRevenue;
      const hpp = this.CompanyRevenue - this.CompanyNetProfit;
      const expense = this.$store.getters.getPengeluaran;
      const total = revenue - hpp - expense;

      var [
        mappedRevenue,
        mappedModalPenjualan,
        mappedPengeluaran,
        mappedTotal,
      ] = lampiran1;
      mappedRevenue.value.push([revenue]);
      mappedModalPenjualan.value.push([hpp]);
      mappedPengeluaran.value.push([expense]);
      mappedTotal.value.push([total]);
    },
    LampiranInduk2() {
      var lampiranInduk2 = this.mapped1771["1771 (2)"];
      const { username, npwp } = this.$store.getters.getCredentials;
      const totalPajakPPH = this.CompanyRevenueTax;
      const today = this.Today;

      var [mappedPajakPPH, mappedDate, mappedName, mappedNpwp] = lampiranInduk2;
      mappedPajakPPH.value.push([totalPajakPPH]);
      mappedDate.value.push([
        [today.date()],
        null,
        [today.month()],
        null,
        [today.year()],
      ]);
      mappedName.value.push([username]);
      const intervals = mappedNpwp.interval.split(",");
      mappedNpwp.value = [this.slice(npwp, intervals, "npwp")];
    },
    LampiranInduk() {
      const today = this.Today;
      const { username, npwp, phoneNumber } =
        this.$store.getters.getCredentials;
      var lembar1771 = this.mapped1771["1771"];

      var [
        mappedTahunPajak,
        mappedNpwp,
        mappedName,
        mappedKSU,
        mappedNoTelp,
        mappedPeriodePembukuan,
      ] = lembar1771;

      mappedTahunPajak.value.push([today.format("YY")]);
      const npwpIntervals = mappedNpwp.interval.split(",");
      mappedNpwp.value = [this.slice(npwp, npwpIntervals, "npwp")];
      mappedName.value.push([username]);
      mappedKSU.value.push(["123456"]);
      const phoneNumberIntervals = mappedNoTelp.interval.split(",");
      mappedNoTelp.value = [
        this.slice(phoneNumber, phoneNumberIntervals, "notelp"),
      ];
      const prevYear = today.subtract({ y: 1 }).format("YYYY");
      const currYear = today.add({ y: 1 }).format("YYYY");
      mappedPeriodePembukuan.value.push([
        [prevYear],
        null,
        null,
        null,
        null,
        null,
        null,
        [currYear],
      ]);
    },
    // Lampiran Khusus
    Lampiran8A() {
      var lampiran8A = this.mappedLampiranKhusus["8A-1"];

      const balance = this.CompanyBalance;
      const hpp = this.CompanyCostOfGood;
      const propertyAsset = this.TotalCompanyPropertyAsset.total;
      const tangibleAsset = this.TotalCompanyTangibleAsset.total;
      const akumulasiDep =
        this.TotalCompanyPropertyAsset.totalDepreciation +
        this.TotalCompanyTangibleAsset.totalDepreciation;
      const intangibleAsset = this.TotalCompanyIntangibleAsset.total;
      const modal = this.CompanyTotalBudgets;
      const revenue = this.CompanyRevenue;
      const expenses = this.TotalExpense;
      const netProfitbeforeTax = this.CompanyNetProfitBeforeTax;
      const companyNetProfitTax = this.CompanyNetProfitTax;
      const netProfitAfterTax = this.CompanyNetProfitAfterTax;

      // eslint-disable-next-line
      var [
        mappedKas,
        mappedInventory,
        mappedPropertyAsset,
        mappedTangibleAsset,
        mappedTotalDep,
        mappedIntangibleAsset,
        mappedModal,
        mappedRevenue,
        mappedHPP,
        mappedTotalHPP,
        mappedLabaKotor,
        mappedExpense,
        mappedLabaBersih,
        mappedNetProfitBeforeTax,
        mappedNetProfitTax,
        mappedNetProfitAfterTax,
      ] = lampiran8A;
      // var [
      //   mappedKas,
      //   mappedInventory,
      //   mappedGaji,
      //   mappedPropertyAsset,
      //   mappedTangibleAsset,
      //   mappedTotalDep,
      //   mappedIntangibleAsset,
      //   x,
      //   mappedModal,
      //   y,
      //   mappedRevenue,
      //   mappedHPP,
      //   mappedTotalHPP,
      //   mappedLabaKotor,
      //   mappedExpense,
      //   mappedLabaBersih,
      //   mappedNetProfitBeforeTax,
      //   mappedNetProfitTax,
      //   mappedNetProfitAfterTax,
      // ] = lampiran8A;

      mappedKas.value.push([balance]);
      mappedInventory.value.push([hpp]);
      mappedPropertyAsset.value.push([propertyAsset]);
      mappedTangibleAsset.value.push([tangibleAsset]);
      mappedTotalDep.value.push([akumulasiDep]);
      mappedIntangibleAsset.value.push([intangibleAsset]);
      mappedModal.value.push([modal]);
      mappedRevenue.value.push([revenue]);
      mappedHPP.value.push([hpp]);
      mappedTotalHPP.value.push([hpp]);
      mappedLabaKotor.value.push([netProfitbeforeTax]);
      mappedExpense.value.push([expenses]);
      mappedLabaBersih.value.push([netProfitbeforeTax]);
      mappedNetProfitBeforeTax.value.push([netProfitbeforeTax]);
      mappedNetProfitTax.value.push([companyNetProfitTax]);
      mappedNetProfitAfterTax.value.push([netProfitAfterTax]);
    },
    Lampiran1A() {
      var lampiran1A = this.mappedLampiranKhusus["1A"];

      var [
        tangible1,
        tangible2,
        tangible3,
        tangible4,
        propertyPerm,
        propertyNonPerm,
        intangible1,
        intangible2,
        intangible3,
        intangible4,
        depTangibleAndProperty,
        depIntangible,
      ] = lampiran1A;
      const tangibleAsset = this.TangibleAsset;
      const intangibleAsset = this.IntangibleAsset;
      const propertyAsset = this.PropertyAsset;
      const tangibleAssetTotal = this.TotalCompanyTangibleAsset;
      const intangibleAssetTotal = this.TotalCompanyIntangibleAsset;
      const propertyAssetTotal = this.TotalCompanyPropertyAsset;

      Object.keys(tangibleAsset).map((key) => {
        let asset = tangibleAsset[key];
        if (asset.depCategory.includes("Kelompok1")) {
          const { boughtSince, boughtPrice, depAmount, desc } = asset;
          const now = moment(moment.now());
          let since = moment(boughtSince, "ddd MMM DD YYYY HH:mm:ss");
          const yearOwned = now.diff(since, "year");
          const startOfYear = moment().startOf("year");
          const monthOwned = startOfYear.diff(since, "months");
          since.add({ months: monthOwned });
          const valueAtStartOfYear =
            startOfYear.diff(since, "year") > 0
              ? this.depreciationCalculator(
                  boughtPrice,
                  depAmount,
                  startOfYear.diff(since, "year")
                )
              : boughtPrice;
          const depreciation = this.depreciationCalculator(
            boughtPrice,
            depAmount,
            parseFloat(yearOwned)
          );

          tangible1.value = [
            this.slice(
              [
                since.format("YYYY"),
                boughtPrice,
                valueAtStartOfYear,
                "X",
                parseFloat(boughtPrice - depreciation),
                desc,
              ],
              tangible1.interval.split(","),
              "asset"
            ),
          ];
        }
        if (asset.depCategory.includes("Kelompok2")) {
          const { boughtSince, boughtPrice, depAmount, desc } = asset;
          const now = moment(moment.now());
          let since = moment(boughtSince, "ddd MMM DD YYYY HH:mm:ss");
          const yearOwned = now.diff(since, "year");
          const startOfYear = moment().startOf("year");
          const monthOwned = startOfYear.diff(since, "months");
          since.add({ months: monthOwned });
          const valueAtStartOfYear =
            startOfYear.diff(since, "year") > 0
              ? this.depreciationCalculator(
                  boughtPrice,
                  depAmount,
                  startOfYear.diff(since, "year")
                )
              : boughtPrice;
          const depreciation = this.depreciationCalculator(
            boughtPrice,
            depAmount,
            parseFloat(yearOwned)
          );

          tangible2.value = [
            this.slice(
              [
                since.format("YYYY"),
                boughtPrice,
                valueAtStartOfYear,
                "X",
                parseFloat(boughtPrice - depreciation),
                desc,
              ],
              tangible1.interval.split(","),
              "asset"
            ),
          ];
        }
        if (asset.depCategory.includes("Kelompok3")) {
          const { boughtSince, boughtPrice, depAmount, desc } = asset;
          const now = moment(moment.now());
          let since = moment(boughtSince, "ddd MMM DD YYYY HH:mm:ss");
          const yearOwned = now.diff(since, "year");
          const startOfYear = moment().startOf("year");
          const monthOwned = startOfYear.diff(since, "months");
          since.add({ months: monthOwned });
          const valueAtStartOfYear =
            startOfYear.diff(since, "year") > 0
              ? this.depreciationCalculator(
                  boughtPrice,
                  depAmount,
                  startOfYear.diff(since, "year")
                )
              : boughtPrice;
          const depreciation = this.depreciationCalculator(
            boughtPrice,
            depAmount,
            parseFloat(yearOwned)
          );

          tangible3.value = [
            this.slice(
              [
                since.format("YYYY"),
                boughtPrice,
                valueAtStartOfYear,
                "X",
                parseFloat(boughtPrice - depreciation),
                desc,
              ],
              tangible1.interval.split(","),
              "asset"
            ),
          ];
        }
        if (asset.depCategory.includes("Kelompok4")) {
          const { boughtSince, boughtPrice, depAmount, desc } = asset;
          const now = moment(moment.now());
          let since = moment(boughtSince, "ddd MMM DD YYYY HH:mm:ss");
          const yearOwned = now.diff(since, "year");
          const startOfYear = moment().startOf("year");
          const monthOwned = startOfYear.diff(since, "months");
          since.add({ months: monthOwned });
          const valueAtStartOfYear =
            startOfYear.diff(since, "year") > 0
              ? this.depreciationCalculator(
                  boughtPrice,
                  depAmount,
                  startOfYear.diff(since, "year")
                )
              : boughtPrice;
          const depreciation = this.depreciationCalculator(
            boughtPrice,
            depAmount,
            parseFloat(yearOwned)
          );

          tangible4.value = [
            this.slice(
              [
                since.format("YYYY"),
                boughtPrice,
                valueAtStartOfYear,
                "X",
                parseFloat(boughtPrice - depreciation),
                desc,
              ],
              tangible1.interval.split(","),
              "asset"
            ),
          ];
        }
      });

      Object.keys(intangibleAsset).map((key) => {
        let asset = intangibleAsset[key];
        if (asset.depCategory.includes("Kelompok1")) {
          const { boughtSince, boughtPrice, depAmount, desc } = asset;
          const now = moment(moment.now());
          let since = moment(boughtSince, "ddd MMM DD YYYY HH:mm:ss");
          const yearOwned = now.diff(since, "year");
          const startOfYear = moment().startOf("year");
          const monthOwned = startOfYear.diff(since, "months");
          since.add({ months: monthOwned });
          const valueAtStartOfYear =
            startOfYear.diff(since, "year") > 0
              ? this.depreciationCalculator(
                  boughtPrice,
                  depAmount,
                  startOfYear.diff(since, "year")
                )
              : boughtPrice;
          const depreciation = this.depreciationCalculator(
            boughtPrice,
            depAmount,
            parseFloat(yearOwned)
          );

          intangible1.value = [
            this.slice(
              [
                since.format("YYYY"),
                boughtPrice,
                valueAtStartOfYear,
                "X",
                parseFloat(boughtPrice - depreciation),
                desc,
              ],
              tangible1.interval.split(","),
              "asset"
            ),
          ];
        }
        if (asset.depCategory.includes("Kelompok2")) {
          const { boughtSince, boughtPrice, depAmount, desc } = asset;
          const now = moment(moment.now());
          let since = moment(boughtSince, "ddd MMM DD YYYY HH:mm:ss");
          const yearOwned = now.diff(since, "year");
          const startOfYear = moment().startOf("year");
          const monthOwned = startOfYear.diff(since, "months");
          since.add({ months: monthOwned });
          const valueAtStartOfYear =
            startOfYear.diff(since, "year") > 0
              ? this.depreciationCalculator(
                  boughtPrice,
                  depAmount,
                  startOfYear.diff(since, "year")
                )
              : boughtPrice;
          const depreciation = this.depreciationCalculator(
            boughtPrice,
            depAmount,
            parseFloat(yearOwned)
          );

          intangible2.value = [
            this.slice(
              [
                since.format("YYYY"),
                boughtPrice,
                valueAtStartOfYear,
                "X",
                parseFloat(boughtPrice - depreciation),
                desc,
              ],
              tangible1.interval.split(","),
              "asset"
            ),
          ];
        }
        if (asset.depCategory.includes("Kelompok3")) {
          const { boughtSince, boughtPrice, depAmount, desc } = asset;
          const now = moment(moment.now());
          let since = moment(boughtSince, "ddd MMM DD YYYY HH:mm:ss");
          const yearOwned = now.diff(since, "year");
          const startOfYear = moment().startOf("year");
          const monthOwned = startOfYear.diff(since, "months");
          since.add({ months: monthOwned });
          const valueAtStartOfYear =
            startOfYear.diff(since, "year") > 0
              ? this.depreciationCalculator(
                  boughtPrice,
                  depAmount,
                  startOfYear.diff(since, "year")
                )
              : boughtPrice;
          const depreciation = this.depreciationCalculator(
            boughtPrice,
            depAmount,
            parseFloat(yearOwned)
          );

          intangible3.value = [
            this.slice(
              [
                since.format("YYYY"),
                boughtPrice,
                valueAtStartOfYear,
                "X",
                parseFloat(boughtPrice - depreciation),
                desc,
              ],
              tangible1.interval.split(","),
              "asset"
            ),
          ];
        }
        if (asset.depCategory.includes("Kelompok4")) {
          const { boughtSince, boughtPrice, depAmount, desc } = asset;
          const now = moment(moment.now());
          let since = moment(boughtSince, "ddd MMM DD YYYY HH:mm:ss");
          const yearOwned = now.diff(since, "year");
          const startOfYear = moment().startOf("year");
          const monthOwned = startOfYear.diff(since, "months");
          since.add({ months: monthOwned });
          const valueAtStartOfYear =
            startOfYear.diff(since, "year") > 0
              ? this.depreciationCalculator(
                  boughtPrice,
                  depAmount,
                  startOfYear.diff(since, "year")
                )
              : boughtPrice;
          const depreciation = this.depreciationCalculator(
            boughtPrice,
            depAmount,
            parseFloat(yearOwned)
          );

          intangible4.value = [
            this.slice(
              [
                since.format("YYYY"),
                boughtPrice,
                valueAtStartOfYear,
                "X",
                parseFloat(boughtPrice - depreciation),
                desc,
              ],
              tangible1.interval.split(","),
              "asset"
            ),
          ];
        }
      });

      Object.keys(propertyAsset).map((key) => {
        let asset = propertyAsset[key];
        if (asset.depCategory.includes("Permanen")) {
          const { boughtSince, boughtPrice, depAmount, desc } = asset;
          const now = moment(moment.now());
          let since = moment(boughtSince, "ddd MMM DD YYYY HH:mm:ss");
          const yearOwned = now.diff(since, "year");
          const startOfYear = moment().startOf("year");
          const monthOwned = startOfYear.diff(since, "months");
          since.add({ months: monthOwned });
          const valueAtStartOfYear =
            startOfYear.diff(since, "year") > 0
              ? this.depreciationCalculator(
                  boughtPrice,
                  depAmount,
                  startOfYear.diff(since, "year")
                )
              : boughtPrice;
          const depreciation = this.depreciationCalculator(
            boughtPrice,
            depAmount,
            parseFloat(yearOwned)
          );

          propertyPerm.value = [
            this.slice(
              [
                since.format("YYYY"),
                boughtPrice,
                valueAtStartOfYear,
                "X",
                parseFloat(boughtPrice - depreciation),
                desc,
              ],
              tangible1.interval.split(","),
              "asset"
            ),
          ];
        }
        if (asset.depCategory.includes("TidakPermanen")) {
          const { boughtSince, boughtPrice, depAmount, desc } = asset;
          const now = moment(moment.now());
          let since = moment(boughtSince, "ddd MMM DD YYYY HH:mm:ss");
          const yearOwned = now.diff(since, "year");
          const startOfYear = moment().startOf("year");
          const monthOwned = startOfYear.diff(since, "months");
          since.add({ months: monthOwned });
          const valueAtStartOfYear =
            startOfYear.diff(since, "year") > 0
              ? this.depreciationCalculator(
                  boughtPrice,
                  depAmount,
                  startOfYear.diff(since, "year")
                )
              : boughtPrice;
          const depreciation = this.depreciationCalculator(
            boughtPrice,
            depAmount,
            parseFloat(yearOwned)
          );

          propertyNonPerm.value = [
            this.slice(
              [
                since.format("YYYY"),
                boughtPrice,
                valueAtStartOfYear,
                "X",
                parseFloat(boughtPrice - depreciation),
                desc,
              ],
              tangible1.interval.split(","),
              "asset"
            ),
          ];
        }
      });

      depTangibleAndProperty.value.push([
        tangibleAssetTotal.totalDepreciation +
          propertyAssetTotal.totalDepreciation,
      ]);
      depIntangible.value.push([intangibleAssetTotal.totalDepreciation]);
    },
  },
};
</script>

<style></style>
