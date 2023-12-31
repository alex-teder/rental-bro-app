<template>
  <v-dialog fullscreen transition="dialog-bottom-transition" :scrim="false">
    <v-card class="pa-8 pt-sm-16">
      <div style="max-width: 1000px" class="mx-auto">
        <v-btn
          variant="text"
          position="absolute"
          icon="mdi-close"
          class="my-close-button"
          @click="handleCancel"
        />
        <v-form v-model="isFormValid" @submit.prevent>
          <v-card-title class="card-title">{{
            $t("gear.editItem")
          }}</v-card-title>
          <v-card-subtitle>id: {{ item.id }}</v-card-subtitle>

          <GearForm
            v-model:model="changedItem.model"
            v-model:type="changedItem.type"
            v-model:priceday="changedItem.priceday"
            v-model:qty="changedItem.qty"
            :types="types"
          />

          <v-card-actions class="py-2 d-flex flex-wrap">
            <v-btn
              variant="outlined"
              :block="isScreenSmall"
              class="ma-1 me-auto px-3"
              color="error"
              append-icon="mdi-close"
              :loading="isAwaitingDelete"
              @click="handleDelete"
            >
              {{ $t("gear.deleteItem") }}
            </v-btn>
            <v-btn
              variant="outlined"
              :block="isScreenSmall"
              class="ma-1 px-3"
              @click="handleCancel"
            >
              {{ $t("gear.cancel") }}
            </v-btn>
            <v-btn
              variant="outlined"
              :block="isScreenSmall"
              class="ma-1 px-3"
              color="success"
              append-icon="mdi-check"
              :loading="isAwaitingResponse"
              @click="handleSave"
            >
              {{ $t("gear.saveChanges") }}
            </v-btn>
          </v-card-actions>
        </v-form>
      </div>
    </v-card>

    <ConfirmDeletePopup
      v-model="isConfirmationOpen"
      :item-to-delete="item.model"
      @close="isConfirmationOpen = false"
      @confirm="handleConfirmDelete"
    />
  </v-dialog>
</template>

<script>
import GearForm from "./GearForm.vue";
import ConfirmDeletePopup from "@/components/ConfirmDeletePopup.vue";
import { editGearItem, deleteGearItem } from "@/services/firestore";
import { formatGearFields } from "@/services/gearFormRules";

export default {
  components: {
    GearForm,
    ConfirmDeletePopup,
  },
  props: {
    item: Object,
    types: Array,
  },
  emits: ["update:modelValue", "pushUpdate"],
  data() {
    return {
      isConfirmationOpen: false,
      changedItem: null,
      isFormValid: false,
      isAwaitingResponse: false,
      isAwaitingDelete: false,
    };
  },
  computed: {
    isScreenSmall() {
      return !this.$vuetify.display.smAndUp;
    },
  },
  watch: {
    item() {
      this.resetInputs();
    },
  },
  methods: {
    resetInputs() {
      this.changedItem = { ...this.item };
    },
    handleCancel() {
      this.$emit("update:modelValue", false);
      this.resetInputs();
    },
    async handleSave() {
      if (!this.isFormValid) return;
      try {
        this.isAwaitingResponse = true;
        const { model, type, priceday, qty } = formatGearFields(
          this.changedItem
        );
        const isNameDifferent = model !== this.item.model;
        await editGearItem(this.changedItem.id, { model, type, priceday, qty });
        this.$emit("update:modelValue", false);
        if (isNameDifferent) {
          this.$emit("pushUpdate", "updateDiffName");
        } else {
          this.$emit("pushUpdate", "update");
        }
      } catch (error) {
        this.$store.dispatch("handleNewError", error.message);
      } finally {
        this.isAwaitingResponse = false;
      }
    },
    handleDelete() {
      this.isConfirmationOpen = true;
    },
    async handleConfirmDelete() {
      try {
        this.isConfirmationOpen = false;
        this.isAwaitingDelete = true;
        await deleteGearItem(this.changedItem.id);
        this.$emit("update:modelValue", false);
        this.$emit("pushUpdate", "delete");
      } catch (error) {
        this.$store.dispatch("handleNewError", error.message);
      } finally {
        this.isAwaitingDelete = false;
      }
    },
  },
};
</script>

<style scoped>
.my-close-button {
  top: 2rem;
  right: 2rem;
}
.card-title {
  font-size: 2rem;
}
</style>
