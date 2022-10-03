function toTitleCase() {
  return this.charAt(0)
    .toUpperCase() + this.substring(1)
    .toLowerCase();
}


String.prototype.toTitleCase = toTitleCase;


class GoogleForm {
  #html = '';
  #options = {};
  #defaultRequiredError = 'Please, enter this field.';
  #defaultInvalidError = 'Please, input correct data.';

  constructor(options) {
    // check the options argument for fields to exist
    if (!options?.title || !options?.fields?.reduce(
      (acc, nextField) => acc * !!nextField?.name * !!nextField?.type?.keyword,
      true,
    ) || (
      options?.type?.keyword === 'radio' && !options?.type?.values
    )) {
      throw new TypeError('The options object must contain the "title" and' +
        ' "fields" keys, and its "fields" key must be an array of object' +
        ' with keys "name" and "type", and radio input type must have' +
        ' "values" array in its "type" object');
    }
    // generate html code for the form instance
    this.#html += '<form>';
    this.#html += '<fieldset>';
    this.#html += `<legend>${options.title}</legend>`;
    if (options?.description) {
      this.#html += `<p>${options.description}</p>`;
    }
    for (const fieldOptions of options.fields) {
      if (fieldOptions.type.keyword === 'radio') {
        this.#html += '<div>';
        this.#html += `<span>${fieldOptions.name.toTitleCase()}`;
        this.#html += `<span>${fieldOptions?.isRequired ? '*' : ''}</span>`;
        this.#html += '</span>';
        this.#html += '<br />';
        this.#html += '<div>';
        for (const value of fieldOptions.type.values) {
          this.#html += '<label>';
          this.#html += `<input type="radio"`;
          for (const [attributeKey, attributeValue] of
            Object.entries(fieldOptions.attributes || [])) {
            this.#html += ` ${attributeKey}="${attributeValue}"`;
          }
          this.#html += ` name="${fieldOptions.name}" value="${value}" />`;
          this.#html += `${value.toTitleCase()}</label>`;
          this.#html += '<br />';
        }
        this.#html += '</div>';
        this.#html += `<span></span>`;
        this.#html += '<br />';
        this.#html += '</div>';
      } else if (fieldOptions.type.keyword === 'checkbox') {
        this.#html += `<label>`;
        this.#html += `<input type="checkbox"`;
        for (const [attributeKey, attributeValue] of
          Object.entries(fieldOptions.attributes || [])) {
          this.#html += ` ${attributeKey}="${attributeValue}"`;
        }
        this.#html += ' />';
        this.#html += fieldOptions.name.toTitleCase();
        this.#html += `<span>${fieldOptions?.isRequired ? '*' : ''}</span>`;
        this.#html += '<br />';
        this.#html += `<span></span>`;
        this.#html += '<br />';
        this.#html += '</label>';
      } else {
        this.#html += `<label>${fieldOptions.name.toTitleCase()}`;
        this.#html += `<span>${fieldOptions?.isRequired ? '*' : ''}</span>`;
        this.#html += '<br />';
        this.#html += `<input`;
        for (const [attributeKey, attributeValue] of
          Object.entries(fieldOptions.attributes || [])) {
          this.#html += ` ${attributeKey}="${attributeValue}"`;
        }
        this.#html += ' />';
        this.#html += '<br />';
        this.#html += `<span></span>`;
        this.#html += '<br />';
        this.#html += '</label>';
      }
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
      fieldElement.addEventListener('keypress', (event) => {
        event.stopImmediatePropagation();
        if (event.code === 'Enter') {
          event.preventDefault();
          if (['radio', 'checkbox'].includes(
            fieldElement.getAttribute('type'))) {
            fieldElement.checked = !fieldElement.checked;
          } else {
            formElement.querySelector('button[type="submit"]')
              .focus();
          }
        }
      });
    }
    formElement
      .addEventListener('submit', (event) => {
        event.stopImmediatePropagation();
        event.preventDefault();
        let willContinueSubmit = true;
        for (const fieldElement of formElement.querySelectorAll(
          'input:not([type="radio"]):not([type="checkbox"])')) {
          const fieldLabelElement = fieldElement.parentElement;
          const fieldOptions = this.#options.fields.find(
            ({name}) => fieldLabelElement.childNodes.item(0).textContent ===
              name.toTitleCase());
          const errorElement = fieldLabelElement.querySelector(
            'span:last-of-type');
          if ((
            fieldOptions?.isRequired || fieldElement.value !== ''
          ) && !fieldOptions
            ?.validationFunctions
            ?.reduce(
              (acc, nextFunc) => acc * nextFunc(fieldElement.value), true)) {
            errorElement.textContent =
              fieldOptions?.errorMessage || this.#defaultInvalidError;
            willContinueSubmit = false;
          } else {
            errorElement.textContent = '';
          }
        }
        for (const radioWrapperElement of
          formElement.querySelectorAll('fieldset > div')) {
          const radioTitleElement = radioWrapperElement.querySelector(
            'span:first-of-type');
          const radioOptions = this.#options.fields.find(
            ({name}) => radioTitleElement.childNodes.item(0).textContent ===
              name.toTitleCase());
          const radioErrorElement = radioWrapperElement.querySelector(
            'div + span');
          if (radioOptions?.isRequired && !Array.prototype.reduce.call(
            radioWrapperElement.querySelectorAll('input'),
            (acc, nextRadio) => acc + nextRadio.checked, false,
          )) {
            radioErrorElement.textContent =
              radioOptions?.errorMessage || this.#defaultRequiredError;
            willContinueSubmit = false;
          } else {
            radioErrorElement.textContent = '';
          }
        }
        if (!willContinueSubmit) {
          return;
        }
        alert('The form is submitted successfully!');
      });
  }
}
