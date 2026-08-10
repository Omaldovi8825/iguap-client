const { ref } = Vue;

export default {
  props: ["heading"],
  //   emits: ["agregar"],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
        <a href="./" class="fs-4">
            <i class="bi bi-arrow-left-circle text-info"></i>
        </a>
        <h1 class="text-center fs-2">{{ heading }}</h1>
        <span></span>
    </div>
  `,
};
