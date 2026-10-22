import { Axiomi } from "./api.js";
import HeaderBack from "./components/headerBack.js";
const { createApp, ref, onMounted, reactive, watch, computed, nextTick } = Vue;

const idExpediente = new URLSearchParams(window.location.search).get("id");

const app = createApp({
  setup() {
    const isLoading = ref(false);
    const expediente = ref({
      _id: null,
      nombre: "",
      createdAt: "",
      cotizaciones: [],
    });

    const getExpediente = async () => {
      const { error, data } = await Axiomi.get(`expedientes/${idExpediente}`);
      if (!error) {
        expediente.value = data;
      } else {
        alert("Error al obtener el expediente");
      }
    };

    //life cycle
    onMounted(async () => {
      try {
        isLoading.value = true;
        await getExpediente();
      } catch (error) {
        console.error(error);
        alert("Error al obtener el expediente");
      } finally {
        isLoading.value = false;
      }
    });
    return {
      isLoading,
      expediente,
    };
  },
});

app.component("header-back", HeaderBack);

app.mount("#app");
