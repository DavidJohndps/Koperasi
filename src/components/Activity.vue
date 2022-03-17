<template>
  <v-card class="my-2">
    <v-card-title>{{ activity.name }}</v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="6">
          <v-card elevation="1">
            <v-card-title>Before</v-card-title>
            <v-card-text>
              <v-list-item
                v-for="[key, value] in Object.entries(Before)"
                :key="key"
                two-line
              >
                <v-list-item-content>
                  <v-list-item-title>{{ key }}</v-list-item-title>
                  <v-list-item-subtitle>{{ value }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6">
          <v-card elevation="1">
            <v-card-title>After</v-card-title>
            <v-card-text>
              <v-list-item
                v-for="[key, value] in Object.entries(After)"
                :key="key"
                two-line
              >
                <v-list-item-content>
                  <v-list-item-title>{{ key }}</v-list-item-title>
                  <v-list-item-subtitle>{{ value }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions
      >{{ CreatedAt }}, {{ activity.verBy.username }}</v-card-actions
    >
  </v-card>
</template>

<script>
import { trimStart } from "lodash";
export default {
  props: {
    activity: {
      required: true,
    },
  },
  computed: {
    CreatedAt() {
      let date = new Date(this.activity.createdAt).toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        time = new Date(this.activity.createdAt).toLocaleTimeString("id-ID", {
          timeStyle: "short",
          hour12: true,
        });
      return `${date}, ${time}`;
    },
    Before() {
      const [before] = this.activity.desc.split(" | ");
      const trimmed = trimStart(before, "Before: ");
      const string = `{${trimmed}}`;
      try {
        if (trimmed == "null") return {};
        else return JSON.parse(string);
      } catch (err) {
        console.log(err);
        return trimmed
      }
    },
    After() {
      const after = this.activity.desc.split(" | ")[1];
      const trimmed = trimStart(after, "After: ");
      return JSON.parse(`{${trimmed}}`)
    },
  },
};
</script>

<style></style>
