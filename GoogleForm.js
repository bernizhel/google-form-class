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
      this.#html += `<label>${fieldOptions.name}`;
      this.#html += `<span>${fieldOptions.isRequired ? '*' : ''}</span>`;
      this.#html += '<br />';
      this.#html += `<${fieldOptions.tag}`;
      for (const [attributeKey, attributeValue] of
        Object.entries(fieldOptions.attributes)) {
        this.#html += ` ${attributeKey}="${attributeValue}"`;
      }
      this.#html += ' />';
      this.#html += '<br />';
      this.#html += `<span></span>`;
      this.#html += '</label>';
      this.#html += '<br />';
    }
    this.#html += '<button type="submit">Submit</button>';
    this.#html += '</fieldset>';
    this.#html += '</form>';
    // save the options argument to use it in the render method
    this.#options = options;
  }

  render(selector) {
    document.querySelector(selector)
      .insertAdjacentHTML('beforeend', this.#html);
    const formElement = document.querySelector(`${selector} form:last-of-type`);
    for (const fieldElement of formElement.querySelectorAll('input')) {
      const fieldLabelElement = fieldElement.parentElement;
      const fieldOptions = this.#options.fields.find(
        ({name}) => fieldLabelElement.childNodes.item(0).textContent === name);
      fieldElement.addEventListener('invalid', (event) => {
        event.stopImmediatePropagation();
        event.preventDefault();
        const errorElement = fieldLabelElement.querySelector(
          'span:last-of-type');
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
            formElement.requestSubmit();
          }, 0);
          console.log(`${fieldOptions.name} is okay`);
        }
        errorElement.textContent = fieldElement.validationMessage;
      });
      fieldElement.addEventListener('keypress', (event) => {
        event.stopImmediatePropagation();
        if (event.code === 'Enter') {
          event.preventDefault();
        }
      });
    }
    formElement
      .addEventListener('submit', (event) => {
        event.stopImmediatePropagation();
        event.preventDefault();
        let willContinueSubmit = true;
        for (const fieldElement of formElement.querySelectorAll('input')) {
          const fieldLabelElement = fieldElement.parentElement;
          const fieldOptions = this.#options.fields.find(
            ({name}) => fieldLabelElement.childNodes.item(0).textContent ===
              name);
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
