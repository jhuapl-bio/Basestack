import Label from '../app/renderer/components/ui/forms/Label.vue'

export default {
  title: 'Form/Label',
  component: Label,
  argTypes: {
    text: {
      control: {type: 'text'},
      defaultValue: 'Text',
    },
  },
};

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: {Label},
  template: `<label v-bind="$props">{{text}}</label>`
});

export const Default = Template.bind({})
Default.args = {
  text: 'Text'
}