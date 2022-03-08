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
      defaultValue: 'plus',
    }
  },
};

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: {SelectorButton},
  template: `<selector-button v-bind="$props"></selector-button>`
});

export const Primary = Template.bind({})
Primary.args = {
  action: 'primary',
  size: 'base',
  label: 'Button'
}

export const Secondary = Template.bind({})
Secondary.args = {
    action: 'secondary',
    size: 'base',
    label: 'Button'
  }

  export const Accent = Template.bind({})
  Accent.args = {
    action: 'accent',
    size: 'base',
    label: 'Button'
  }

  export const Success = Template.bind({})
  Success.args = {
    action: 'success',
    size: 'base',
    label: 'Button'
  }

  export const Danger = Template.bind({})
  Danger.args = {
    action: 'danger',
    size: 'base',
    label: 'Button'
  }