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
    const search = ref("");
    const folderToEdit = reactive({
      id: null,
      nombre: "",
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

    const eliminarExpediente = async (id) => {
      try {
        const { error } = await Axiomi.delete(`expedientes/${id}`);
        if (!error) {
          await getExpedientes();
        } else {
          alert("Error al eliminar el expediente");
        }
      } catch (error) {
        console.error(error);
        alert("Error al eliminar el expediente");
      }
    };

    const modoEdicion = (id) => {
      folderToEdit.id = id;
      folderToEdit.nombre = expedientes.value.find(
        (expediente) => expediente._id === id,
      ).nombre;
    };

    const limpiarFolderToEdit = () => {
      folderToEdit.id = null;
      folderToEdit.nombre = "";
    };

    const guardarEdicion = async () => {
      try {
        const { error } = await Axiomi.put(`expedientes/${folderToEdit.id}`, {
          nombre: folderToEdit.nombre,
        });
        if (!error) {
          await getExpedientes();
          limpiarFolderToEdit();
        } else {
          alert("Error al guardar la edición");
        }
      } catch (error) {
        console.error(error);
        alert("Error al guardar la edición");
      }
    };

    const cancelarEdicion = () => {
      limpiarFolderToEdit();
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
      search,
      expedientes,
      isLoading,
      folderToEdit,
      filteredExpedientes,
      createExpediente,
      eliminarExpediente,
      modoEdicion,
      guardarEdicion,
      cancelarEdicion,
    };
  },
});

app.component("header-back", HeaderBack);

app.mount("#app");
