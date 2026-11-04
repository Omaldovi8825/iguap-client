export default {
  props: ["heading"],
  template: `
    <div class="d-flex justify-content-between align-items-center bg_iguapp_green sticky-top p-3">
        <a href="./" class="fs-4">
            <i class="bi bi-house text-white"></i>
        </a>
        <h1 class="text-center mb-0 fs-2 text-white">{{ heading }}</h1>
        <span></span>
    </div>
  `,
};
