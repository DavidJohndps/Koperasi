<template>
  <v-card class="my-2">
    <v-card-title>{{ activity.name }}</v-card-title>
    <v-card-text>
      <v-list-item
        v-for="[key, value] in Object.entries(Changes)"
        :key="key"
        two-line
      >
        <v-list-item-content>
          <v-list-item-title>{{ key }}</v-list-item-title>
          <v-list-item-subtitle>{{ value }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
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
    Changes() {
      const desc = this.activity.desc;
      const isUpdated = desc.includes("Changes");
      const isDeleted = desc.includes("Deleted");
      let trimmed = isUpdated
        ? trimStart(desc, "Changes: ") : isDeleted ? `"desc": "${desc}"`
        : trimStart(desc, "Added: ");
      return JSON.parse(`{${trimmed}}`);
    },
  },
};
</script>

<style></style>
