import HeaderBack from "./components/headerBack.js";
import Spinner from "./components/spinner.js";
import LoaderIguana from "./components/loader_iguana.js";
import { Axiomi } from "./api.js";
import { formatDate } from "./utils.js";
const { createApp, ref, onMounted, reactive, watch, computed, nextTick } = Vue;

const idExpediente = new URLSearchParams(window.location.search).get("id");

const app = createApp({
  setup() {
    const initialLoad = ref(true);
    const isLoading = ref(false);
    const expediente = ref({
      _id: null,
      nombre: "",
      createdAt: "",
    });
    const cotizaciones = ref([]);

    // Methods
    const getExpediente = async () => {
      const { error, data } = await Axiomi.get(`expedientes/${idExpediente}`);
      if (!error) {
        expediente.value = data;
      } else {
        throw new Error(data);
      }
    };

    const getCotizacionesExpediente = async () => {
      const { error, data } = await Axiomi.get(
        `cotizaciones?id_expediente=${idExpediente}`,
      );
      if (!error) {
        cotizaciones.value = data;
      } else {
        throw new Error(data);
      }
    };

    const eliminarCotizacion = async (idCotizacion) => {
      if (!confirm("¿Estás seguro de querer eliminar esta cotización?")) {
        return;
      }
      try {
        isLoading.value = true;
        const { error } = await Axiomi.delete(`cotizaciones/${idCotizacion}`);
        if (!error) {
          await getExpediente();
        }
      } catch (error) {
        console.error(error);
        alert("Error al eliminar la cotización");
      } finally {
        isLoading.value = false;
      }
    };

    //life cycle
    onMounted(async () => {
      try {
        await getExpediente();
        await getCotizacionesExpediente();
      } catch (error) {
        console.error(error);
        alert("Error al obtener el expediente");
      } finally {
        initialLoad.value = false;
      }
    });
    return {
      initialLoad,
      isLoading,
      expediente,
      cotizaciones,
      eliminarCotizacion,
      formatDate,
    };
  },
});

app.component("header-back", HeaderBack);
app.component("spinner", Spinner);
app.component("loader-iguana", LoaderIguana);

app.mount("#app");
