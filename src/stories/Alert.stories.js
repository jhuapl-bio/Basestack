import Alert from "@/components/ui/Alert";

export default {
    title: "Alert",
    component: Alert,
    argTypes: {
        type: {
            control: { type: 'select' },
            options: ['success', 'warning', 'error'],
        },
        fill: {
            control: {type: 'boolean'},
            defaultValue: 'true'
        },
        message: {
            control: {type: 'text'},
            defaultValue: 'Dependencies Missing'
        },
    }
};

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { Alert },
  template: `<Alert v-bind="$props"></Alert>`,
});
export const Default = Template.bind({});

export const Success = Template.bind({})
Success.args = {
    type: 'success'
}

export const Warning = Template.bind({})
Warning.args = {
    type: 'warning'
}

export const Error = Template.bind({})
Error.args = {
    type: 'error'
}

export const NoFill = Template.bind({})
NoFill.args = {
    fill: false
}