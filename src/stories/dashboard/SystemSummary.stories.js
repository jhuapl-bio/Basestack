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
