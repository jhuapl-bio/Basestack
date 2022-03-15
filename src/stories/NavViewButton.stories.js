import ViewButton from '../app/renderer/components/ui/nav/ViewButton.vue'

export default {
  title: 'Nav/View Button',
  component: ViewButton,
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
        defaultValue: 'book',
    },
    slotFallback: {
        control: {type: 'text'},
        defaultValue: 'Library',
    },
    // color: {
    //     control: {type: 'select'},
    //   },
  },
};

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: {ViewButton},
  template: `
    <view-button v-bind="$props">
        {{slotFallback}}
    </view-button>
    `
});

export const Default = Template.bind({})
Default.args = {
    moduleName: "Module"
}