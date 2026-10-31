import HeaderBack from "./components/headerBack.js";
import LoaderIguana from "./components/loader_iguana.js";
import CardFolder from "./components/cardFolder.js";
import Spinner from "./components/spinner.js";
import { Axiomi } from "./api.js";
const { createApp, ref, onMounted, reactive, watch, computed, nextTick } = Vue;

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
      const { error, data } = await Axiomi.get("folders-formulas");
      if (!error) {
        foldersFormulasDB.value = data;
      }
    };

    const getFormulasSingle = async () => {
      const { error, data } = await Axiomi.get("formulas/single");
      if (!error) {
        formulasSingleDB.value = data;
      }
    };

    const createFolder = async () => {
      if (!form.value.nombre.value.trim()) {
        form.value.nombre.error = "El nombre del folder es requerido";
        return;
      }
      try {
        isLoading.value = true;
        const { error, data } = await Axiomi.post("folders-formulas", {
          nombre: form.value.nombre.value,
        });

        if (!error) {
          form.value = {
            nombre: {
              value: "",
              error: "",
            },
          };
          await getFoldersFormulas();
        } else {
          alert("Error al crear el expediente");
        }
      } catch (error) {
        console.error(error);
        alert("Error al crear el expediente");
      } finally {
        isLoading.value = false;
      }
    };

    const guardarEdicion = async (id, nombre) => {
      try {
        isLoading.value = true;
        const { error } = await Axiomi.put(`folders-formulas/${id}`, {
          nombre,
        });
        if (!error) {
          await getFoldersFormulas();
        } else {
          alert("Error al guardar la edición");
        }
      } catch (error) {
        console.error(error);
        alert("Error al guardar la edición");
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
        const { error } = await Axiomi.delete(`folders-formulas/${id}`);
        if (!error) {
          await getFoldersFormulas();
        }
      } catch (error) {
        console.error(error);
        alert("Error al eliminar el folder");
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
      } catch (error) {
        alert("Error al obtener las fórmulas");
      } finally {
        initialLoad.value = false;
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
