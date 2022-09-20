class GoogleForm {
  constructor(options) {
    this.html = `
    <form action="" method="">
      ${options.fields.reduce(
        (acc, next) =>
          acc +
          `<label for="${
            next.attributes.find((attr) => attr.name === 'id').value
          }">${next.name}</label>
          <${next.tag}${next.attributes.reduce(
            (acc, next) => acc + ` ${next.name}="${next.value}"`,
            ''
          )} required="${next.isRequired ? 'required' : ''}" />`,
        ''
      )}
    </form>
    `;
  }

  render(selector) {
    document.querySelector(selector).innerHTML += this.html;
  }
}

function isAgeValid(age) {
  try {
    age = +age;
  } catch (err) {
    return false;
  }
  if (!(Number.isInteger(age) && age > 0 && age < 150)) {
    return false;
  }
  return true;
}

const sampleForm = new GoogleForm({
  title: 'Your age',
  description: 'Please enter your age',
  fields: [
    {
      name: 'Age',
      isRequired: true,
      validationFunctions: [isAgeValid],
      errorMessage: 'The age is invalid',
      attributes: [
        { name: 'id', value: 'ageInput' },
        { name: 'type', value: 'number' },
      ],
      tag: 'input',
    },
  ],
});

sampleForm.render('div.google-form');
