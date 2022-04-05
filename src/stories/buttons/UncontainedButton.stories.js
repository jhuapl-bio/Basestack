import UncontainedButton from '../../app/renderer/components/ui/buttons/UncontainedButton.vue'

export default {
  title: 'Buttons/Uncontained',
  component: UncontainedButton,
  argTypes: {
    label: {
      control: {type: 'text'},
      defaultValue: 'Button',
    },
    icon: {
      control: { type: 'text' },
      defaultValue: '',
    }
  },
};

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: {UncontainedButton},
  template: `<uncontained-button v-bind="$props"></uncontained-button>`
});

export const Uncontained = Template.bind({})
Uncontained.args = {
  label: 'Button'
}