<template>
  <div class="relative">
    <input
      v-bind="$attrs"
      :value="text"
      @input="$emit('update:text', '$event.target.value')"
      class="
        flex
        w-full
        px-4
        py-2
        border-2
        focus:outline-none focus:border-blue-300
        font-body
        focus:bg-white
        bg-gray-300
        border-gray-500
        text-gray-700
        placeholder:text-gray-600
      "
    />
  </div>
</template>

<script>
export default {
  emits: ["update:text"],
  props: ["text"],
  computed: {
    value: () => {
      return this.text;
    },
  },
};
</script>