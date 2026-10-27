// import { Axiomi } from "./api.js";
// import {
//   fetchMateriales,
//   aplicarFormula,
//   formatFormula,
//   formatMedida,
//   formatMoney,
//   cmAm,
//   formatNombreTabla,
// } from "./utils.js";
// import FormMaterial from "./components/form_material.js";
// import HeaderBack from "./components/headerBack.js";
// const { createApp, ref, onMounted, reactive, watch, computed, nextTick } = Vue;

// const id_cotizacion = new URLSearchParams(window.location.search).get("id");

// const app = createApp({
//   setup() {
//     const heading = ref("Nueva cotización");
//     const formCotizacion = reactive({
//       ancho: "",
//       alto: "",
//       manoObra: "",
//       extras: "",
//       materiales: [],
//     });
//     const materialesDB = ref([]);
//     const isLoading = ref(false);

//     // computed properties
//     const cotizacion = computed(() => {
//       const materiales = formCotizacion.materiales.map((material) => {
//         const materialDB = materialesDB.value.find((m) => m.id === material.id);

//         const ancho = aplicarFormula(
//           formCotizacion.ancho,
//           material.formulas.ancho,
//         );
//         const alto = aplicarFormula(
//           formCotizacion.alto,
//           material.formulas.alto,
//         );

//         const factorAncho = ancho ? cmAm(ancho) : 1;
//         const factorAlto = alto ? cmAm(alto) : 1;
//         const precio =
//           factorAncho * factorAlto * materialDB.precio * material.cantidad;

//         return {
//           id: material.id,
//           nombre: formatNombreTabla(materialDB),
//           cantidad: material.cantidad,
//           formula: formatFormula(material.formulas),
//           medida: formatMedida(ancho, alto),
//           precio,
//         };
//       });

//       const totalMateriales = materiales.reduce(
//         (acc, material) => acc + material.precio,
//         0,
//       );
//       const manoObra = formCotizacion.manoObra
//         ? (totalMateriales * formCotizacion.manoObra) / 100
//         : 0;
//       const extras = formCotizacion.extras || 0;

//       return {
//         materiales,
//         desglose: {
//           materiales: totalMateriales,
//           manoObra,
//           extras,
//           total: totalMateriales + manoObra + extras,
//         },
//       };
//     });

//     //Methods
//     const agregarMaterial = (material) => {
//       formCotizacion.materiales.push(material);
//     };

//     const eliminarMaterial = (index) => {
//       formCotizacion.materiales.splice(index, 1);
//     };

//     const getMateriales = async () => {
//       const materiales = await fetchMateriales();
//       materialesDB.value = materiales;
//     };

//     const getFormula = async () => {
//       const { error, data } = await Axiomi.get(`formulas/${id_cotizacion}`);
//       if (!error) {
//         heading.value = `Cotización: ${data.nombre}`;
//         formCotizacion.materiales = data.materiales;
//       }
//     };

//     // Lifecycle hooks
//     onMounted(async () => {
//       try {
//         isLoading.value = true;
//         await getMateriales();
//         if (id_cotizacion) {
//           await getFormula();
//         }
//       } catch (error) {
//         alert("Error al obtener los datos de la cotización");
//         console.error("Error al obtener los datos", error);
//       } finally {
//         isLoading.value = false;
//       }
//     });

//     return {
//       heading,
//       isLoading,
//       materialesDB,
//       formCotizacion,
//       cotizacion,
//       agregarMaterial,
//       eliminarMaterial,
//       formatMoney,
//     };
//   },
// });

// //Components
// app.component("form-material", FormMaterial);
// app.component("header-back", HeaderBack);

// app.mount("#app");

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

const idExpediente = new URLSearchParams(window.location.search).get(
  "id_expediente",
);

import HeaderBack from "./components/headerBack.js";
import FormMaterial from "./components/form_material.js";
import AutoComplete from "./components/autoComplete.js";
const { createApp, ref, onMounted, reactive, watch, computed, nextTick } = Vue;

