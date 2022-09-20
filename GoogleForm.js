class GoogleForm {
  constructor(options) {
    this.html = '';
    this.html += '<form>';
    this.html += '<fieldset>';
    this.html += `<legend>${options.title}</legend>`;
    this.html += `<label>${options.description}</label>`;
    this.html += '<br />';
    for (const field of options.fields) {
      this.html += `<label for="${
        field.attributes.find((attr) => attr.name === 'id')?.value ?? ''
      }">${field.name}${field.isRequired ? '*' : ''}</label>`;
      this.html += `<${field.tag}${field.attributes.reduce(
        (acc, attr) => acc + ` ${attr.name}="${attr.value}"`,
        ''
      )} ${field.isRequired ? 'required' : ''} />`;
      this.html += '<br />';
    }
    this.html += '<button type="submit">Submit</button>';
    this.html += '</fieldset>';
    this.html += '</form>';
  }

  render(selector) {
    document.querySelector(selector).innerHTML += this.html;
    document
      .querySelector(`${selector} form:last-child`)
      .addEventListener('submit', (e) => {
        e.preventDefault();
        for (const element of e.target.querySelectorAll('input')) {
          console.log(
            `${element.previousElementSibling.textContent}: ${element.value}`
          );
        }
      });
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
  title: 'Your info',
  description: 'Please enter your info',
  fields: [
    {
      name: 'Age',
      isRequired: true,
      validationFunctions: [isAgeValid],
      errorMessage: 'The age is invalid',
      attributes: [{ name: 'id', value: 'ageInput' }],
      tag: 'input',
    },
    {
      name: 'Name',
      isRequired: false,
      validationFunctions: [],
      errorMessage: 'The name is invalid',
      attributes: [{ name: 'id', value: 'nameInput' }],
      tag: 'input',
    },
  ],
});

sampleForm.render('div.google-form');
