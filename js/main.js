import { Axiomi } from "./api.js";
import LoaderIguana from "./components/loader_iguana.js";
const { createApp, ref, onMounted } = Vue;

const app = createApp({
  setup() {
    const initialLoad = ref(true);

    onMounted(async () => {
      const { error } = await Axiomi.get("auth/check-token");
      if (!error) {
        initialLoad.value = false;
      }
    });

    return {
      initialLoad,
    };
  },
});

app.component("loader-iguana", LoaderIguana);

app.mount("#app");
