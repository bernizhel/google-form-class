class GoogleForm {
  #options = {};
  #formElement = this.#createElement('form', { noValidate: true });
  #submitButtonElement = this.#createElement('button', {
    type: 'submit',
    innerText: 'Submit',
  });

  #inputElements = {};
  #radioElements = {};
  #checkboxElements = {};
  #selectElements = {};

  #defaultInvalidError = 'Please, input correct data.';
  #defaultRequiredError = 'Please, enter this field.';
  #defaultSelectOption = 'Not selected';
  #borderStyle = '1px solid red';

  #inputKeyword = 'input';
  #radioKeyword = 'radio';
  #checkboxKeyword = 'checkbox';
  #selectKeyword = 'select';

  constructor(options) {
    if (!this.#checkOptions(options)) {
      throw new TypeError(
        `The options argument is not valid. Read the documentation on this class.`
      );
    }
    this.#setOptions(options);
    this.#initializeForm(options);
  }

  #checkOptions(options) {
    if (!options?.title || !(options?.fields && Array.isArray(options.fields))) {
      return false;
    }

    for (const field of options.fields) {
      if (!field?.title || !field?.name || !field?.type) {
        return false;
      }

      if ([this.#radioKeyword, this.#selectKeyword].includes(field.type) && !field?.values) {
        return false;
      }
    }

    return true;
  }

  #setOptions(options) {
    options.description = options?.description ?? {};

    for (let i = 0; i < options.fields.length; i++) {
      options.fields[i].isRequired ??= false;
      options.fields[i].validationFunctions ??= [];

      options.fields[i].errorMessage ??=
        options.fields[i].type === this.#inputKeyword
          ? this.#defaultInvalidError
          : this.#defaultRequiredError;

      options.fields[i].attributes ??= {};
    }

    this.#options = options;
  }

  #initializeForm(options) {
    const fieldsetElement = this.#createElement('fieldset');
    fieldsetElement.appendChild(this.#createElement('legend', { innerText: options.title }));

    if (options.description) {
      fieldsetElement.appendChild(this.#createElement('p', { innerText: options.description }));
    }

    for (const fieldOptions of options.fields) {
      if (fieldOptions.type === this.#inputKeyword) {
        fieldsetElement.appendChild(this.#createInputField(fieldOptions));
      }

      if (fieldOptions.type === this.#radioKeyword) {
        fieldsetElement.appendChild(this.#createRadioField(fieldOptions));
      }

      if (fieldOptions.type === this.#checkboxKeyword) {
        fieldsetElement.appendChild(this.#createCheckboxField(fieldOptions));
      }

      if (fieldOptions.type === this.#selectKeyword) {
        fieldsetElement.appendChild(this.#createSelectField(fieldOptions));
      }
    }

    fieldsetElement.appendChild(this.#createElement('br'));
    fieldsetElement.appendChild(this.#submitButtonElement);

    this.#formElement.appendChild(fieldsetElement);
    this.#addSubmitHandler(this.#formElement);
  }

  #createElement(tagName, options) {
    return Object.assign(document.createElement(tagName), options);
  }

  #createLabelElement(fieldOptions, fieldElement = {}, errorElement = {}) {
    const isCheckbox = fieldOptions.type === this.#checkboxKeyword;

    let labelElement = null;
    if (isCheckbox) {
      labelElement = this.#createElement('label');
    } else {
      labelElement = this.#createElement('label', {
        innerText: fieldOptions.title,
      });
    }

    const isRequiredElement = this.#createElement('span', {
      innerText: fieldOptions.isRequired ? '*' : '',
    });

    if (isCheckbox) {
      labelElement.appendChild(fieldElement);
      labelElement.appendChild(document.createTextNode(fieldOptions.title));
    } else {
      labelElement.appendChild(isRequiredElement);
      labelElement.appendChild(this.#createElement('br'));
      labelElement.appendChild(fieldElement);
    }

    labelElement.appendChild(this.#createElement('br'));
    labelElement.appendChild(errorElement);
    labelElement.appendChild(this.#createElement('br'));

    return labelElement;
  }

  #createInputField(fieldOptions) {
    const inputElement = this.#createElement('input', fieldOptions.attributes);
    this.#addKeypressHandler(inputElement, fieldOptions);

    const errorElement = this.#createElement('span');
    this.#inputElements[fieldOptions.name] = [fieldOptions, inputElement, errorElement];

    return this.#createLabelElement(fieldOptions, inputElement, errorElement);
  }

  #createRadioField(fieldOptions) {
    const wrapperElement = this.#createElement('div');

    const titleElement = this.#createElement('label', {
      innerText: fieldOptions.title,
    });
    titleElement.appendChild(
      this.#createElement('span', {
        innerText: fieldOptions.isRequired ? '*' : '',
      })
    );

    wrapperElement.appendChild(titleElement);
    wrapperElement.appendChild(this.#createElement('br'));

    const innerWrapperElement = this.#createElement('div');

    const errorElement = this.#createElement('span');
    this.#radioElements[fieldOptions.name] = [fieldOptions, [], errorElement];

    for (const value of fieldOptions.values) {
      const radioElement = this.#createElement('input', {
        ...fieldOptions.attributes,
        type: 'radio',
        name: fieldOptions.name,
        value,
      });
      this.#addKeypressHandler(radioElement, fieldOptions);
      this.#radioElements[fieldOptions.name][1].push(radioElement);

      const labelElement = this.#createElement('label');
      labelElement.appendChild(radioElement);
      labelElement.appendChild(document.createTextNode(value));

      innerWrapperElement.appendChild(labelElement);
      innerWrapperElement.appendChild(this.#createElement('br'));
    }

    wrapperElement.appendChild(innerWrapperElement);
    wrapperElement.appendChild(errorElement);
    wrapperElement.appendChild(this.#createElement('br'));

    return wrapperElement;
  }

  #createCheckboxField(fieldOptions) {
    const checkboxElement = this.#createElement('input', {
      ...fieldOptions.attributes,
      type: 'checkbox',
    });
    this.#addKeypressHandler(checkboxElement, fieldOptions);

    const errorElement = this.#createElement('span');
    this.#checkboxElements[fieldOptions.name] = checkboxElement;

    return this.#createLabelElement(fieldOptions, checkboxElement, errorElement);
  }

  #createSelectOptions(fieldOptions) {
    const optionElements = [];

    if (Array.isArray(fieldOptions.values)) {
      for (const value of fieldOptions.values) {
        optionElements.push(
          this.#createElement('option', {
            value,
            innerText: value,
          })
        );
      }

      return optionElements;
    }

    for (const [valuesGroup, values] of Object.entries(fieldOptions.values)) {
      const optgroupElement = this.#createElement('optgroup', {
        label: valuesGroup,
      });

      for (const value of values) {
        optgroupElement.appendChild(
          this.#createElement('option', {
            value,
            innerText: value,
          })
        );
      }

      optionElements.push(optgroupElement);
    }

    return optionElements;
  }

  #createSelectField(fieldOptions) {
    const selectElement = this.#createElement('select', fieldOptions.attributes);
    selectElement.appendChild(
      this.#createElement('option', {
        value: '',
        selected: true,
        disabled: fieldOptions.isRequired,
        hidden: fieldOptions.isRequired,
        innerText: this.#defaultSelectOption,
      })
    );

    for (const optionElement of this.#createSelectOptions(fieldOptions)) {
      selectElement.appendChild(optionElement);
    }

    const errorElement = this.#createElement('span');
    this.#selectElements[fieldOptions.name] = [fieldOptions, selectElement, errorElement];

    return this.#createLabelElement(fieldOptions, selectElement, errorElement);
  }

  #addKeypressHandler(element, options) {
    element.addEventListener('keypress', (event) => {
      event.stopImmediatePropagation();

      if (event.code === 'Enter') {
        event.preventDefault();

        if ([this.#radioKeyword, this.#checkboxKeyword].includes(options.type)) {
          element.checked = !element.checked;
        } else {
          this.#submitButtonElement.focus();
        }
      }
    });
  }

  #checkInputValidity(element, options) {
    if (element.value === '') {
      return !options.isRequired;
    }

    if (options.validationFunctions.length === 0) {
      return !element.validity.typeMismatch;
    }

    for (const validationFunction of options.validationFunctions) {
      if (!validationFunction(element.value)) {
        return false;
      }
    }

    return true;
  }

  #addSubmitHandler(element) {
    element.addEventListener('submit', (event) => {
      event.stopPropagation();
      event.preventDefault();

      const submitData = {};
      let willContinueSubmit = true;
      let elementToFocus = null;

      for (const [fieldName, [fieldOptions, inputElement, errorElement]] of Object.entries(
        this.#inputElements
      )) {
        if (!this.#checkInputValidity(inputElement, fieldOptions)) {
          errorElement.textContent = fieldOptions.errorMessage;
          inputElement.style.border = this.#borderStyle;

          if (!elementToFocus) {
            elementToFocus = inputElement;
          }

          willContinueSubmit = false;
        } else {
          errorElement.textContent = '';
          inputElement.style.border = '';

          submitData[fieldName] = inputElement.value;
        }
      }

      for (const [fieldName, [fieldOptions, radioElements, errorElement]] of Object.entries(
        this.#radioElements
      )) {
        if (fieldOptions.isRequired && !radioElements.find((radio) => radio.checked)) {
          errorElement.textContent = fieldOptions.errorMessage;
          for (const radioElement of radioElements) {
            radioElement.style.outline = this.#borderStyle;
          }

          if (!elementToFocus) {
            elementToFocus = radioElements[0];
          }

          willContinueSubmit = false;
        } else {
          errorElement.textContent = '';
          for (const radioElement of radioElements) {
            radioElement.style.outline = '';
          }

          submitData[fieldName] = radioElements.find((radioElement) => radioElement.checked).value;
        }
      }

      for (const [fieldName, checkboxElement] of Object.entries(this.#checkboxElements)) {
        submitData[fieldName] = checkboxElement.checked;
      }

      for (const [fieldName, [fieldOptions, selectElement, errorElement]] of Object.entries(
        this.#selectElements
      )) {
        if (fieldOptions.isRequired && selectElement.value === '') {
          errorElement.textContent = fieldOptions.errorMessage;
          selectElement.style.border = this.#borderStyle;

          if (!elementToFocus) {
            elementToFocus = selectElement;
          }

          willContinueSubmit = false;
        } else {
          errorElement.textContent = '';
          selectElement.style.border = '';

          submitData[fieldName] = selectElement.value;
        }
      }

      if (!willContinueSubmit) {
        elementToFocus.focus();
        return;
      }

      event.data = submitData;
    });
  }

  render(selector) {
    document.querySelector(selector).appendChild(new GoogleForm(this.#options).#formElement);
  }
}
