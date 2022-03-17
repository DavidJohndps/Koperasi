import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    currentRoute: null,
    credential: {
      id: null,
      username: null,
      position: null,
      accessToken: null,
    },
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
    getShopCart: (state) => state.shopCart,
    getUsers: (state) => state.users,
    getProducts: (state) => state.products,
    getTransactions: (state) => state.transactions,
    getActivities: (state) => state.activites,
  },
  mutations: {
    updateRoute: (state, payload) => (state.currentRoute = payload),
    updateCredential: (state, payload) => {
      Object.keys(payload).map((key) => {
        state.credential[key] = payload[key];
      });
    },
    removeCredential: (state) => {
      Object.keys(state.credential).map(key => state.credential[key] = null)
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
      payload.forEach((item) => {
        const isExist = state.users.findIndex((user) => user.id == item.id);
        if (isExist == -1) state.users.push(item);
      });
    },
    addProduct: (state, payload) => {
      payload.forEach((item) => {
        const isExist = state.products.findIndex(
          (product) => product.id == item.id
        );
        if (isExist == -1) state.products.push(item);
      });
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
    addTransaction: (state, payload) => {
      payload.forEach((item) => {
        const isExist = state.transactions.findIndex(
          (transaction) => transaction.id == item.id
        );
        if (isExist == -1) state.transactions.push(item);
      });
    },
    addActivity: (state, payload) => {
      payload.forEach((event) => {
        const isExist = state.activites.findIndex(
          (activity) => activity.id == event.id
        );
        if (isExist == -1) state.activites.push(event);
      });
    },
  },
  actions: {},
  modules: {},
});
