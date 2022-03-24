<template>
  <div>
    <div class="flex items-center mb-4">
      <font-awesome-icon
        icon="phone-alt"
        class="mr-2 text-lg text-blue-extradark"
      />
      <div class="markup-h5 strong">Contact Us</div>
    </div>
    <div class="border rounded border-gray">
      <div class="grid grid-cols-2 p-4">
        <div class="space-y-4">
          <h3 class="markup-h5 strong">Basestack Developers</h3>
          <div>
            <h4 class="leading-3 markup-h5">Brian Merrit</h4>
            <a href="" class="leading-zero text-blue-ultradark markup-h6">
              brian.merrit@jhuapl.edu
            </a>
          </div>
          <div>
            <h4 class="leading-3 markup-h5">Thomas Mehoke</h4>
            <a href="" class="text-blue-ultradark markup-h6">
              thomas.mehoke@jhuapl.edu
            </a>
          </div>
        </div>
        <div class="space-y-4">
          <h3 class="markup-h5 strong">Third Party Apps</h3>
          <div>
            <a href="" class="block text-blue-ultradark markup-h6 strong">
              Nextrain</a
            >
            <a href="" class="block text-blue-ultradark markup-h6 strong">
              Artic Network/RAMPART
            </a>
            <a href="" class="block text-blue-ultradark markup-h6 strong">
              IGV
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * Displays contact information for Basestack
 */
export default {
  name: "Contact",
};
</script>

<style>
</style>