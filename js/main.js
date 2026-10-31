import { Axiomi } from "./api.js";
import LoaderIguana from "./components/loader_iguana.js";
const { createApp, ref, onMounted } = Vue;

const app = createApp({
  setup() {
    const isLoading = ref(true);

    const startLoading = async () => {
      try {
        await Axiomi.load();
      } catch (error) {
        alert("Error al iniciar la capp");
      } finally {
        isLoading.value = false;
      }
    };

    // Lifecycle hooks
    onMounted(async () => {
      await startLoading();
    });

    return {
      isLoading,
    };
  },
});

app.component("loader-iguana", LoaderIguana);

app.mount("#app");
