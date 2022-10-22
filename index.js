const sampleForm = new GoogleForm({
  title: 'Your info',
  description: 'Please enter your info',
  fields: [{
    name: 'Name',
    isRequired: true,
    validationFunctions: [isNameValid],
    errorMessage: 'The name is invalid',
    attributes: {},
    type: {keyword: 'input'},
  }, {
    name: 'Age',
    isRequired: false,
    validationFunctions: [isAgeValid],
    errorMessage: 'The age is invalid',
    attributes: {},
    type: {keyword: 'input'},
  }, {
    name: 'Email',
    isRequired: true,
    validationFunctions: [isEmailValid],
    errorMessage: 'The email is invalid',
    type: {keyword: 'input'},
  }, {
    name: 'What color do you like?',
    isRequired: true,
    validationFunctions: [],
    attributes: {},
    type: {
      keyword: 'radio',
      values: ['Red', 'Green', 'Blue'],
    },
  }, {
    name: 'Do you have a dog?',
    isRequired: true,
    type: {keyword: 'checkbox'},
  }, {
    name: 'Do you have a cat?',
    type: {keyword: 'checkbox'},
  }, {
    name: 'What country are you from?',
    isRequired: true,
    type: {
      keyword: 'select',
      values: ['Russia', 'USA', 'China', 'France', 'Uzbekistan'],
    },
  }, {
    name: 'What city are you from?',
    type: {
      keyword: 'select',
      values: {
        'Russia': ['Moscow', 'Saint-Petersburg', 'Voronezh', 'Omsk'],
        'USA': ['New York', 'Washington', 'Detroit', 'Miami'],
        'China': ['Beijing', 'Hong-Kong', 'Shanghai'],
        'France': ['Paris'],
        'Uzbekistan': ['Tashkent'],
      },
    },
  }],
});

sampleForm.render('.google-form');

document.querySelector('.google-form form')
  .addEventListener('submit', (event) => {
    if (!event.data) {
      return;
    }
    console.table(event.data);
  });
