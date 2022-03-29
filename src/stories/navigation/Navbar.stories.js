import NavBar from '../../app/renderer/components/ui/nav/NavBar.vue'

export default {
  title: 'Nav/Nav Bar',
  component: NavBar,
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
  components: {NavBar},
  template: `
    <nav-bar v-bind="$props">{{icon ?? slotFallback}}</nav-bar>
    `
});

export const Default = Template.bind({})
Default.args = {
    moduleName: "Module"
}