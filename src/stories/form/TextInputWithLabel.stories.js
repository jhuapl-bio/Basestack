import TextInput from "@/components/ui/forms/TextInput.vue";
import FormLabel from "@/components/ui/forms/FormLabel.vue";

export default {
  title: "Form/Text Input with label",
  component: FormLabel,
  subcomponents: {TextInput},
  argTypes: {
    label: {
        control: { type: "text" },
        defaultValue: "Label"
    },

    value: {
      control: { type: "text" },
      defaultValue: "",
    },

    placeholder: {
      control: { type: "text" },
      defaultValue: "Text goes here…",
    },
  },
};

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { FormLabel, TextInput },
  template: `
    <form>
        <fieldset>
            
        </fieldset>
    </form>
    `,
});

export const Default = Template.bind({});
Default.args = {
  value: "",
  placeholder: "Text goes here...",
};
