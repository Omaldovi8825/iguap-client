import HeaderBack from "./components/headerBack.js";
import Spinner from "./components/spinner.js";
import LoaderIguana from "./components/loader_iguana.js";
import { Axiomi } from "./api.js";
import { formatDate, aplicarFormula, cmAm, formatMoney } from "./utils.js";
const { createApp, ref, onMounted, computed } = Vue;

const idExpediente = new URLSearchParams(window.location.search).get("id");

const app = createApp({
  setup() {
    const initialLoad = ref(true);
    const isLoading = ref(false);
    const expedienteDB = ref({
      _id: null,
      nombre: "",
      createdAt: "",
    });
    const cotizacionesDB = ref([]);

    // Methods
    const getExpediente = async () => {
      const { error, data, mensaje } = await Axiomi.get(
        `expedientes/${idExpediente}`,
      );
      if (error) throw mensaje;
      expedienteDB.value = data;
    };

    const getCotizacionesExpediente = async () => {
      const { error, data, mensaje } = await Axiomi.get(
        `cotizaciones?id_expediente=${idExpediente}`,
      );
      if (error) throw mensaje;
      cotizacionesDB.value = data;
    };

    const eliminarCotizacion = async (idCotizacion) => {
      if (!confirm("¿Estás seguro de eliminar esta cotización?")) {
        return;
      }
      try {
        isLoading.value = true;
        const { error, mensaje } = await Axiomi.delete(
          `cotizaciones/${idCotizacion}`,
        );
        if (error) throw mensaje;
        await getCotizacionesExpediente();
      } catch (error) {
        alert(error);
      } finally {
        isLoading.value = false;
      }
    };

    //Computed properties
    const contizacionesTabla = computed(() => {
      return cotizacionesDB.value.map((cotizacion) => {
        const { _id, nombre, createdAt, manoObra, extras } = cotizacion;
        const precioMateriales = cotizacion.materiales
          .map((material) => {
            const ancho = aplicarFormula(
              cotizacion.ancho,
              material.formulas.ancho,
            );
            const alto = aplicarFormula(
              cotizacion.alto,
              material.formulas.alto,
            );

            const factorAncho = ancho ? cmAm(ancho) : 1;
            const factorAlto = alto ? cmAm(alto) : 1;
            const precioMaterial = material.precio;

            const precio =
              factorAncho * factorAlto * precioMaterial * material.cantidad;

            return precio;
          })
          .reduce((acc, precio) => acc + precio, 0);

        const totalManoObra = manoObra
          ? (precioMateriales * manoObra) / 100
          : 0;
        const totalExtras = extras || 0;

        const total = precioMateriales + totalManoObra + totalExtras;

        return {
          id: _id,
          nombre,
          fecha: formatDate(createdAt),
          precio: formatMoney(total),
        };
      });
    });

    //life cycle
    onMounted(async () => {
      try {
        await getExpediente();
        await getCotizacionesExpediente();
        initialLoad.value = false;
      } catch (error) {
        alert(error);
      }
    });
    return {
      initialLoad,
      isLoading,
      expedienteDB,
      cotizacionesDB,
      contizacionesTabla,
      eliminarCotizacion,
    };
  },
});

app.component("header-back", HeaderBack);
app.component("spinner", Spinner);
app.component("loader-iguana", LoaderIguana);

app.mount("#app");
