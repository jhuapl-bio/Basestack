import Contact from "@/components/Dashboard/Contact";

export default {
  title: "Sections/Contact",
  component: Contact,
};

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { Contact },
  template: `<Contact v-bind="$props"></Contact>`,
});

export const Default = Template.bind({});
