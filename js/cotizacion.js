import { Axiomi } from "./api.js";
import {
  fetchMateriales,
  aplicarFormula,
  formatFormula,
  formatMedida,
  formatMoney,
  cmAm,
  formatNombreTabla,
} from "./utils.js";
import FormMaterial from "./components/form_material.js";
const { createApp, ref, onMounted, reactive, watch, computed, nextTick } = Vue;

const id_cotizacion = new URLSearchParams(window.location.search).get("id");

const app = createApp({
  setup() {
    const heading = ref("Nueva cotización");
    const formCotizacion = reactive({
      ancho: "",
      alto: "",
      manoObra: "",
      extras: "",
      materiales: [],
    });
    const materialesDB = ref([]);

    // computed properties
    const cotizacion = computed(() => {
      const materiales = formCotizacion.materiales.map((material) => {
        const materialDB = materialesDB.value.find((m) => m.id === material.id);

        const ancho = aplicarFormula(
          formCotizacion.ancho,
          material.formulas.ancho,
        );
        const alto = aplicarFormula(
          formCotizacion.alto,
          material.formulas.alto,
        );

        const factorAncho = ancho ? cmAm(ancho) : 1;
        const factorAlto = alto ? cmAm(alto) : 1;
        const precio =
          factorAncho * factorAlto * materialDB.precio * material.cantidad;

        return {
          id: material.id,
          nombre: formatNombreTabla(materialDB),
          cantidad: material.cantidad,
          formula: formatFormula(material.formulas),
          medida: formatMedida(ancho, alto),
          precio,
        };
      });

      const totalMateriales = materiales.reduce(
        (acc, material) => acc + material.precio,
        0,
      );
      const manoObra = formCotizacion.manoObra
        ? (totalMateriales * formCotizacion.manoObra) / 100
        : 0;
      const extras = formCotizacion.extras || 0;

      return {
        materiales,
        desglose: {
          materiales: totalMateriales,
          manoObra,
          extras,
          total: totalMateriales + manoObra + extras,
        },
      };
    });

    //Methods
    const agregarMaterial = (material) => {
      formCotizacion.materiales.push(material);
    };

    const eliminarMaterial = (index) => {
      formCotizacion.materiales.splice(index, 1);
    };

    const getMateriales = async () => {
      try {
        const materiales = await fetchMateriales();
        materialesDB.value = materiales;
      } catch (error) {
        console.error("Error al obtener los materiales:", error);
      }
    };

    // Lifecycle hooks
    onMounted(async () => {
      await getMateriales();
      if (id_cotizacion) {
        await getFormula();
      }
    });

    const getFormula = async () => {
      try {
        const response = await Axiomi.get(`formulas/${id_cotizacion}`);
        const { error, data } = await response.json();
        if (!error) {
          heading.value = `Cotización: ${data.nombre}`;
          formCotizacion.materiales = data.materiales;
        }
      } catch (error) {
        console.error("Error al obtener la fórmula:", error);
        alert("Error al obtener la fórmula");
      }
    };

    return {
      heading,
      materialesDB,
      formCotizacion,
      cotizacion,
      agregarMaterial,
      eliminarMaterial,
      formatMoney,
    };
  },
});

//Components
app.component("form-material", FormMaterial);

app.mount("#app");
