import { Axiomi } from "./api.js";
import HeaderBack from "./components/headerBack.js";
import LoaderIguana from "./components/loader_iguana.js";
import CardFolder from "./components/cardFolder.js";
import Spinner from "./components/spinner.js";
const { createApp, ref, onMounted, computed } = Vue;

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
    const expedientesDB = ref([]);

    const getExpedientes = async () => {
      const { error, data, mensaje } = await Axiomi.get("expedientes");
      if (error) throw mensaje;
      expedientesDB.value = data;
    };

    const createExpediente = async () => {
      if (!form.value.nombre.value.trim()) {
        form.value.nombre.error = "El nombre del expediente es requerido";
        return;
      }
      try {
        isLoading.value = true;
        const { error, mensaje } = await Axiomi.post("expedientes", {
          nombre: form.value.nombre.value,
        });
        if (error) throw mensaje;

        form.value = {
          nombre: {
            value: "",
            error: "",
          },
        };
        await getExpedientes();
      } catch (error) {
        alert(error);
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
        const { error, mensaje } = await Axiomi.delete(`expedientes/${id}`);
        if (error) throw mensaje;
        await getExpedientes();
      } catch (error) {
        alert(error);
      } finally {
        isLoading.value = false;
      }
    };

    const guardarEdicion = async (id, nombre) => {
      try {
        isLoading.value = true;
        const { error, mensaje } = await Axiomi.put(`expedientes/${id}`, {
          nombre: nombre,
        });
        if (error) throw mensaje;
        await getExpedientes();
      } catch (error) {
        alert(error);
      } finally {
        isLoading.value = false;
      }
    };

    //computed
    const filteredExpedientes = computed(() => {
      return expedientesDB.value.filter((expediente) => {
        return expediente.nombre
          .toLowerCase()
          .includes(search.value.toLowerCase());
      });
    });

    //Life cycle
    onMounted(async () => {
      try {
        await getExpedientes();
        initialLoad.value = false;
      } catch (error) {
        alert(error);
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
