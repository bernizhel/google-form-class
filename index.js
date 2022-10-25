const sampleForm = new GoogleForm({
  title: 'Your info',
  description: 'Please enter your info',
  fields: [{
    title: 'Name',
    name: 'name',
    isRequired: true,
    validationFunctions: [isNameValid],
    errorMessage: 'The name is invalid',
    attributes: {},
    type: {keyword: 'input'},
  }, {
    title: 'Age',
    name: 'age',
    isRequired: false,
    validationFunctions: [isAgeValid],
    errorMessage: 'The age is invalid',
    attributes: {type: 'number'},
    type: {keyword: 'input'},
  }, {
    title: 'Email',
    name: 'email',
    validationFunctions: [isEmailValid],
    errorMessage: 'The email is invalid',
    attributes: {type: 'email'},
    type: {keyword: 'input'},
  }, {
    title: 'Password',
    name: 'password',
    attributes: {type: 'password'},
    type: {keyword: 'input'},
  }, {
    title: 'Phone',
    name: 'phone',
    attributes: {type: 'tel'},
    type: {keyword: 'input'},
  }, {
    title: 'URL',
    name: 'url',
    attributes: {type: 'url'},
    type: {keyword: 'input'},
  }, {
    title: 'What color do you like?',
    name: 'color',
    isRequired: true,
    validationFunctions: [],
    attributes: {},
    type: {
      keyword: 'radio',
      values: ['Red', 'Green', 'Blue'],
    },
  }, {
    title: 'Do you have a dog?',
    name: 'hasDog',
    isRequired: true,
    type: {keyword: 'checkbox'},
  }, {
    title: 'Do you have a cat?',
    name: 'hasCat',
    type: {keyword: 'checkbox'},
  }, {
    title: 'What country are you from?',
    name: 'country',
    isRequired: true,
    type: {
      keyword: 'select',
      values: ['Russia', 'USA', 'China', 'France', 'Uzbekistan'],
    },
  }, {
    title: 'What city are you from?',
    name: 'city',
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
sampleForm.render('.google-form');

document.querySelectorAll('.google-form form')
  .forEach(form => form
    .addEventListener('submit', (event) => {
      if (!event.data) {
        return;
      }
      console.table(event.data);
    }));
