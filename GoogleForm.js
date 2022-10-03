class GoogleForm {
  #html = '';
  #options = {};
  #defaultRequiredError = 'Please, enter this field.';
  #defaultInvalidError = 'Please, input correct data.';
  #defaultSelectOption = 'Not selected';

  constructor(options) {
    // check the options argument for the necessary fields to exist
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
      // for the radio field
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
        // used to output error message
        this.#html += `<span></span>`;
        this.#html += '<br />';
        this.#html += '</div>';
      }
      // for the checkbox field
      else if (fieldOptions.type.keyword === 'checkbox') {
        this.#html += `<label>`;
        this.#html += `<input type="checkbox"`;
        for (const [attributeKey, attributeValue] of
          Object.entries(fieldOptions.attributes || [])) {
          this.#html += ` ${attributeKey}="${attributeValue}"`;
        }
        this.#html += ' />';
        this.#html += fieldOptions.name;
        this.#html += '<br />';
        // used to output error message
        this.#html += `<span></span>`;
        this.#html += '<br />';
        this.#html += '</label>';
      }
      // for the select field
      else if (fieldOptions.type.keyword === 'select') {
        this.#html += `<label>${fieldOptions.name}`;
        this.#html += `<span>${fieldOptions?.isRequired ? '*' : ''}</span>`;
        this.#html += '<br />';
        this.#html += `<select`;
        for (const [attributeKey, attributeValue] of
          Object.entries(fieldOptions.attributes || [])) {
          this.#html += ` ${attributeKey}="${attributeValue}"`;
        }
        this.#html += ' />';
        // define the default option for all the select fields (is not after
        // selection of another option available if the field is required)
        this.#html += `<option value="" selected ${fieldOptions.isRequired ?
          'disabled hidden' : ''}>${this.#defaultSelectOption}</option>`;
        // if type.values key is an array
        if (Array.isArray(fieldOptions.type.values)) {
          for (const value of fieldOptions.type.values) {
            this.#html += `<option value="${value}">${value}</option>`;
          }
        }
        // otherwise it is an object of {optgroup: [options]}
        else {
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
        // used to output error message
        this.#html += `<span></span>`;
        this.#html += '<br />';
        this.#html += '</label>';
      }
      // for the default input use
      else {
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
        // used to output error message
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
      // handle Enter pressing for all the inputs (select default behavior
      // is good enough)
      fieldElement.addEventListener('keypress', (event) => {
        event.stopImmediatePropagation();
        if (event.code === 'Enter') {
          event.preventDefault();
          // if the input is radio or checkbox, toggle it
          if (['radio', 'checkbox'].includes(
            fieldElement.getAttribute('type'))) {
            fieldElement.checked = !fieldElement.checked;
          }
          // for all the other inputs focus the user on the submit button
          else {
            formElement.querySelector('button[type="submit"]')
              .focus();
          }
        }
      });
    }
    // the form's submit event handling
    formElement
      .addEventListener('submit', (event) => {
        event.stopPropagation();
        event.preventDefault();
        // use the submitData variable to store all inputs' values
        const submitData = {};
        // use the willContinueSubmit flag to stop the submit event if there
        // is at least one invalid field
        let willContinueSubmit = true;
        // for all the inputs that are neither radios nor checkboxes
        for (const fieldElement of formElement.querySelectorAll(
          'input:not([type="radio"]):not([type="checkbox"])')) {
          const fieldLabelElement = fieldElement.parentElement;
          const fieldOptions = this.#options.fields.find(
            ({name}) => fieldLabelElement.childNodes.item(0).textContent ===
              name);
          const errorElement = fieldLabelElement.querySelector(
            'span:last-of-type');
          // if the field is required or not empty and its value is not valid
          if ((
            fieldOptions?.isRequired || fieldElement.value !== ''
          ) && !fieldOptions
            ?.validationFunctions
            ?.reduce(
              (acc, nextFunc) => acc * nextFunc(fieldElement.value), true)) {
            // place the error message into the span error element and set
            // the willContinueSubmitFlag to false (but the handler function
            // won't stop running)
            errorElement.textContent =
              fieldOptions?.errorMessage || this.#defaultInvalidError;
            willContinueSubmit = false;
          } else {
            // else empty the span error element and save the field value
            errorElement.textContent = '';
            submitData[fieldOptions.name] = fieldElement.value;
          }
        }
        // for all the radio inputs
        for (const radioWrapperElement of
          formElement.querySelectorAll('fieldset > div')) {
          const radioTitleElement = radioWrapperElement.querySelector(
            'span:first-of-type');
          const radioOptions = this.#options.fields.find(
            ({name}) => radioTitleElement.childNodes.item(0).textContent ===
              name);
          const radioErrorElement = radioWrapperElement.querySelector(
            'div + span');
          // if the radio field is required and no radio button is checked
          if (radioOptions?.isRequired && !Array.prototype.reduce.call(
            radioWrapperElement.querySelectorAll('input'),
            (acc, nextRadio) => acc + nextRadio.checked, false,
          )) {
            // place the error message into the span error element and set
            // the willContinueSubmitFlag to false (but the handler function
            // won't stop running)
            radioErrorElement.textContent =
              radioOptions?.errorMessage || this.#defaultRequiredError;
            willContinueSubmit = false;
          } else {
            // else empty the span error element and save the field value
            radioErrorElement.textContent = '';
            submitData[radioOptions.name] = Array.prototype.find.call(
              radioWrapperElement.querySelectorAll('input'),
              (radioElement) => radioElement.checked,
            ).value;
          }
        }
        // for all the checkboxes just save the user's choice
        for (const checkboxElement of
          formElement.querySelectorAll('input[type="checkbox"]')) {
          submitData[checkboxElement.parentElement.childNodes.item(
            1).textContent] = checkboxElement.checked;
        }
        // for all the select fields
        for (const selectElement of formElement.querySelectorAll('select')) {
          const selectLabelElement = selectElement.parentElement;
          const selectOptions = this.#options.fields.find(
            ({name}) => selectLabelElement.childNodes.item(0).textContent ===
              name);
          const selectErrorElement = selectLabelElement.querySelector(
            'span:last-of-type');
          // if the select field is required and its default selection value
          // is empty (that is by default)
          if (selectOptions?.isRequired && selectElement.value === '') {
            // place the error message into the span error element and set
            // the willContinueSubmitFlag to false (but the handler function
            // won't stop running)
            selectErrorElement.textContent =
              selectOptions?.errorMessage || this.#defaultRequiredError;
            willContinueSubmit = false;
          } else {
            // else empty the span error element and save the field value
            selectErrorElement.textContent = '';
            submitData[selectOptions.name] = selectElement.value;
          }
        }
        // if at least one field is not valid or is empty if it is required
        // then terminate the handler function execution
        if (!willContinueSubmit) {
          return;
        }
        // otherwise place the submitData object into "data" field of the
        // event to access the field in subsequent submit listeners
        event.data = submitData;
      });
  }
}
