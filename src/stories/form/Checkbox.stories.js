import Checkbox from "../../app/renderer/components/ui/forms/Checkbox.vue";

export default {
  title: "Form/Checkbox",
  component: Checkbox,
  argTypes: {
    text: {
      control: { type: "text" },
      defaultValue: "Text",
    },
  },
};

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { Checkbox },
  template: `<checkbox v-bind="$props"></checkbox>`,
});

export const Default = Template.bind({});
Default.args = {
  text: "Text",
};
