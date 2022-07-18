import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    currentRoute: null,
    companyDetail: {
      id: null,
      name: null,
      npwp: null,
      balance: null,
      revenue: null,
      netProfit: null,
      tangibleAsset: [],
      intangibleAsset: [],
      propertyAsset: [],
      taxReport: [],
    },
    credential: {
      id: null,
      username: null,
      npwp: null,
      address: null,
      position: null,
      phoneNumber: null,
      accessToken: null,
    },
    laporan1771: {
      namaPengurus: [],
      namaPemilikModal: [],
      totalPengeluaran: null,
      totalPengeluaranGaji: null,
      totalSewa: null,
    },
    expCategory: [],
    budgets: [],
    expenses: [],
    recentActivities: [],
    recentTransactions: [],
    activites: [],
    products: [],
    transactions: [],
    users: [],
    shopCart: [],
  },
  getters: {
    getCurrentRoute: (state) => state.currentRoute,
    getAccessToken: (state) => state.credential.accessToken,
    getCredentials: (state) => state.credential,
    getBudgets: (state) => state.budgets,
    getExpenses: (state) => state.expenses,
    getExpenseCategory: (state) => state.expCategory,
    getCompanyDetails: (state) => state.companyDetail,
    getShopCart: (state) => state.shopCart,
    getUsers: (state) => state.users,
    getProducts: (state) => state.products,
    getTransactions: (state) => state.transactions,
    getActivities: (state) => state.activites,
    getRecentActivities: (state) => state.recentActivities,
    getRecentTransactions: (state) => state.recentTransactions,
    getPengurus: (state) => state.laporan1771.namaPengurus,
    getPemilikModal: (state) => state.laporan1771.namaPemilikModal,
    getPengeluaran: (state) => state.laporan1771.totalPengeluaran,
    getPengeluaranGaji: (state) => state.laporan1771.totalPengeluaranGaji,
    getSewa: (state) => state.laporan1771.totalSewa,
  },
  mutations: {
    updateRoute: (state, payload) => (state.currentRoute = payload),
    updateCredential: (state, payload) => {
      Object.keys(payload).map((key) => {
        state.credential[key] = payload[key];
      });
    },
    updateCompanyDetails: (state, payload) => {
      Object.keys(payload).map((key) => {
        state.companyDetail[key] = payload[key];
      });
    },
    removeCredential: (state) => {
      Object.keys(state.credential).map(
        (key) => (state.credential[key] = null)
      );
    },
    addCartItem: (state, payload) => {
      const { product, qty: addQty } = payload;
      const index = state.shopCart.findIndex(
        (item) => item.product.id == product.id
      );
      if (index != -1) {
        const itemInCart = state.shopCart[index];
        const totalQty = itemInCart.qty + addQty;
        totalQty >= state.shopCart
          ? (itemInCart.qty = itemInCart.product.stock)
          : (itemInCart.qty += addQty);
      } else state.shopCart.push({ product, qty: addQty });
    },
    removeCartItem: (state, payload) => {
      const { id } = payload.product;
      state.shopCart = state.shopCart.filter((item) => item.product.id != id);
    },
    emptyCartItem: (state) => (state.shopCart = []),
    addUser: (state, payload) => {
      if (!payload) return null;
      for (var item of payload) {
        const isExist = state.users.findIndex((user) => user.id == item.id);
        if (isExist == -1) state.users.push(item);
      }
    },
    updateUser: (state, [payload]) => {
      const index = state.users.findIndex((user) => user.id == payload.id);
      Object.keys(payload).map(
        (key) => (state.users[index][key] = payload[key])
      );
    },
    addPropertyAsset: (state, { propertyAsset }) => {
      const { id } = propertyAsset;
      const isExist = state.companyDetail.propertyAsset.findIndex(
        (asset) => asset.id == id
      );
      if (isExist == -1) state.companyDetail.propertyAsset.push(propertyAsset);
    },
    updatePropertyAsset: (state, { propertyAsset }) => {
      const { id } = propertyAsset;
      const index = state.companyDetail.propertyAsset.findIndex(
        (asset) => asset.id == id
      );
      if (index != -1) {
        Object.keys(state.companyDetail.propertyAsset[index]).map(
          (key) =>
            (state.companyDetail.propertyAsset[index][key] = propertyAsset[key])
        );
      }
    },
    deletePropertyAsset: (state, { propertyAsset }) => {
      state.companyDetail.propertyAsset =
        state.companyDetail.propertyAsset.filter(
          (asset) => asset.id != propertyAsset.id
        );
    },
    addTangibleAsset: (state, { tangibleAsset }) => {
      const { id } = tangibleAsset;
      const isExist = state.companyDetail.tangibleAsset.findIndex(
        (asset) => asset.id == id
      );
      if (isExist == -1) state.companyDetail.tangibleAsset.push(tangibleAsset);
    },
    updateTangibleAsset: (state, { tangibleAsset }) => {
      const { id } = tangibleAsset;
      const index = state.companyDetail.tangibleAsset.findIndex(
        (asset) => asset.id == id
      );
      if (index != -1) {
        Object.keys(state.companyDetail.tangibleAsset[index]).map(
          (key) =>
            (state.companyDetail.tangibleAsset[index][key] = tangibleAsset[key])
        );
      }
    },
    deleteTangibleAsset: (state, { tangibleAsset }) => {
      state.companyDetail.tangibleAsset =
        state.companyDetail.tangibleAsset.filter(
          (asset) => asset.id != tangibleAsset.id
        );
    },
    addIntangibleAsset: (state, { intangibleAsset }) => {
      const { id } = intangibleAsset;
      const isExist = state.companyDetail.intangibleAsset.findIndex(
        (asset) => asset.id == id
      );
      if (isExist == -1)
        state.companyDetail.intangibleAsset.push(intangibleAsset);
    },
    updateIntangibleAsset: (state, { intangibleAsset }) => {
      const { id } = intangibleAsset;
      const index = state.companyDetail.intangibleAsset.findIndex(
        (asset) => asset.id == id
      );
      if (index != -1) {
        Object.keys(state.companyDetail.intangibleAsset[index]).map(
          (key) =>
            (state.companyDetail.intangibleAsset[index][key] =
              intangibleAsset[key])
        );
      }
    },
    deleteIntangibleAsset: (state, { intangibleAsset }) => {
      state.companyDetail.intangibleAsset =
        state.companyDetail.intangibleAsset.filter(
          (asset) => asset.id != intangibleAsset.id
        );
    },
    updateTaxReport: (state, payload) => {
      for (var report of payload) {
        const index = state.companyDetail.taxReport.findIndex(
          (tax) => tax.id == report.id
        );
        if (index == -1) state.companyDetail.taxReport.push(report);
        if (index != -1) {
          let tax = state.companyDetail.taxReport[index];
          Object.keys(tax).keys((key) => {
            tax[key] = report[key];
          });
        }
      }
    },
    addExpenseCategory: (state, payload) => {
      for (var expenseCategory of payload) {
        const index = state.expCategory.findIndex(
          (expCat) => expCat.id == expenseCategory.id
        );
        if (index == -1) state.expCategory.push(expenseCategory);
      }
    },
    updateExpenseCategory: (state, payload) => {
      const index = state.expCategory.findIndex(
        (expense) => expense.id != payload.id
      );
      if (index != -1)
        Object.keys(state.expCategory[index]).map(
          (key) => (state.expCategory[index][key] = payload[key])
        );
    },
    addBudget: (state, payload) => {
      for (var budget of payload) {
        const index = state.budgets.findIndex((bdgt) => bdgt.id == budget.id);
        if (index == -1) state.budgets.push(budget);
      }
    },
    updateBudget: (state, payload) => {
      const index = state.budgets.findIndex(
        (budget) => budget.id != payload.id
      );
      if (index != -1)
        Object.keys(state.budgets[index]).map(
          (key) => (state.budgets[index][key] = payload[key])
        );
    },
    addExpense: (state, payload) => {
      for (var expense of payload) {
        const index = state.expenses.findIndex((exp) => exp.id == expense.id);
        console.log(expense.id, index);
        if (index == -1) state.expenses.push(expense);
      }
    },
    updateExpense: (state, payload) => {
      const index = state.expenses.findIndex(
        (expense) => expense.id != payload.id
      );
      if (index != -1)
        Object.keys(state.expenses[index]).map(
          (key) => (state.expenses[index][key] = payload[key])
        );
    },
    addProduct: (state, payload) => {
      for (var item of payload) {
        // console.log(item)
        const isExist = state.products.findIndex(
          (product) => product.id == item.id
        );
        if (isExist == -1) state.products.push(item);
      }
    },
    updateProduct: (state, payload) => {
      const index = state.products.findIndex(
        (product) => product.id == payload[0].id
      );
      if (index != -1) {
        Object.keys(state.products[index]).map(
          (key) => (state.products[index][key] = payload[0][key])
        );
      }
    },
    deleteProduct: (state, payload) => {
      state.products = state.products.filter(
        (product) => product.id != payload.id
      );
    },
    addTransaction: (state, payload) => {
      for (var item of payload) {
        const isExist = state.transactions.findIndex(
          (transaction) => transaction.id == item.id
        );
        if (isExist == -1) state.transactions.push(item);
      }
    },
    addActivity: (state, payload) => {
      for (var activity of payload) {
        const isExist = state.activites.findIndex(
          (act) => act.id == activity.id
        );
        if (isExist == -1) state.activites.push(activity);
      }
    },
    addRecentActivity: (state, payload) => {
      for (var activity of payload) {
        const isExist = state.recentActivities.findIndex(
          (activity) => activity.id == activity.id
        );
        if (isExist == -1) state.recentActivities.push(activity);
      }
    },
    addRecentTransaction: (state, payload) => {
      for (var transaction of payload) {
        const isExist = state.recentTransactions.findIndex(
          (transaction) => transaction.id == transaction.id
        );
        if (isExist == -1) state.recentTransactions.push(transaction);
      }
    },
    addPemilikModal: (state, payload) => {
      if (!payload) return null;
      for (var User of payload) {
        const index = state.laporan1771.namaPemilikModal.findIndex(
          (usr) => usr.id == User.id
        );
        const { user, amount } = User;
        const { id, username, npwp, address } = user;
        if (index == -1)
          state.laporan1771.namaPemilikModal.push({
            id,
            username,
            address,
            npwp,
            amount,
          });
      }
    },
    addPengurus: (state, payload) => {
      if (!payload) return null;
      for (var user of payload) {
        const index = state.laporan1771.namaPengurus.findIndex(
          (account) => account.id == user.id
        );
        const { username, address, npwp, position } = user;
        if (index == -1 && position == "Staff")
          state.laporan1771.namaPengurus.push({
            username,
            address,
            npwp,
            position,
          });
      }
    },
    setTotalPengeluaran: (state, payload) => {
      state.laporan1771.totalPengeluaran = 0;
      for (var { amount } of payload) {
        state.laporan1771.totalPengeluaran += parseFloat(amount);
      }
    },
    setTotalPengeluaranGaji: (state, payload) => {
      state.laporan1771.totalPengeluaranGaji = 0;
      if (payload.length == 0) return null;
      for (var { amount, expCategory: category } of payload) {
        if (category.name.toLowerCase().includes("gaji"))
          state.laporan1771.totalPengeluaranGaji += parseFloat(amount);
      }
    },
    setTotalSewa: (state, payload) => {
      state.laporan1771.totalSewa = 0;
      for (var { amount, expCategory: category, name } of payload) {
        name.toLowerCase();
        if (category.name.includes("sewa") || name.includes("sewa"))
          state.laporan1771.totalSewa += parseFloat(amount);
      }
    },
  },
  actions: {},
  modules: {},
});
