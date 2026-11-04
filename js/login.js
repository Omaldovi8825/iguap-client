import { Axiomi } from "./api.js";
import { logout } from "./utils.js";
const { createApp, ref, watch, onMounted } = Vue;

const app = createApp({
  setup() {
    const inputOne = ref("");
    const inputTwo = ref("");
    const inputThree = ref("");
    const inputFour = ref("");

    const inputOneEl = ref(null);
    const inputTwoEl = ref(null);
    const inputThreeEl = ref(null);
    const inputFourEl = ref(null);

    const submitForm = async () => {
      const inOne = inputOne.value;
      const inTwo = inputTwo.value;
      const inThree = inputThree.value;
      const inFour = inputFour.value;

      const password = `${inOne}${inTwo}${inThree}${inFour}`;
      if (password.length !== 4) {
        return;
      }

      try {
        const { error, mensaje, data } = await Axiomi.login(password);

        if (error) throw mensaje;
        localStorage.setItem("token", data.token);
        location.replace("./");
        return;
      } catch (error) {
        inputOne.value = "";
        inputTwo.value = "";
        inputThree.value = "";
        inputFour.value = "";
        inputOneEl.value?.focus();
        logout();
        console.error(error);
        alert(error);
      }
    };

    //watchers
    watch(inputOne, (newVal) => {
      if (String(newVal).length === 1) {
        inputTwo.value = "";
        inputThree.value = "";
        inputFour.value = "";
        inputTwoEl.value.focus();
      }
    });

    watch(inputTwo, (newVal) => {
      if (String(newVal).length === 1) {
        inputThree.value = "";
        inputFour.value = "";
        inputThreeEl.value.focus();
      }
    });

    watch(inputThree, (newVal) => {
      if (String(newVal).length === 1) {
        inputFour.value = "";
        inputFourEl.value.focus();
      }
    });

    watch(inputFour, (newVal) => {
      if (String(newVal).length === 1) {
        submitForm();
      }
    });

    onMounted(() => {
      logout();
    });

    return {
      inputOne,
      inputTwo,
      inputThree,
      inputFour,
      inputOneEl,
      inputTwoEl,
      inputThreeEl,
      inputFourEl,
    };
  },
});

app.mount("#app");
