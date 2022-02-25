import RegularButton from '../app/renderer/components/ui/buttons/RegularButton.vue'

export default {
  title: 'Button',
  component: RegularButton,
  argTypes: {
    label: {
      control: {type: 'text'},
      defaultValue: 'Button',
    },
    color: {
      control: { type: 'select' },
      options: ['blue', 'black', 'white', 'light', 'dark'],
    },
    size: {
      control: { type: 'select' },
      options: ['base', 'small'],
    },
    icon: {
      control: { type: 'text' },
      defaultValue: '',
    }
  },
};

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: {RegularButton},
  template: `<regular-button v-bind="$props"></regular-button>`
});

export const Regular = Template.bind({})
Regular.args = {
  color: 'blue',
  size: 'base',
  label: 'Regular'
}
// export const Selected = Template.bind({})
// Selected.args = {
//   color: 'blue',
//   size: 'base',
//   label: 'Regular'
// }