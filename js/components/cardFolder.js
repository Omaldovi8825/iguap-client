const { ref, watch } = Vue;

export default {
  props: ["expediente", "url"],
  emits: ["guardar-expediente", "eliminar-expediente"],
  setup(props, { emit }) {
    const editMode = ref(false);
    const iNombre = ref(props.expediente.nombre);

    const guardarExpediente = () => {
      emit("guardar-expediente", props.expediente._id, iNombre.value);
      editMode.value = false;
    };

    watch(editMode, (newVal) => {
      if (!newVal) {
        iNombre.value = props.expediente.nombre;
      }
    });

    return {
      iNombre,
      editMode,
      guardarExpediente,
    };
  },
  template: `
    <div class="border rounded p-1 bg-body">
      <div class="d-flex justify-content-between">
        <div
          v-if="editMode"
          class="border rounded"
        >
          <button
            type="button"
            class="btn btn-sm"
            @click.stop="editMode = false"
          >
            <i class="bi bi-x-circle text-danger fs-6"></i>
          </button>
          <button
            type="button"
            class="btn btn-sm"
            @click.stop="guardarExpediente"
          >
            <i class="bi bi-check-circle text-success fs-6"></i>
          </button>
        </div>
        <button
          v-else
          type="button"
          class="btn btn-sm"
          @click.stop="editMode = true"
        >
          <i class="bi bi-pencil text-primary fs-6"></i>
        </button>
        <button
          type="button"
          class="btn btn-sm"
          @click.stop="$emit('eliminar-expediente', expediente._id)"
        >
          <i class="bi bi-trash text-danger fs-6"></i>
        </button>
      </div>
      <div class="text-center position-relative mb-2">
        <i class="bi bi-folder-fill display-4 text-warning"></i>
        <a
          :href="url"
          class="stretched-link"
        ></a>
      </div>
      <div class="text-center mb-3">
        <input
          v-if="editMode"
          type="text"
          class="form-control form-control-sm text-center"
          v-model="iNombre"
        />
        <span v-else class="text-truncate"
          >{{ expediente.nombre }}</span
        >
      </div>
    </div>
  `,
};
