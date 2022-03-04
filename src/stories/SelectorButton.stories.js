import SelectorButton from '../app/renderer/components/ui/buttons/SelectorButton.vue'

export default {
  title: 'Buttons/Selector',
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
  label: 'Button' 
}