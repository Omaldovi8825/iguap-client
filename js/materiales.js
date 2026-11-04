import HeaderBack from "./components/headerBack.js";
import LoaderIguana from "./components/loader_iguana.js";
import ModalBase from "./components/modal_base.js";
import Spinner from "./components/spinner.js";
import { Axiomi } from "./api.js";
import { getMateriales, formatMoney } from "./utils.js";
const { createApp, ref, onMounted, computed } = Vue;

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
      if (error) throw data;
      materialesDB.value = data;
    };

    const onSubmit = async () => {
      try {
        isLoading.value = true;
        const request = modoEdicion.value
          ? Axiomi.put(
              `materiales/${formMaterial.value._id}`,
              formMaterial.value,
            )
          : Axiomi.post("materiales", formMaterial.value);

        const { error } = await request;

        if (!error) {
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
        isLoading.value = true;
        const { error } = await Axiomi.delete(`materiales/${id}`);
        if (!error) {
          await getMaterialesDB();
        }
      } catch (error) {
        console.log(error);
        alert("Error al eliminar el material");
      } finally {
        isLoading.value = false;
      }
    };

    const abrirModalEditar = (material) => {
      const { created_at, ...resto } = material;
      formMaterial.value = { ...resto };
    };

    // Computed

    const materialesFiltrados = computed(() => {
      const terminos = search.value
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);
      if (!terminos.length) return materialesDB.value;

      return materialesDB.value.filter((material) => {
        const campos = [
          material.pieza,
          material.tipo,
          material.categoria,
          material.nombre,
          material.color,
        ].map((campo) => String(campo ?? "").toLowerCase());
        return terminos.every((termino) =>
          campos.some((campo) => campo.includes(termino)),
        );
      });
    });

    const materialesFormateados = computed(() => {
      return materialesFiltrados.value.map((material) => {
        return {
          ...material,
          precio: formatMoney(material.precio),
        };
      });
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
        firstLoad.value = false;
      } catch (error) {
        console.log(error);
        alert("Error al obtener los materiales");
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
      materialesFormateados,
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
app.component("spinner", Spinner);

app.mount("#app");
