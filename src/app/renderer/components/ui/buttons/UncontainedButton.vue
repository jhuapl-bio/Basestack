<template>
  <button
    class="bg-white button small text-blue-extradark hover:bg-blue-extralight"
  >
    <div class="flex items-center space-x-2">
      <span v-if="label">{{ label }}</span>
      <font-awesome-icon v-if="icon" :icon="icon" />
    </div>
  </button>
</template>

<script>
export default {
  props: {
    label: { type: String },
    icon: { type: String, default: "false" },
  },
};
</script>
