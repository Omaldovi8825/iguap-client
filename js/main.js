import LoaderIguana from "./components/loader_iguana.js";
import { Axiomi } from "./api.js";
import { logout } from "./utils.js";
const { createApp, ref, onMounted } = Vue;

const app = createApp({
  setup() {
    const initialLoad = ref(true);

    const logOut = () => {
      logout();
    };

    onMounted(async () => {
      const { error } = await Axiomi.get("auth/check-token");
      if (!error) {
        initialLoad.value = false;
      }
    });

    return {
      initialLoad,
      logOut,
    };
  },
});

app.component("loader-iguana", LoaderIguana);

app.mount("#app");
