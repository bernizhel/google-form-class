const sampleForm = new GoogleForm({
  title: 'Your info',
  description: 'Please enter your info',
  fields: [{
    name: 'name',
    isRequired: true,
    validationFunctions: [isNameValid],
    errorMessage: 'The name is invalid',
    attributes: {},
    type: {keyword: 'input'},
  }, {
    name: 'age',
    isRequired: false,
    validationFunctions: [isAgeValid],
    errorMessage: 'The age is invalid',
    attributes: {},
    type: {keyword: 'input'},
  }, {
    name: 'email',
    isRequired: true,
    validationFunctions: [isEmailValid],
    errorMessage: 'The email is invalid',
    // attributes: {},
    type: {keyword: 'input'},
  }, {
    name: 'color',
    isRequired: true,
    validationFunctions: [],
    // errorMessage: 'The color is invalid',
    attributes: {},
    type: {
      keyword: 'radio',
      values: ['red', 'green', 'blue'],
    },
  }],
});

sampleForm.render('.google-form');
sampleForm.render('.google-form');
