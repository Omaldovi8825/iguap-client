import AutoComplete from "./autoComplete.js";
import { formatNombreLista } from "../utils.js";
const { reactive, computed } = Vue;

export default {
  components: {
    AutoComplete,
  },
  props: ["materialesDb"],
  emits: ["agregar"],
  setup(props, { emit }) {
    const formMaterial = reactive({
      id: "",
      cantidad: 1,
      ancho: "",
      alto: "",
    });

    //computed properties
    const materialesFiltrados = computed(() => {
      const nombre = formMaterial.id.trim().toLowerCase();
      const isSelected = props.materialesDb.some(
        (m) => m.id == formMaterial.id,
      );
      if (!nombre || isSelected) return [];

      return props.materialesDb.filter((material) => {
        const campos = [
          material.nombre,
          material.categoria,
          material.pieza,
          material.tipo,
          material.color,
        ];
        return campos.some((campo) => campo?.toLowerCase().includes(nombre));
      }).map(material => ({
        id: material.id,
        nombre: formatNombreLista(material),
      }));
    });

    //Methods
    const resetForm = () => {
      formMaterial.id = "";
      formMaterial.cantidad = 1;
      formMaterial.ancho = "";
      formMaterial.alto = "";
    };

    const agregar = () => {
      const idMaterial = Number(formMaterial.id);
      //checar que id exista en la base de datos
      const materialExists = props.materialesDb.some(
        (m) => m.id === idMaterial,
      );
      if (!materialExists) {
        alert("El material no existe en la base de datos.");
        return;
      }
      emit("agregar", {
        id: idMaterial,
        cantidad: formMaterial.cantidad,
        formulas: {
          ancho: formMaterial.ancho,
          alto: formMaterial.alto,
        },
      });
      //limpiar forma
      resetForm();
    };

    return {
      formMaterial,
      materialesFiltrados,
      agregar,
    };
  },
  template: `
    <form @submit.prevent="agregar">
      <div class="mb-3">
        <label class="form-label">Material</label>
        <auto-complete
          v-model="formMaterial.id"
          :items="materialesFiltrados"
          @select-item="formMaterial.id = String($event.id)"
        ></auto-complete>
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
      <div>
        <button class="btn btn-outline-primary btn-sm w-100">
          Agregar +
        </button>
      </div>
    </form>
  `,
};
