export default {
  props: ["modelValue", "items"],
  emits: ["update:modelValue", "select-item"],
  setup(props, { emit }) {
    const onInput = (event) => {
      emit("update:modelValue", event.target.value);
    };

    const onSelect = (item) => {
      // emit("update:modelValue", String(item.nombre));
      emit("select-item", item);
    };

    return {
      onInput,
      onSelect,
    };
  },
  template: `
    <div class="position-relative">
      <input
        type="text"
        class="form-control form-control-sm"
        :value="modelValue"
        @input="onInput"
      />
      <div
        class="position-absolute top-100 start-0 w-100"
        style="z-index: 1000"
      >
        <ul class="list-group overflow-y-auto" style="max-height: 300px">
          <li
            v-for="item in items"
            :key="item.id"
            class="list-group-item list-group-item-action"
            @click="onSelect(item)"
          >
            {{ item.nombre }}
          </li>
        </ul>
      </div>
    </div>
  `,
};
