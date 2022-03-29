<template>
  <div class="mb-4">
      <div class="text-gray-600 markup-body-sm strong">{{label}}</div>
      <div class="markup-body">{{data}}</div>
  </div>
</template>

<script>
export default {
    name: 'DataLabel',
    props: {
        label: String,
        data: String
    }
}
</script>