const app = createApp({
  setup() {
    const expediente = ref({
      _id: "",
      nombre: "",
      cotizaciones: [],
    });
    const formCotizacion = reactive({
      nombre: "",
      formula: {
        id: "",
        nombre: "",
      },
      ancho: "",
      alto: "",
      manoObra: "",
      extras: "",
      materiales: [],
    });
    const formulasDB = ref([]);
    const materialesDB = ref([]);
    const isLoading = ref(false);

    // Methods
    const getExpediente = async () => {
      const { error, data } = await Axiomi.get(`expedientes/${idExpediente}`);
      if (!error) {
        expediente.value = data;
      }
    };

    const getFormulas = async () => {
      const { error, data } = await Axiomi.get("formulas");
      if (!error) {
        formulasDB.value = data;
      }
    };

    const getMateriales = async () => {
      const materiales = await fetchMateriales();
      materialesDB.value = materiales;
    };

    const seleccionarFormula = (formula) => {
      formCotizacion.formula.nombre = formula.nombre;
      formCotizacion.formula.id = formula.id;
    };

    const onFormulaInput = (nombre) => {
      formCotizacion.formula.nombre = nombre;
      formCotizacion.formula.id = "";
    };

    const eliminarMaterial = (index) => {
      formCotizacion.materiales.splice(index, 1);
    };

    const agregarMaterial = (material) => {
      formCotizacion.materiales.push(material);
    };

    const encontradoMaterialEnDb = (material) => {
      return materialesDB.value.find((m) => m.id === material.id);
    };

    const transormarMateriales = () => {
      return formCotizacion.materiales.map((material) => {
        const materialEncontrado = encontradoMaterialEnDb(material);
        return {
          ...material,
          precio: materialEncontrado.precio,
        };
      });
    };

    const guardarCotizacion = async () => {
      const dataCotizacion = {
        ...formCotizacion,
        idExpediente,
        materiales: transormarMateriales(),
        ancho: Number(formCotizacion.ancho),
        alto: Number(formCotizacion.alto),
        manoObra: Number(formCotizacion.manoObra),
        extras: Number(formCotizacion.extras),
      };

      try {
        const { error } = await Axiomi.post("cotizaciones", dataCotizacion);
        if (!error) {
          location.href = `/expediente.html?id=${idExpediente}`;
        }
      } catch (error) {
        alert("Error al crear la cotización");
      }
    };

    // Computed properties
    const heading = computed(() => {
      return `Expediente: ${expediente.value.nombre}`;
    });

    const formulasFiltradas = computed(() => {
      const nombreFormula = formCotizacion.formula.nombre.trim();
      if (!nombreFormula || !!formCotizacion.formula.id) {
        return [];
      }
      return formulasDB.value
        .filter((formula) => {
          return formula.nombre
            .toLowerCase()
            .includes(nombreFormula.toLowerCase());
        })
        .map((formula) => ({
          id: formula._id,
          nombre: formula.nombre,
        }));
    });

    const cotizacion = computed(() => {
      const materiales = formCotizacion.materiales.map((material) => {
        const materialEncontrado = encontradoMaterialEnDb(material);

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
          factorAncho *
          factorAlto *
          materialEncontrado.precio *
          material.cantidad;

        return {
          id: material.id,
          nombre: formatNombreTabla(materialEncontrado),
          cantidad: material.cantidad,
          formula: formatFormula(material.formulas),
          // medida: formatMedida(ancho, alto),
          medidas: {
            ancho,
            alto,
          },
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

    const puedeGuardar = computed(() => {
      return (
        formCotizacion.materiales.length > 0 &&
        !!formCotizacion.nombre.trim() &&
        (formCotizacion.ancho || formCotizacion.alto)
      );
    });

    // Lifecycle hooks
    onMounted(async () => {
      try {
        isLoading.value = true;
        await getExpediente();
        await getFormulas();
        await getMateriales();
      } catch (error) {
        alert("Error al obtener los datos de la cotización");
      } finally {
        isLoading.value = false;
      }
    });

    // Watchers
    watch(
      () => formCotizacion.formula.id,
      (newVal) => {
        const formulaEncontrada = formulasDB.value.find(
          (formula) => formula._id === newVal,
        );
        if (formulaEncontrada) {
          // formCotizacion.materiales = formulaEncontrada.materiales;
          formCotizacion.materiales = formulaEncontrada.materiales.map(
            (material) => ({
              ...material,
              formulas: { ...material.formulas },
            }),
          );
        }
      },
    );

    return {
      formCotizacion,
      materialesDB,
      isLoading,
      formulasFiltradas,
      heading,
      cotizacion,
      puedeGuardar,
      formatMoney,
      seleccionarFormula,
      onFormulaInput,
      eliminarMaterial,
      agregarMaterial,
      guardarCotizacion,
    };
  },
});

app.component("header-back", HeaderBack);
app.component("form-material", FormMaterial);
app.component("auto-complete", AutoComplete);

app.mount("#app");
