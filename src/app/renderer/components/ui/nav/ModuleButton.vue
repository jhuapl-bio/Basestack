<template>
  <button
    class="
      rounded
      shadow-lg
      inline-flex
      items-center
      w-[55px]
      h-[55px]
      p-1
      bg-white
      hover:scale-105
      duration-500
    "
    @click="goToModule"
  >
    <div
      class="flex items-center justify-center w-full h-full rounded bg-pink/25"
    >
      <slot>
        <span class="uppercase markup-h3 text-pink">
          {{ slotFallback }}
        </span>
      </slot>
    </div>
  </button>
</template>

<script>
export default {
  props: { moduleName: String },
  computed: {
    slotFallback: (props) => {
      return props.moduleName.charAt(0);
    },
  },
  methods: {
    goToModule() {
      this.$router.push(`/module/${this.moduleName}`);
    },
  },
};
</script>
