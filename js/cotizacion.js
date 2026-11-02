import { Axiomi } from "./api.js";
import HeaderBack from "./components/headerBack.js";
import FormMaterial from "./components/form_material.js";
import LoaderIguana from "./components/loader_iguana.js";
import ModalMaterial from "./components/modalMaterial.js";
import {
  getMateriales,
  formatNombreLista,
  aplicarFormula,
  cmAm,
  formatMoney,
} from "./utils.js";
const { createApp, ref, onMounted, reactive, watch, computed, nextTick } = Vue;

const idExpediente = new URLSearchParams(window.location.search).get(
  "id_expediente",
);
const idCotizacion = new URLSearchParams(window.location.search).get("id");

const app = createApp({
  setup() {
    const initialLoad = ref(true);
    const isLoading = ref(false);
    const expedienteDB = ref(null);
    const materialesDB = ref([]);
    const foldersFormulasDB = ref([]);
    const formulasDB = ref([]);
    const cotizacionDB = ref(null);

    const modalMaterial = ref(null);
    const tbodyMateriales = ref(null);

    const formCotizacion = reactive({
      id_expediente: idExpediente,
      nombre: "",
      formula: {
        id_folder: "",
        id: "",
      },
      ancho: "",
      alto: "",
      manoObra: "",
      extras: "",
      materiales: [],
    });

    // Methods
    const getExpediente = async () => {
      const { error, data } = await Axiomi.get(
        `expedientes/${idExpediente || formCotizacion.id_expediente}`,
      );
      if (error) throw new Error(data);
      expedienteDB.value = data;
    };

    const getFoldersFormulasDB = async () => {
      const { error, data } = await Axiomi.get("folders-formulas");
      if (error) throw new Error(data);
      foldersFormulasDB.value = data;
    };

    const getMaterialesDB = async () => {
      const { error, data } = await getMateriales();
      if (error) throw new Error(data);
      materialesDB.value = data;
    };

    const getFormulasDB = async () => {
      if (formCotizacion.formula.id_folder === "") return;
      try {
        const idFolder = formCotizacion.formula.id_folder;
        const request =
          idFolder === "0"
            ? Axiomi.get("formulas/single")
            : Axiomi.get(`formulas?id_folder=${idFolder}`);

        const { error, data } = await request;

        if (error) throw new Error(data);
        formulasDB.value = data;
      } catch (error) {
        console.log(error);
        alert("Error al obtener las fórmulas");
      }
    };

    const getCotizacionDB = async () => {
      const { error, data } = await Axiomi.get(`cotizaciones/${idCotizacion}`);
      if (error) throw new Error(data);

      cotizacionDB.value = data;

      const {
        id_expediente,
        nombre,
        ancho,
        alto,
        manoObra,
        extras,
        materiales,
      } = data;
      Object.assign(formCotizacion, {
        id_expediente,
        nombre,
        formula: {
          id_folder: "",
          id: "",
        },
        ancho,
        alto,
        manoObra,
        extras,
        materiales,
      });
    };

    const eliminarMaterial = (index) => {
      formCotizacion.materiales.splice(index, 1);
    };

    const abrirModalEditarMaterial = (index) => {
      const material = formCotizacion.materiales[index];
      const { id, cantidad, formulas } = material;
      const materialEncontrado = materialesDB.value.find((m) => m._id === id);

      modalMaterial.value.abrirModal({
        index,
        id,
        nombre: formatNombreLista(materialEncontrado),
        cantidad,
        ancho: formulas.ancho,
        alto: formulas.alto,
      });
    };

    const agregarMaterial = (material) => {
      const { id, cantidad, ancho, alto } = material;
      formCotizacion.materiales.push({
        id,
        cantidad,
        formulas: {
          ancho,
          alto,
        },
      });
    };

    const editarMaterial = (material) => {
      const { index, id, cantidad, ancho, alto } = material;
      formCotizacion.materiales[index] = {
        ...formCotizacion.materiales[index],
        id,
        cantidad,
        formulas: {
          ancho,
          alto,
        },
      };
    };

    const onSubmitMaterial = (material) => {
      if (material.index === null) {
        agregarMaterial(material);
      } else {
        editarMaterial(material);
      }
    };

    const crearCotizacion = async () => {
      const { materiales, ...resto } = formCotizacion;

      const materialesFormatted = materiales.map((material) => {
        const materialEncontrado = materialesDB.value.find(
          (m) => m._id === material.id,
        );

        return {
          ...material,
          precio: materialEncontrado.precio,
        };
      });

      const cotizacionFormatted = {
        id_expediente: expedienteDB.value._id,
        ...resto,
        materiales: materialesFormatted,
      };

      return Axiomi.post("cotizaciones", cotizacionFormatted);
    };

    const actualizarCotizacion = async () => {
      const { materiales, ...resto } = formCotizacion;

      const materialesFormatted = materiales.map((material) => {
        const materialEncontrado = materialesDB.value.find(
          (m) => m._id === material.id,
        );

        return {
          ...material,
          precio: material.precio || materialEncontrado.precio,
        };
      });

      const cotizacionFormatted = {
        ...resto,
        materiales: materialesFormatted,
      };

      return Axiomi.put(`cotizaciones/${idCotizacion}`, cotizacionFormatted);
    };

    const guardarCotizacion = async () => {
      try {
        isLoading.value = true;

        const request = modoEdicion.value
          ? actualizarCotizacion()
          : crearCotizacion();

        const { error, data } = await request;

        if (!error) {
          location.href = `/expediente.html?id=${expedienteDB.value._id}`;
        } else {
          throw new Error(data);
        }
      } catch (error) {
        alert("Error al guardar la cotización");
      } finally {
        isLoading.value = false;
      }
    };

    const initSortable = () => {
      if (!tbodyMateriales.value) return;
      Sortable.create(tbodyMateriales.value, {
        handle: ".drag-handle",
        animation: 150,
        delay: 120,
        delayOnTouchOnly: true,
        touchStartThreshold: 4,
        onEnd(evt) {
          const { oldIndex, newIndex, item, from } = evt;
          if (oldIndex === newIndex) return;
          const refChild =
            from.children[oldIndex + (oldIndex > newIndex ? 1 : 0)];
          from.insertBefore(item, refChild ?? null);
          const [moved] = formCotizacion.materiales.splice(oldIndex, 1);
          formCotizacion.materiales.splice(newIndex, 0, moved);
        },
      });
    };

    // Computed properties
    const modoEdicion = computed(() => {
      return idCotizacion !== null;
    });

    const cotizacion = computed(() => {
      const materiales = formCotizacion.materiales.map((material) => {
        const materialEncontrado = materialesDB.value.find(
          (m) => m._id === material.id,
        );

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
        const precioMaterial = material.precio || materialEncontrado.precio;

        const precio =
          factorAncho * factorAlto * precioMaterial * material.cantidad;

        return {
          id: material.id,
          nombre: formatNombreLista(materialEncontrado),
          cantidad: material.cantidad,
          formulas: {
            ancho: material.formulas.ancho,
            alto: material.formulas.alto,
          },
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

    const enableSave = computed(() => {
      const { nombre, ancho, alto, materiales } = formCotizacion;
      return nombre && ancho && alto && materiales.length > 0;
    });

    //Watchers
    watch(
      () => formCotizacion.formula.id_folder,
      (newVal) => {
        formCotizacion.formula.id = "";
        getFormulasDB();
      },
    );

    watch(
      () => formCotizacion.formula.id,
      (newVal) => {
        const formulaDB = formulasDB.value.find(
          (formula) => formula._id === newVal,
        );
        if (formulaDB) {
          formCotizacion.materiales = [...formulaDB.materiales];
        }
      },
    );

    // Lifecycle hooks
    onMounted(async () => {
      try {
        await getFoldersFormulasDB();
        await getMaterialesDB();
        if (idCotizacion) {
          await getCotizacionDB();
        }
        await getExpediente();
      } catch (error) {
        console.log(error);
        alert("Error al obtener los datos de la cotización");
      } finally {
        initialLoad.value = false;
        await nextTick();
        initSortable();
      }
    });

    return {
      modalMaterial,
      tbodyMateriales,
      initialLoad,
      materialesDB,
      expedienteDB,
      formulasDB,
      foldersFormulasDB,
      formCotizacion,
      cotizacion,
      enableSave,
      formatMoney,
      eliminarMaterial,
      abrirModalEditarMaterial,
      onSubmitMaterial,
      guardarCotizacion,
    };
  },
});

app.component("header-back", HeaderBack);
app.component("form-material", FormMaterial);
app.component("loader-iguana", LoaderIguana);
app.component("modal-material", ModalMaterial);

app.mount("#app");
