import HeaderBack from "./components/headerBack.js";
import LoaderIguana from "./components/loader_iguana.js";
import { Axiomi } from "./api.js";
const { createApp, ref, onMounted, reactive, watch, computed, nextTick } = Vue;

const app = createApp({
  setup() {
    const isLoading = ref(true);
    const foldersFormulasDB = ref([]);
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

    // Computed
    const filteredFoldersFormulas = computed(() => {
      return foldersFormulasDB.value.filter((folder) => {
        return folder.nombre.toLowerCase().includes(search.value.toLowerCase());
      });
    });

    // Lifecycle hooks
    onMounted(async () => {
      try {
        // isLoading.value = true;
        await getFoldersFormulas();
      } catch (error) {
        alert("Error al obtener los folders");
      } finally {
        isLoading.value = false;
      }
    });

    return {
      form,
      search,
      isLoading,
      foldersFormulasDB,
      filteredFoldersFormulas,
      createFolder,
    };
  },
});

app.component("header-back", HeaderBack);
app.component("loader-iguana", LoaderIguana);

app.mount("#app");
