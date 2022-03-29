import DataLabel from "../app/renderer/components/ui/DataLabel.vue";

export default {
  title: "DataLabel",
  component: DataLabel,
};

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { DataLabel },
  template: `<DataLabel v-bind="$props"></DataLabel>`,
});

export const Default = Template.bind({});
Default.args = {
  label: "CPU Brand",
  data: "Core i7-7820HQ",
};
// export const Selected = Template.bind({})
// Selected.args = {
//   color: 'blue',
//   size: 'base',
//   label: 'Regular'
// }
