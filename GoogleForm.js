class GoogleForm {
  #html = '';
  #options = {};
  #defaultRequiredError = 'Please, enter this field.';
  #defaultInvalidError = 'Please, input correct data.';
  #defaultSelectOption = 'Not selected';

  constructor(options) {
    // check the options argument for fields to exist
    if (!options?.title || !options?.fields?.reduce(
      (acc, nextField) => acc * !!nextField?.name * !!nextField?.type?.keyword,
      true,
    ) || (
      options?.type?.keyword === 'radio' && !options?.type?.values
    )) {
      throw new TypeError('The options argument passed by creating a new' +
        ' GoogleForm instance must be of the corresponding type, please,' +
        ' read the documentation on this class.');
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
        this.#html += `<span>${fieldOptions.name}`;
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
          this.#html += `${value}</label>`;
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
        this.#html += fieldOptions.name;
        this.#html += '<br />';
        this.#html += `<span></span>`;
        this.#html += '<br />';
        this.#html += '</label>';
      } else if (fieldOptions.type.keyword === 'select') {
        this.#html += `<label>${fieldOptions.name}`;
        this.#html += `<span>${fieldOptions?.isRequired ? '*' : ''}</span>`;
        this.#html += '<br />';
        this.#html += `<select`;
        for (const [attributeKey, attributeValue] of
          Object.entries(fieldOptions.attributes || [])) {
          this.#html += ` ${attributeKey}="${attributeValue}"`;
        }
        this.#html += ' />';
        this.#html += `<option value="" selected ${fieldOptions.isRequired ?
          'disabled hidden' : ''}>${this.#defaultSelectOption}</option>`;
        if (Array.isArray(fieldOptions.type.values)) {
          for (const value of fieldOptions.type.values) {
            this.#html += `<option value="${value}">${value}</option>`;
          }
        } else {
          for (const [valuesGroup, values] of
            Object.entries(fieldOptions.type.values)) {
            this.#html += `<optgroup label="${valuesGroup}">`;
            for (const value of values) {
              this.#html += `<option value="${value}">${value}</option>`;
            }
            this.#html += '</optgroup>';
          }
        }
        this.#html += '</select>';
        this.#html += '<br />';
        this.#html += `<span></span>`;
        this.#html += '<br />';
        this.#html += '</label>';
      } else {
        this.#html += `<label>${fieldOptions.name}`;
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
              name);
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
              name);
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
        for (const selectElement of formElement.querySelectorAll('select')) {
          const selectLabelElement = selectElement.parentElement;
          const selectOptions = this.#options.fields.find(
            ({name}) => selectLabelElement.childNodes.item(0).textContent ===
              name);
          const selectErrorElement = selectLabelElement.querySelector(
            'span:last-of-type');
          if (selectOptions?.isRequired && selectElement.value === '') {
            selectErrorElement.textContent =
              selectOptions?.errorMessage || this.#defaultRequiredError;
            willContinueSubmit = false;
          } else {
            selectErrorElement.textContent = '';
          }
        }
        if (!willContinueSubmit) {
          return;
        }
        alert('The form is submitted successfully!');
      });
  }
}
