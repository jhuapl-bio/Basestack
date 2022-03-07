import CircleButton from '../app/renderer/components/ui/buttons/CircleButton.vue'

export default {
  title: 'Buttons/Circle',
  component: CircleButton,
  argTypes: {
    icon: {
      control: { type: 'text' },
      defaultValue: 'plus',
    }
  },
};

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: {CircleButton},
  template: `<circle-button v-bind="$props"></circle-button>`
});

export const Circle = Template.bind({})
Circle.args = {
  label: 'Button'
}
