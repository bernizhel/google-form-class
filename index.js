const sampleForm = new GoogleForm({
  title: 'Your info',
  description: 'Please enter your info',
  fields: [{
    name: 'Name',
    isRequired: true,
    validationFunctions: [isNameValid],
    errorMessage: 'The name is invalid',
    attributes: {},
    tag: 'input',
  }, {
    name: 'Age',
    isRequired: false,
    validationFunctions: [isAgeValid],
    errorMessage: 'The age is invalid',
    attributes: {},
    tag: 'input',
  }, {
    name: 'Phone',
    isRequired: false,
    validationFunctions: [],
    errorMessage: 'The phone is invalid',
    attributes: {},
    tag: 'input',
  }, {
    name: 'Email',
    isRequired: true,
    validationFunctions: [isEmailValid],
    errorMessage: 'The email is invalid',
    attributes: {},
    tag: 'input',
  }],
});

sampleForm.render('.google-form');
sampleForm.render('.google-form');
