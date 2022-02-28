import SelectorButton from '../app/renderer/components/ui/buttons/SelectorButton.vue'

export default {
  title: 'Buttons/Selector Button',
  component: SelectorButton,
  argTypes: {
    label: {
      control: {type: 'text'},
      defaultValue: 'Button',
    },
    action: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'neutral', 'accent', 'success', 'danger'],
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
  components: {SelectorButton},
  template: `<selector-button v-bind="$props"></selector-button>`
});

export const Selector = Template.bind({})
Selector.args = {
  action: 'primary',
  size: 'base',
  label: 'Button'
}
// export const Selected = Template.bind({})
// Selected.args = {
//   color: 'blue',
//   size: 'base',
//   label: 'Regular'
// }