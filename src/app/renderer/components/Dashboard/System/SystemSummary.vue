<template>
  <div>
      <div class="markup-h5 strong mb-4">System Summary</div>
      <div class="border border-gray rounded">
          <div class="p-4">
            <h3 class="markup-h5 strong mb-4">Processor</h3>
            <div class="grid grid-cols-3">
              <DataLabel  label="CPU Brand" data="Core i7-7820HQ" class="col-span-2"/>
              <DataLabel  label="Manufacturer" data="Intel"/>
              <DataLabel  label="Cores" data="8"/>
              <DataLabel  label="Physical Cores" data="4"/>
              <DataLabel  label="Virtualization" data="Yes"/>
            </div>
          </div>
          <hr class="border-gray"/>
          <div class="p-4">
            <h3 class="markup-h5 strong mb-4">Memory</h3>
            <div class="grid grid-cols-3">
              <DataLabel  label="Total Mem (GB)" data="17.18"/>
              <DataLabel  label="Using Mem (GB)" data="5.43"/>
              <DataLabel  label="Available Mem (GB)" data="11.70"/>
            </div>
          </div>
          <hr class="border-gray"/>
          <div class="p-4">
            <h3 class="markup-h5 strong mb-4">Operating System</h3>
            <div class="flex justify-between flex-wrap">
              <DataLabel  label="Kernel" data="20.6.0"/>
              <DataLabel  label="Platform" data="darwin"/>
              <DataLabel  label="Distro" data="macOS"/>
              <DataLabel  label="Release" data="11.5.2"/>
            </div>
          </div>
      </div>
  </div>
</template>

<script>
import DataLabel from '../../ui/DataLabel.vue'
export default {
    name: 'SystemSummary',
    components: {
      DataLabel
    }


}
</script>