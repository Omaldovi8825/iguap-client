export default {
  props: ["heading"],
  template: `
    <div class="d-flex justify-content-between align-items-center bg_iguapp_green p-3">
        <a href="./" class="fs-4">
            <i class="bi bi-arrow-left-circle text-white"></i>
        </a>
        <h1 class="text-center mb-0 fs-2 text-white">{{ heading }}</h1>
        <span></span>
    </div>
  `,
};
