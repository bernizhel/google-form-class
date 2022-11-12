class GoogleForm {
  #options = {};
  #fields = {};

  #formElement = this.#createElement('form', { noValidate: true });
  #submitButtonElement = this.#createElement('button', {
    type: 'submit',
    innerText: 'Submit',
  });

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
    this.#addSubmitHanlder(this.#formElement);
  }

  #createElement(tagName, attributes = {}) {
    return Object.assign(document.createElement(tagName), attributes);
  }

  #createLabelElement(options, element, errorElement) {
    const isCheckbox = options.type === this.#checkboxKeyword;

    let labelElement = null;
    if (isCheckbox) {
      labelElement = this.#createElement('label');
    } else {
      labelElement = this.#createElement('label', {
        innerText: options.title,
      });
    }

    const isRequiredElement = this.#createElement('span', {
      innerText: options.isRequired ? '*' : '',
    });

    if (isCheckbox) {
      labelElement.appendChild(element);
      labelElement.appendChild(document.createTextNode(options.title));
    } else {
      labelElement.appendChild(isRequiredElement);
      labelElement.appendChild(this.#createElement('br'));
      labelElement.appendChild(element);
    }

    labelElement.appendChild(this.#createElement('br'));
    labelElement.appendChild(errorElement);
    labelElement.appendChild(this.#createElement('br'));

    return labelElement;
  }

  #createInputField(options) {
    const inputElement = this.#createElement('input', options.attributes);
    this.#addKeypressHandler(options, inputElement);

    const errorElement = this.#createElement('span');
    this.#fields[options.name] = [options.type, options, inputElement, errorElement];

    return this.#createLabelElement(options, inputElement, errorElement);
  }

  #createRadioField(options) {
    const wrapperElement = this.#createElement('div');

    const titleElement = this.#createElement('label', {
      innerText: options.title,
    });
    titleElement.appendChild(
      this.#createElement('span', {
        innerText: options.isRequired ? '*' : '',
      })
    );

    wrapperElement.appendChild(titleElement);
    wrapperElement.appendChild(this.#createElement('br'));

    const innerWrapperElement = this.#createElement('div');

    const errorElement = this.#createElement('span');
    this.#fields[options.name] = [options.type, options, [], errorElement];

    for (const value of options.values) {
      const radioElement = this.#createElement('input', {
        ...options.attributes,
        type: 'radio',
        name: options.name,
        value,
      });

      this.#addKeypressHandler(options, radioElement);
      this.#fields[options.name][2].push(radioElement);

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

  #createCheckboxField(options) {
    const checkboxElement = this.#createElement('input', {
      ...options.attributes,
      type: 'checkbox',
    });
    this.#addKeypressHandler(options, checkboxElement);

    const errorElement = this.#createElement('span');
    this.#fields[options.name] = [options.type, checkboxElement];

    return this.#createLabelElement(options, checkboxElement, errorElement);
  }

  #createSelectOptions(options) {
    const optionElements = [];

    if (Array.isArray(options.values)) {
      for (const value of options.values) {
        optionElements.push(
          this.#createElement('option', {
            value,
            innerText: value,
          })
        );
      }

      return optionElements;
    }

    for (const [valuesGroup, values] of Object.entries(options.values)) {
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

  #createSelectField(options) {
    const selectElement = this.#createElement('select', options.attributes);
    selectElement.appendChild(
      this.#createElement('option', {
        value: '',
        selected: true,
        disabled: options.isRequired,
        hidden: options.isRequired,
        innerText: this.#defaultSelectOption,
      })
    );

    for (const optionElement of this.#createSelectOptions(options)) {
      selectElement.appendChild(optionElement);
    }

    const errorElement = this.#createElement('span');
    this.#fields[options.name] = [options.type, options, selectElement, errorElement];

    return this.#createLabelElement(options, selectElement, errorElement);
  }

  #addKeypressHandler(options, element) {
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

  #checkInputValidity(options, element) {
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

  #validateInputField(options, element, errorElement) {
    if (!this.#checkInputValidity(options, element)) {
      errorElement.textContent = options.errorMessage;
      element.style.border = this.#borderStyle;

      return { isValid: false, element };
    }

    errorElement.textContent = '';
    element.style.border = '';

    return { isValid: true, value: element.value };
  }

  #validateRadioField(options, elements, errorElement) {
    if (options.isRequired && !elements.find((element) => element.checked)) {
      errorElement.textContent = options.errorMessage;
      for (const element of elements) {
        element.style.outline = this.#borderStyle;
      }

      return { isValid: false, element: elements[0] };
    }

    errorElement.textContent = '';
    for (const element of elements) {
      element.style.outline = '';
    }

    return { isValid: true, value: elements.find((element) => element.checked).value };
  }

  #validateCheckboxField(element) {
    return { isValid: true, value: element.checked };
  }

  #validateSelectField(options, element, errorElement) {
    if (options.isRequired && element.value === '') {
      errorElement.textContent = options.errorMessage;
      element.style.border = this.#borderStyle;

      return { isValid: false, element };
    }

    errorElement.textContent = '';
    element.style.border = '';

    return { isValid: true, value: element.value };
  }

  #validationMethods = {
    [this.#inputKeyword]: this.#validateInputField.bind(this),
    [this.#radioKeyword]: this.#validateRadioField.bind(this),
    [this.#selectKeyword]: this.#validateSelectField.bind(this),
    [this.#checkboxKeyword]: this.#validateCheckboxField.bind(this),
  };

  #addSubmitHanlder(element) {
    element.addEventListener('submit', (event) => {
      event.stopPropagation();
      event.preventDefault();

      const submitData = {};
      let willContinueSubmit = true;
      let elementToFocus = null;

      for (const [name, field] of Object.entries(this.#fields)) {
        const returnData = this.#validationMethods[field[0]](...field.slice(1));

        if (!returnData.isValid) {
          elementToFocus ??= returnData.element;
          willContinueSubmit = false;
          continue;
        }

        submitData[name] = returnData.value;
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
