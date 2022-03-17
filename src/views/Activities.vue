<template>
  <v-container>
    <v-row>
      <v-col cols="4" v-for="activity in Activities" :key="activity.id">
        <Activity :activity="activity" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import store from "../store";

import Activity from "../components/Activity.vue";

import GET_ACTIVITY from "../graphql/GetActivity.gql";
export default {
  components: {
    Activity,
  },
  computed: {
    Activities() {
      return this.$store.getters.getActivities
    }
  },
  data() {
    return {
      isRecent: false,
      sort: "asc",
      activities: null,
    };
  },
  apollo: {
    activities: {
      query: GET_ACTIVITY,
      update: (data) => data.Activities.activity,
      result: ({ data }) =>
        store.commit("addActivity", data.Activities.activity),
    },
  },
};
</script>

<style></style>
