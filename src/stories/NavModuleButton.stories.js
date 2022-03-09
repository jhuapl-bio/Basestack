import ModuleButton from '../app/renderer/components/ui/nav/ModuleButton.vue'

export default {
  title: 'Nav/Module Button',
  component: ModuleButton,
  argTypes: {
    moduleName: {
        control: {type: 'text'},
        defaultValue: 'Module',
    },
    link: {
        control: {type: 'text'},
        defaultValue: 'Text',
    },
    icon: {
        control: {type: 'text'},
        defaultValue: '',
    },
    slotFallback: {
        control: {type: 'text'},
        defaultValue: null,
    },
    // color: {
    //     control: {type: 'select'},
    //   },
  },
};

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: {ModuleButton},
  template: `
    <module-button v-bind="$props">{{icon ?? slotFallback}}</module-button>
    `
});

export const Default = Template.bind({})
Default.args = {
    moduleName: "Module"
}