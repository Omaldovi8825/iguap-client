import { Axiomi } from "./api.js";
import HeaderBack from "./components/headerBack.js";
const { createApp, ref, onMounted, reactive, watch, computed, nextTick } = Vue;

const app = createApp({
  setup() {
    const form = ref({
      nombre: {
        value: "",
        error: "",
      },
    });
    const isLoading = ref(false);
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

    //Life cycle
    onMounted(async () => {
      try {
        isLoading.value = true;
        await getExpedientes();
      } catch (error) {
        alert("Error al obtener los expedientes");
        console.error(error);
      } finally {
        isLoading.value = false;
      }
    });

    return {
      form,
      expedientes,
      isLoading,
      createExpediente,
    };
  },
});

app.component("header-back", HeaderBack);

app.mount("#app");
