import { Axiomi } from "./api.js";
import HeaderBack from "./components/HeaderBack.vue";
const { createApp, ref, onMounted, reactive, watch, computed, nextTick } = Vue;

const app = createApp({
  setup() {
    return {};
  },
});

app.component("header-back", headerBack);

app.mount("#app");
