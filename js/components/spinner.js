export default {
  props: ["size"],
  template: `
    <span
      class="spinner-border"
      :class="{ 'spinner-border-sm': !size }"
      :style="size ? { width: size, height: size } : null"
      role="status"
      aria-hidden="true"
    ></span>
  `,
};
