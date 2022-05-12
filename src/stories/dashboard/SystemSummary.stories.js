import SystemSummary from "../../app/renderer/components/Dashboard/System/SystemSummary";

export default {
  title: "Sections/System Summary",
  component: SystemSummary,
};

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { SystemSummary },
  template: `<SystemSummary v-bind="$props"></SystemSummary>`,
});

export const Default = Template.bind({});
Default.args = {
  resources: {
    cpu: {
      brand: "Core™ i7-1068NG7",
      cores: 8,
      family: "6",
      manufacturer: "Intel®",
      physicalCores: 4,
      processors: 1,
      virtualization: true,
    },
    mem: {
      active: 14455865344,
      available: 19903873024,
      total: 34359738368,
    },
    os: {
      distro: "macOS",
      kernel: "20.6.0",
      platform: "darwin",
      release: "11.6.5",
    },
  },
};
