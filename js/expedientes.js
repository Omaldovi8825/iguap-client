import { Axiomi } from "./api.js";
import HeaderBack from "./components/headerBack.js";
import LoaderIguana from "./components/loader_iguana.js";
import CardFolder from "./components/cardFolder.js";
import Spinner from "./components/spinner.js";
const { createApp, ref, onMounted, reactive, watch, computed, nextTick } = Vue;

const app = createApp({
  setup() {
    const initialLoad = ref(true);
    const isLoading = ref(false);
    const form = ref({
      nombre: {
        value: "",
        error: "",
      },
    });
    const search = ref("");
    const expedientes = ref([]);

    const getExpedientes = async () => {
      const { error, data } = await Axiomi.get("expedientes");
      if (!error) {
        expedientes.value = data;
      }
    };

    const createExpediente = async () => {
      if (!form.value.nombre.value.trim()) {
        form.value.nombre.error = "El nombre del expediente es requerido";
        return;
      }
      try {
        isLoading.value = true;
        const { error, data } = await Axiomi.post("expedientes", {
          nombre: form.value.nombre.value,
        });

        if (!error) {
          form.value = {
            nombre: {
              value: "",
              error: "",
            },
          };
          await getExpedientes();
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

    const eliminarExpediente = async (id) => {
      if (!confirm("¿Estás seguro de querer eliminar este expediente?")) {
        return;
      }
      try {
        isLoading.value = true;
        const { error } = await Axiomi.delete(`expedientes/${id}`);
        if (!error) {
          await getExpedientes();
        } else {
          alert("Error al eliminar el expediente");
        }
      } catch (error) {
        console.error(error);
        alert("Error al eliminar el expediente");
      } finally {
        isLoading.value = false;
      }
    };

    const guardarEdicion = async (id, nombre) => {
      try {
        isLoading.value = true;
        const { error } = await Axiomi.put(`expedientes/${id}`, {
          nombre: nombre,
        });
        if (!error) {
          await getExpedientes();
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

    //computed
    const filteredExpedientes = computed(() => {
      return expedientes.value.filter((expediente) => {
        return expediente.nombre
          .toLowerCase()
          .includes(search.value.toLowerCase());
      });
    });

    //Life cycle
    onMounted(async () => {
      try {
        initialLoad.value = true;
        await getExpedientes();
        initialLoad.value = false;
      } catch (error) {
        alert("Error al obtener los expedientes");
        console.error(error);
      }
    });

    return {
      initialLoad,
      form,
      search,
      isLoading,
      filteredExpedientes,
      createExpediente,
      eliminarExpediente,
      guardarEdicion,
    };
  },
});

app.component("header-back", HeaderBack);
app.component("loader-iguana", LoaderIguana);
app.component("card-folder", CardFolder);
app.component("spinner", Spinner);

app.mount("#app");
