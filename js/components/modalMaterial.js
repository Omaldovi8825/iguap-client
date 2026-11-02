import AutoComplete from "./autoComplete.js";
import ModalBase from "./modal_base.js";
import { formatNombreLista } from "../utils.js";
const { ref, computed, onMounted } = Vue;

const formMaterialVacio = {
  index: null,
  id: "",
  nombre: "",
  autoComplete: "",
  cantidad: "",
  ancho: "",
  alto: "",
  precio: "",
};

export default {
  components: {
    AutoComplete,
    ModalBase,
  },
  props: ["materiales-db"],
  setup(props, { emit }) {
    const modalEl = ref(null);
    const formMaterial = ref({ ...formMaterialVacio });

    const limpiarFormMaterial = () => {
      formMaterial.value = { ...formMaterialVacio };
    };

    const modoEdicion = computed(() => {
      return formMaterial.value.index !== null;
    });

    const enableSubmitMaterial = computed(() => {
      return !!formMaterial.value.id && formMaterial.value.cantidad > 0;
    });

    const onSubmitMaterial = () => {
      emit("submit-material", formMaterial.value);
      bootstrap.Modal.getInstance(modalEl.value.$el)?.hide();
    };

    const selectMaterial = (material) => {
      const { id, nombre } = material;
      formMaterial.value.id = id;
      formMaterial.value.nombre = nombre;
      formMaterial.value.autoComplete = "";
    };

    const abrirModal = (material) => {
      const { index, id, nombre, cantidad, ancho, alto } = material;

      formMaterial.value = {
        index,
        autoComplete: "",
        id,
        nombre,
        cantidad,
        ancho,
        alto,
      };
    };

    //Computed properties
    const materialesFormateados = computed(() => {
      return props.materialesDb.map((material) => {
        return {
          id: material._id,
          nombre: formatNombreLista(material),
        };
      });
    });

    const materialesFiltrados = computed(() => {
      const q = formMaterial.value.autoComplete.trim().toLowerCase();
      if (!q) return [];
      return materialesFormateados.value.filter((material) =>
        material.nombre.toLowerCase().includes(q),
      );
    });

    // Lifecycle hooks
    onMounted(() => {
      modalEl.value.$el.addEventListener(
        "hidden.bs.modal",
        limpiarFormMaterial,
      );
    });

    return {
      modalEl,
      formMaterial,
      modoEdicion,
      enableSubmitMaterial,
      materialesFiltrados,
      onSubmitMaterial,
      selectMaterial,
      abrirModal,
    };
  },
  template: `
    <modal-base
      ref="modalEl"
      :title="modoEdicion ? 'Editar material' : 'Agregar material'"
      id="modalMaterial"
    >
      <form @submit.prevent="onSubmitMaterial" id="form-material">
        <div class="mb-3">
          <label class="form-label">Material</label>
          <auto-complete
            :items="materialesFiltrados"
            @select-item="selectMaterial"
          >
            <input
              type="text"
              class="form-control form-control-sm"
              v-model="formMaterial.autoComplete"
            />
          </auto-complete>
          <div v-if="formMaterial.id" class="form-text">
            {{ formMaterial.nombre }}
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label">Cantidad</label>
          <input
            type="number"
            min="1"
            class="form-control form-control-sm"
            v-model="formMaterial.cantidad"
          />
        </div>
        <div class="mb-3">
          <label class="form-label">Fórmula ancho</label>
          <input
            type="text"
            class="form-control form-control-sm"
            v-model="formMaterial.ancho"
          />
        </div>
        <div class="mb-3">
          <label class="form-label">Fórmula alto</label>
          <input
            type="text"
            class="form-control form-control-sm"
            v-model="formMaterial.alto"
          />
        </div>
      </form>
      <template #btn-footer>
        <button
          type="submit"
          class="btn btn-iguapp"
          form="form-material"
          :disabled="!enableSubmitMaterial"
        >
          <span>{{ modoEdicion ? 'Editar' : 'Agregar' }}</span>
        </button>
      </template>
    </modal-base>
  `,
};
