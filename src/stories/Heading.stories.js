export default {
  title: 'Heading',
  argTypes: {
    label: {
      control: {type: 'text'},
    },
  },
};

export const Default = (args, {argTypes}) => ({
  storyName: 'Default',
  props: Object.keys(argTypes),
  template: `
    <div>
        <h1 class="markup-h1">Heading 1</h1>
        <h2 class="markup-h2">Heading 2</h2>
        <h3 class="markup-h3">Heading 3</h3>
        <h4 class="markup-h4">Heading 4</h4>
        <h5 class="markup-h5">Heading 5</h5>
        <h6 class="markup-h6">Heading 6</h6>
    </div>
  `
})

export const Strong = (args, {argTypes}) => ({
    storyName: 'Strong',
    props: Object.keys(argTypes),
    template: `
      <div>
        <h1 class="markup-h1 strong">Heading 1</h1>
        <h2 class="markup-h2 strong">Heading 2</h2>
        <h3 class="markup-h3 strong">Heading 3</h3>
        <h4 class="markup-h4 strong">Heading 4</h4>
        <h5 class="markup-h5 strong">Heading 5</h5>
        <h6 class="markup-h6 strong">Heading 6</h6>
      </div>
    `
  })
