import SearchModulesField from "../../app/renderer/components/ui/forms/SearchModulesField.vue";

export default {
  title: "Form/Search Modules Field",
  component: SearchModulesField,
  argTypes:  {},
};

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { SearchModulesField },
  template: `
    <search-modules-field v-bind="$props" :v-model="value" />
    `,
});

export const Default = Template.bind({});
Default.args = {};
