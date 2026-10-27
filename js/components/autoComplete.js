export default {
  props: ["items"],
  emits: ["select-item"],
  template: `
    <div class="position-relative">
      <slot></slot>
      <div
        class="position-absolute top-100 start-0 w-100"
        style="z-index: 1000"
      >
        <ul class="list-group overflow-y-auto" style="max-height: 250px">
          <li
            v-for="item in items"
            :key="item.id"
            class="list-group-item list-group-item-action"
            @click="$emit('select-item', item)"
          >
            {{ item.nombre }}
          </li>
        </ul>
      </div>
    </div>
  `,
};
