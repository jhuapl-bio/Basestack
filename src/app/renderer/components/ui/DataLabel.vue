<template>
  <div class="mb-4">
    <div class="text-gray-600 markup-body-sm strong">{{ label }}</div>
    <div class="markup-body">{{ data }}</div>
  </div>
</template>

<script>
/**
 * Displays labelled data information.
 *
 * @param {string} label - the label for the data
 * @param {string} data - the data value
 */
export default {
  name: "DataLabel",
  props: {
    label: String,
    data: String,
  },
};
</script>