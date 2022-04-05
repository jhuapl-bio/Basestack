import FormLabel from "../../app/renderer/components/ui/forms/FormLabel.vue";

export default {
  title: "Form/Label",
  component: FormLabel,
  argTypes: {
    text: {
      control: { type: "text" },
      defaultValue: "Text",
    },
  },
};

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { FormLabel },
  template: `<form-label v-bind="$props">{{text}}</form-label>`,
});

export const Default = Template.bind({});
Default.args = {
  text: "Text",
};
