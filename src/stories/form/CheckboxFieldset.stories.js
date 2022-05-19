import CheckboxFieldset from "../../app/renderer/components/ui/forms/CheckboxFieldset.vue";

export default {
  title: "Form/CheckboxFieldset",
  component: CheckboxFieldset,
  argTypes: {
    text: {
      control: { type: "text" },
      defaultValue: "Text",
    },
  },
};

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { CheckboxFieldset },
  template: `<checkbox-fieldset v-bind="$props"></checkbox-fieldset>`,
});

export const Default = Template.bind({});
Default.args = {
  text: "Text",
};
