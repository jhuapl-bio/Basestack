import Radio from "../../app/renderer/components/ui/forms/Radio.vue";

export default {
  title: "Form/Radio",
  component: Radio,
  argTypes: {
    text: {
      control: { type: "text" },
      defaultValue: "Text",
    },
  },
};

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { Radio },
  template: `<radio v-bind="$props"></radio>`,
});

export const Default = Template.bind({});
Default.args = {
  text: "Text",
};
