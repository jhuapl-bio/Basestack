import DashboardButton from '../app/renderer/components/ui/nav/DashboardButton.vue'

export default {
  title: 'Nav/Dashboard Button',
  component: DashboardButton,
  argTypes: {},
};

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: {DashboardButton},
  template: `
    <dashboard-button v-bind="$props" />
    `
});

export const Default = Template.bind({})
Default.args = {}