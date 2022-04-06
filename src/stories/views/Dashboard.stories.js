import Dashboard from "../../app/renderer/views/Dashboard.vue";

export default {
  title: "Views/Dashboard",
  component: Dashboard,
};

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { Dashboard },
  template: `<Dashboard v-bind="$props"></Dashboard>`,
});

export const Default = Template.bind({});
