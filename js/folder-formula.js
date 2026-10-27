import HeaderBack from "./components/headerBack.js";
import LoaderIguana from "./components/loader_iguana.js";
import { Axiomi } from "./api.js";
const { createApp, ref, onMounted, reactive, watch, computed, nextTick } = Vue;

const id_folder = new URLSearchParams(window.location.search).get("id_folder");

const app = createApp({
  setup() {
    const isLoading = ref(true);
    const folder = ref(null);

    //Methods
    const getFolderFormula = async () => {
      const { error, data } = await Axiomi.get(`folders-formulas/${id_folder}`);
      if (!error) {
        folder.value = data;
      }
    };
    // Computed

    // Lifecycle hooks
    onMounted(async () => {
      try {
        await getFolderFormula();
      } catch (error) {
        console.log(error);
        alert("Error al cargar el folder de fórmulas");
      } finally {
        isLoading.value = false;
      }
    });

    return {
      isLoading,
      folder,
    };
  },
});

app.component("header-back", HeaderBack);
app.component("loader-iguana", LoaderIguana);

app.mount("#app");
