const sampleForm = new GoogleForm({
  title: 'Your info',
  description: 'Please enter your info',
  fields: [
    {
      title: 'Name',
      name: 'name',
      isRequired: true,
      validationFunctions: [isNameValid],
      errorMessage: 'The name is invalid',
      attributes: {},
      type: 'input',
    },
    {
      title: 'Age',
      name: 'age',
      isRequired: false,
      validationFunctions: [isAgeValid],
      errorMessage: 'The age is invalid',
      attributes: { type: 'number' },
      type: 'input',
    },
    {
      title: 'Email',
      name: 'email',
      validationFunctions: [isEmailValid],
      errorMessage: 'The email is invalid',
      attributes: { type: 'email' },
      type: 'input',
    },
    {
      title: 'Password',
      name: 'password',
      attributes: { type: 'password' },
      type: 'input',
    },
    {
      title: 'Phone',
      name: 'phone',
      attributes: { type: 'tel' },
      type: 'input',
    },
    {
      title: 'URL',
      name: 'url',
      attributes: { type: 'url' },
      type: 'input',
    },
    {
      title: 'What color do you like?',
      name: 'color',
      isRequired: true,
      validationFunctions: [],
      attributes: {},
      type: 'radio',
      values: ['Red', 'Green', 'Blue'],
    },
    {
      title: 'Do you have a dog?',
      name: 'hasDog',
      isRequired: true,
      type: 'checkbox',
    },
    {
      title: 'Do you have a cat?',
      name: 'hasCat',
      type: 'checkbox',
    },
    {
      title: 'What country are you from?',
      name: 'country',
      isRequired: true,
      type: 'select',
      values: ['Russia', 'USA', 'China', 'France', 'Uzbekistan'],
    },
    {
      title: 'What city are you from?',
      name: 'city',
      type: 'select',
      values: {
        Russia: ['Moscow', 'Saint-Petersburg', 'Voronezh', 'Omsk'],
        USA: ['New York', 'Washington', 'Detroit', 'Miami'],
        China: ['Beijing', 'Hong-Kong', 'Shanghai'],
        France: ['Paris'],
        Uzbekistan: ['Tashkent'],
      },
    },
  ],
});

sampleForm.render('.google-form');
sampleForm.render('.google-form');

sampleForm.onSubmit((data) => {
  console.log('this is another one');
  console.table(data);
});
