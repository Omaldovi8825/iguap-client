import HeaderBack from "./components/headerBack.js";
import LoaderIguana from "./components/loader_iguana.js";
import ModalBase from "./components/modal_base.js";
import { Axiomi } from "./api.js";
const { createApp, ref, onMounted, computed } = Vue;
import { getMateriales } from "./utils.js";

const formMaterialVacio = {
  _id: "",
  pieza: "",
  tipo: "",
  categoria: "",
  nombre: "",
  medida: "",
  unidad: "",
  color: "",
  precio: "",
  unidad_precio: "",
};

const app = createApp({
  setup() {
    const firstLoad = ref(true);
    const isLoading = ref(false);
    const formMaterial = ref({ ...formMaterialVacio });
    const materialesDB = ref([]);
    const search = ref("");
    const modalEl = ref(null);

    //Methods
    const limpiarFormMaterial = () => {
      formMaterial.value = { ...formMaterialVacio };
    };

    const getMaterialesDB = async () => {
      const { error, data } = await getMateriales();
      if (!error) {
        materialesDB.value = data;
      }
    };

    const onSubmit = async () => {
      try {
        isLoading.value = true;
        let errorCall = null;

        if (modoEdicion.value) {
          const { error } = await Axiomi.put(
            `materiales/${formMaterial.value._id}`,
            formMaterial.value,
          );
          errorCall = error;
        } else {
          const { error } = await Axiomi.post("materiales", formMaterial.value);
          errorCall = error;
        }

        if (!errorCall) {
          await getMaterialesDB();
          limpiarFormMaterial();
        }
      } catch (error) {
        console.log(error);
        alert("Error al procesar la solicitud");
      } finally {
        isLoading.value = false;
        bootstrap.Modal.getInstance(modalEl.value.$el)?.hide();
      }
    };

    const eliminarMaterial = async (id) => {
      if (!confirm("¿Eliminar este material?")) return;
      try {
        const { error } = await Axiomi.delete(`materiales/${id}`);
        if (!error) await getMaterialesDB();
      } catch (error) {
        console.log(error);
        alert("Error al eliminar el material");
      }
    };

    const abrirModalEditar = (material) => {
      const { created_at, ...resto } = material;
      formMaterial.value = { ...resto };
    };

    // Computed
    const materialesFiltrados = computed(() => {
      const q = search.value.trim().toLowerCase();
      if (!q) return materialesDB.value;
      return materialesDB.value.filter((material) =>
        [
          material.pieza,
          material.tipo,
          material.categoria,
          material.nombre,
          material.color,
        ].some((campo) =>
          String(campo ?? "")
            .toLowerCase()
            .includes(q),
        ),
      );
    });

    const modoEdicion = computed(() => {
      return formMaterial.value._id !== "";
    });

    // Lifecycle hooks
    onMounted(async () => {
      modalEl.value.$el.addEventListener(
        "hidden.bs.modal",
        limpiarFormMaterial,
      );

      try {
        await getMaterialesDB();
      } catch (error) {
        console.log(error);
        alert("Error al obtener los materiales");
      } finally {
        firstLoad.value = false;
      }
    });

    // Watches

    return {
      modalEl,
      firstLoad,
      isLoading,
      formMaterial,
      materialesDB,
      search,
      materialesFiltrados,
      modoEdicion,
      onSubmit,
      abrirModalEditar,
      limpiarFormMaterial,
      eliminarMaterial,
    };
  },
});

app.component("header-back", HeaderBack);
app.component("loader-iguana", LoaderIguana);
app.component("modal-base", ModalBase);

app.mount("#app");
