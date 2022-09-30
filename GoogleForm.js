class GoogleForm {
  #html = '';
  #options = {};

  constructor(options) {
    // generate html code for the form instance
    this.#html += '<form>';
    this.#html += `<h3>${options.title}</h3>`;
    this.#html += '<fieldset>';
    this.#html += `<legend>${options.description}</legend>`;
    for (const fieldOptions of options.fields) {
      this.#html += '<div>';
      this.#html += `<label for="${fieldOptions.attributes.id ??
      ''}">${fieldOptions.name}</label>`;
      this.#html += `<span>${fieldOptions.isRequired ? '*' : ''}</span>`;
      this.#html += '<br />';
      this.#html +=
        `<${fieldOptions.tag}${Object.entries(fieldOptions.attributes)
          .reduce(
            (acc, [attrKey, attrValue]) => acc + ` ${attrKey}="${attrValue}"`,
            '',
          )} />`;
      this.#html += '<br />';
      this.#html += `<span></span>`;
      this.#html += '</div>';
    }
    this.#html += '<button type="submit">Submit</button>';
    this.#html += '</fieldset>';
    this.#html += '</form>';
    // save the options argument to use it in the render method
    this.#options = options;
  }

  render(selector) {
    document.querySelector(selector).innerHTML += this.#html;
    const formElement = document.querySelector(`${selector} form:last-child`);
    for (const fieldElement of formElement.querySelectorAll('input')) {
      const fieldWrapperElement = fieldElement.parentElement;
      const fieldOptions = this.#options.fields.find(
        ({name}) => fieldWrapperElement.querySelector(`label`).textContent ===
          name);
      fieldElement.addEventListener('invalid', (event) => {
        event.preventDefault();
        const errorElement = fieldWrapperElement.querySelector('input ~ span');
        if ((
          fieldOptions.isRequired || fieldElement.value !== ''
        ) && !fieldOptions
          .validationFunctions
          .reduce(
            (acc, nextFunc) => acc * nextFunc(fieldElement.value), true)) {
          fieldElement.setCustomValidity(fieldOptions.errorMessage);
          console.log(`${fieldOptions.name} is not valid`);
        } else {
          fieldElement.setCustomValidity('');
          setTimeout(() => {
            formElement.querySelector('button[type="submit"]')
              .click();
          }, 0);
          console.log(`${fieldOptions.name} is okay`);
        }
        errorElement.textContent = fieldElement.validationMessage;
      });
    }
    formElement
      .addEventListener('submit', (event) => {
        event.preventDefault();
        let willContinueSubmit = true;
        for (const fieldElement of formElement.querySelectorAll('input')) {
          const fieldWrapperElement = fieldElement.parentElement;
          const fieldOptions = this.#options.fields.find(
            ({name}) => fieldWrapperElement.querySelector(
              `label`).textContent === name);
          if ((
            fieldOptions.isRequired || fieldElement.value !== ''
          ) && !fieldOptions
            .validationFunctions
            .reduce(
              (acc, nextFunc) => acc * nextFunc(fieldElement.value), true)) {
            fieldElement.setCustomValidity(fieldOptions.errorMessage);
            if (!fieldElement.reportValidity()) {
              willContinueSubmit = false;
            }
          }
        }
        if (willContinueSubmit) {
          console.log('The form is submitted successfully!');
        }
      });
  }
}

// Here is a sample for the form creation

function isAgeValid(age) {
  try {
    age = +age;
  } catch (error) {
    return false;
  }
  return Number.isInteger(age) && age > 0 && age < 120;
}

function isNameValid(name) {
  return !!name.match(/^[A-Z]\w{1,29}$/);
}

function isEmailValid(email) {
  return !!email.match(/^.+@.+\..+$/);
}

const sampleForm = new GoogleForm({
  title: 'Your info',
  description: 'Please enter your info',
  fields: [{
    name: 'Name',
    isRequired: true,
    validationFunctions: [isNameValid],
    errorMessage: 'The name is invalid',
    attributes: {
      id: 'nameInput',
    },
    tag: 'input',
  }, {
    name: 'Age',
    isRequired: false,
    validationFunctions: [isAgeValid],
    errorMessage: 'The age is invalid',
    attributes: {
      id: 'ageInput',
    },
    tag: 'input',
  }, {
    name: 'Phone',
    isRequired: false,
    validationFunctions: [],
    errorMessage: 'The phone is invalid',
    attributes: {
      id: 'phoneInput',
    },
    tag: 'input',
  }, {
    name: 'Email',
    isRequired: true,
    validationFunctions: [isEmailValid],
    errorMessage: 'The email is invalid',
    attributes: {
      id: 'emailInput',
    },
    tag: 'input',
  }],
});

sampleForm.render('.google-form');
