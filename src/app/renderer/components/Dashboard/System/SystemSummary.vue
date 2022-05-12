<template>
  <div>
    <div class="flex justify-between mb-2">
      <div class="flex items-center">
        <font-awesome-icon icon="cog" class="text-lg text-blue-900 mr-2" />
        <h2 class="markup-h5 strong">System Summary</h2>
      </div>
      <UncontainedButton
        label="All System Details"
        class="markup-h5"
        icon="chevron-right"
      />
    </div>
    <div class="border border-gray-400 rounded">
      <div class="p-4">
        <h3 class="mb-4 markup-h5 strong">Processor</h3>
        <div class="grid grid-cols-3">
          <DataLabel
            label="CPU Brand"
            :data="resources.cpu.brand"
            class="col-span-2"
          />
          <DataLabel label="Manufacturer" :data="resources.cpu.manufacturer" />
          <DataLabel label="Cores" :data="resources.cpu.cores" />
          <DataLabel label="Physical Cores" :data="resources.cpu.physicalCores" />
          <DataLabel label="Virtualization" :data="resources.cpu.virtualization ? 'Yes' : 'No'" />
        </div>
      </div>
      <hr class="border-gray-400" />
      <div class="p-4">
        <h3 class="mb-4 markup-h5 strong">Memory</h3>
        <div class="grid grid-cols-3">
          <DataLabel label="Total Mem (GB)" :data="convertGb(resources.mem.total)" />
          <DataLabel label="Using Mem (GB)" :data="convertGb(resources.mem.active)" />
          <DataLabel label="Available Mem (GB)" :data="convertGb(resources.mem.available)" />
        </div>
      </div>
      <hr class="border-gray-400" />
      <div class="p-4">
        <h3 class="mb-4 markup-h5 strong">Operating System</h3>
        <div class="flex flex-wrap justify-between">
          <DataLabel label="Kernel" :data="resources.os.kernel" />
          <DataLabel label="Platform" :data="resources.os.platform" />
          <DataLabel label="Distro" :data="resources.os.distro" />
          <DataLabel label="Release" :data="resources.os.release" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DataLabel from "../../ui/DataLabel.vue";
import UncontainedButton from "../../ui/buttons/UncontainedButton.vue";

/**
 * Displays System Summary information. Makes use of DataLabel components to display system data.
 */
export default {
  name: "SystemSummary",
  components: {
    DataLabel,
    UncontainedButton,
  },
  props: ['resources'],
  methods: {
    convertGb(size, val){
      if (val =='MB'){
        return size / 1000 
      } else {
        return (size / 1000000000).toFixed(2)
      }
    }
  }
};
</script>