import HeaderBack from "./components/headerBack.js";
import LoaderIguana from "./components/loader_iguana.js";
import { Axiomi } from "./api.js";
const { createApp, ref, onMounted } = Vue;

const id_folder = new URLSearchParams(window.location.search).get("id_folder");

const app = createApp({
  setup() {
    const isLoading = ref(true);
    const folderDB = ref(null);
    const formulasDB = ref([]);

    //Methods
    const getFolderFormula = async () => {
      const { error, data, mensaje } = await Axiomi.get(
        `folders-formulas/${id_folder}`,
      );
      if (error) throw mensaje;
      folderDB.value = data;
    };

    const getFormulasDB = async () => {
      const { error, data, mensaje } = await Axiomi.get(
        `formulas?id_folder=${id_folder}`,
      );
      if (error) throw mensaje;
      formulasDB.value = data;
    };

    const clonarFormula = async (id_formula) => {
      try {
        isLoading.value = true;
        const { error, mensaje } = await Axiomi.post(
          `formulas/${id_formula}/clone`,
        );
        if (error) throw mensaje;
        await getFormulasDB();
      } catch (error) {
        alert(error);
      } finally {
        isLoading.value = false;
      }
    };

    // Computed

    // Lifecycle hooks
    onMounted(async () => {
      try {
        await getFolderFormula();
        await getFormulasDB();
        isLoading.value = false;
      } catch (error) {
        alert(error);
      }
    });

    return {
      isLoading,
      folderDB,
      formulasDB,
      clonarFormula,
    };
  },
});

app.component("header-back", HeaderBack);
app.component("loader-iguana", LoaderIguana);

app.mount("#app");
