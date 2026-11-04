import HeaderBack from "./components/headerBack.js";
import LoaderIguana from "./components/loader_iguana.js";
import CardFolder from "./components/cardFolder.js";
import Spinner from "./components/spinner.js";
import { Axiomi } from "./api.js";
const { createApp, ref, onMounted, computed } = Vue;

const app = createApp({
  setup() {
    const initialLoad = ref(true);
    const isLoading = ref(false);
    const foldersFormulasDB = ref([]);
    const formulasSingleDB = ref([]);
    const form = ref({
      nombre: {
        value: "",
        error: "",
      },
    });
    const search = ref("");

    //Methods
    const getFoldersFormulas = async () => {
      const { error, data, mensaje } = await Axiomi.get("folders-formulas");
      if (error) throw mensaje;
      foldersFormulasDB.value = data;
    };

    const getFormulasSingle = async () => {
      const { error, data, mensaje } = await Axiomi.get("formulas/single");
      if (error) throw mensaje;
      formulasSingleDB.value = data;
    };

    const createFolder = async () => {
      if (!form.value.nombre.value.trim()) {
        form.value.nombre.error = "El nombre del folder es requerido";
        return;
      }
      try {
        isLoading.value = true;
        const { error, mensaje } = await Axiomi.post("folders-formulas", {
          nombre: form.value.nombre.value,
        });
        if (error) throw mensaje;

        form.value = {
          nombre: {
            value: "",
            error: "",
          },
        };
        await getFoldersFormulas();
      } catch (error) {
        alert(error);
      } finally {
        isLoading.value = false;
      }
    };

    const guardarEdicion = async (id, nombre) => {
      try {
        isLoading.value = true;
        const { error, mensaje } = await Axiomi.put(`folders-formulas/${id}`, {
          nombre,
        });
        if (error) throw mensaje;
        await getFoldersFormulas();
      } catch (error) {
        alert(error);
      } finally {
        isLoading.value = false;
      }
    };

    const eliminarFolder = async (id) => {
      if (!confirm("¿Estás seguro de querer eliminar este folder?")) {
        return;
      }
      try {
        isLoading.value = true;
        const { error, mensaje } = await Axiomi.delete(
          `folders-formulas/${id}`,
        );
        if (error) throw mensaje;
        await getFoldersFormulas();
      } catch (error) {
        alert(error);
      } finally {
        isLoading.value = false;
      }
    };

    // Computed
    const filteredFoldersFormulas = computed(() => {
      return foldersFormulasDB.value.filter((folder) => {
        return folder.nombre.toLowerCase().includes(search.value.toLowerCase());
      });
    });

    const filteredFormulasSingle = computed(() => {
      return formulasSingleDB.value.filter((formula) => {
        return formula.nombre
          .toLowerCase()
          .includes(search.value.toLowerCase());
      });
    });

    // Lifecycle hooks
    onMounted(async () => {
      try {
        await getFoldersFormulas();
        await getFormulasSingle();
        initialLoad.value = false;
      } catch (error) {
        alert(error);
      }
    });

    return {
      form,
      search,
      initialLoad,
      isLoading,
      foldersFormulasDB,
      formulasSingleDB,
      filteredFoldersFormulas,
      filteredFormulasSingle,
      createFolder,
      guardarEdicion,
      eliminarFolder,
    };
  },
});

app.component("header-back", HeaderBack);
app.component("loader-iguana", LoaderIguana);
app.component("card-folder", CardFolder);
app.component("spinner", Spinner);

app.mount("#app");
