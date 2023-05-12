const app = Application.currentApplication()
app.includeStandardAdditions = true
console.log(app,"<<<<<<<")
const result = app.displayDialog('Please enter your sudo password.', {
  defaultAnswer: '',
  withIcon: 'stop',
  buttons: ['Cancel', 'Ok'],
  defaultButton: 'Ok',
  hiddenAnswer: true,
})

if (result.buttonReturned === 'Ok') {
  result.textReturned
} else {
  $.exit(255)
}