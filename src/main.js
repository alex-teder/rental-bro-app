import App from "./App.vue";

import { createApp } from "vue";
import router from "./plugins/router";
import vuetify from "./plugins/vuetify";
import store from "./plugins/store";
import i18n from "./plugins/i18n";

const app = createApp(App);

app.use(router).use(store).use(i18n).use(vuetify);

app.mount("#app");
