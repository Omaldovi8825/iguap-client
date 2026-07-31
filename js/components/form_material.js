const { reactive, computed } = Vue;

export default {
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
      });
    });

    //Methods
    const resetForm = () => {
      formMaterial.id = "";
      formMaterial.cantidad = 1;
      formMaterial.ancho = "";
      formMaterial.alto = "";
    };

    const formatNombreLista = ({
      id,
      categoria,
      nombre,
      pieza,
      tipo,
      medida,
      unidad,
      color,
    }) => {
      const nombreFormat = [
        categoria,
        nombre,
        pieza,
        tipo,
        medida,
        unidad,
        color,
      ]
        .filter(Boolean)
        .join(" ");
      return `${id} - ${nombreFormat}`;
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
      formatNombreLista,
      agregar,
    };
  },
  template: `
    <form @submit.prevent="agregar">
      <div class="position-relative mb-3">
        <label class="form-label">Material</label>
        <input
          type="text"
          class="form-control form-control-sm"
          v-model="formMaterial.id"
        />
        <div
          class="position-absolute top-100 start-0 w-100"
          style="z-index: 1000"
        >
          <ul
            class="list-group overflow-y-auto"
            style="max-height: 300px"
          >
            <li
              v-for="material in materialesFiltrados"
              :key="material.id"
              class="list-group-item list-group-item-action"
              @click="formMaterial.id = String(material.id)"
            >
              {{ formatNombreLista(material) }}
            </li>
          </ul>
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
      <div>
        <button class="btn btn-outline-primary btn-sm w-100">
          Agregar +
        </button>
      </div>
    </form>
  `,
};
