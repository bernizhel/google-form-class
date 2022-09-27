function addCssRule(cssRuleText) {
  if (!document.head.querySelector('style')) {
    document.head.appendChild(document.createElement('style'));
  }
  document.head.querySelector('style').textContent += cssRuleText;
}

class GoogleForm {
  #html = '';
  #options = {};

  constructor(options) {
    // generate html code for the form instance
    this.#html += '<form>';
    this.#html += '<fieldset>';
    this.#html += `<legend>${options.title}</legend>`;
    this.#html += `<label>${options.description}</label>`;
    for (const fieldOptions of options.fields) {
      this.#html += '<div>';
      this.#html += `<label for="${fieldOptions.attributes.id ??
      ''}">${fieldOptions.name}</label>`;
      if (fieldOptions.isRequired) {
        this.#html += `<span class="inputRequired">*</span>`;
      }
      this.#html +=
        `<${fieldOptions.tag}${Object.entries(fieldOptions.attributes)
          .reduce(
            (acc, [attrKey, attrValue]) => acc + ` ${attrKey}="${attrValue}"`,
            '',
          )} ${fieldOptions.isRequired ? 'required' : ''} />`;
      this.#html +=
        `<span class="inputError">${fieldOptions.errorMessage}</span>`;
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
    addCssRule(`
        ${selector} form input + span.inputError {
          display: none;
        }
      `);
    addCssRule(`
        ${selector} form input:invalid + span.inputError[data-error] {
          display: inline-block;
        }
      `);
    for (const fieldElement of
      document.querySelectorAll(`${selector} form:last-child input`)) {
      const fieldOptions = this.#options.fields.find(
        ({name}) => fieldElement.parentElement.querySelector(
            `label[for="${fieldElement.getAttribute('id')}"]`).textContent ===
          name);
      fieldElement.addEventListener('invalid', (e) => {
        e.preventDefault();
        const errorElement = fieldElement.parentElement.querySelector(
          `#${fieldOptions.attributes.id} + span.inputError`);
        if (!fieldOptions
          .validationFunctions
          .reduce((acc, nextFunc) => acc * nextFunc(e.target.value), true)) {
          errorElement.setAttribute('data-error', '');
          console.log(fieldOptions.name + ': false');
        } else {
          errorElement.removeAttribute('data-error');
          fieldElement.setCustomValidity('');
          fieldElement.reportValidity();
          setTimeout(() => {
            fieldElement.parentElement.parentElement.querySelector(
                'button[type="submit"]')
              .click();
          }, 0);
          console.log(fieldOptions.name + ': true');
        }
      });
    }
    document
      .querySelector(`${selector} form:last-child`)
      .addEventListener('submit', (e) => {
        e.preventDefault();
        for (const fieldElement of e.target.querySelectorAll('input')) {
          const fieldOptions = this.#options.fields.find(
            ({name}) => fieldElement.parentElement.querySelector(
                `label[for="${fieldElement.getAttribute('id')}"]`).textContent ===
              name);
          if ((
            fieldOptions.isRequired || fieldElement.value !== ''
          ) && !fieldOptions
            .validationFunctions
            .reduce(
              (acc, nextFunc) => acc * nextFunc(fieldElement.value), true)) {
            fieldElement.setCustomValidity(fieldOptions.errorMessage);
            if (!fieldElement.reportValidity()) {
              return;
            }
          } else {
            fieldElement.setCustomValidity('');
          }
        }
        alert('Are you sure you want to submit the form?');
        for (const element of e.target.querySelectorAll('input')) {
          console.log(`${element.parentElement.querySelector(
            `label[for="${element.getAttribute(
              'id')}"]`).textContent}: ${element.value}`);
        }
      });
  }
}

// sampleForm

function isAgeValid(age) {
  try {
    age = +age;
  } catch (err) {
    return false;
  }
  return Number.isInteger(age) && age > 0 && age < 150;
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
    isRequired: true,
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
    isRequired: false,
    validationFunctions: [isEmailValid],
    errorMessage: 'The email is invalid',
    attributes: {
      id: 'emailInput',
    },
    tag: 'input',
  }],
});

sampleForm.render('div.google-form');
