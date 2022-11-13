class GoogleForm {
  #options = {};
  #fields = {};

  #INPUT_KEYWORD = 'input';
  #RADIO_KEYWORD = 'radio';
  #CHECKBOX_KEYWORD = 'checkbox';
  #SELECT_KEYWORD = 'select';

  #formElement = this.#createElement('form', { noValidate: true });
  #submitButtonElement = this.#createElement('button', {
    type: 'submit',
    innerText: 'Submit',
  });

  #DEFAULT_INVALID_ERROR = 'Please, input correct data.';
  #DEFAULT_REQUIRED_ERROR = 'Please, enter this field.';
  #DEFAULT_SELECT_OPTION = 'Not selected';

  #BORDER_STYLE_INVALID = '1px solid red';
  #BORDER_STYLE_VALID = '';

  #creationMethods = {
    [this.#INPUT_KEYWORD]: this.#createInputField.bind(this),
    [this.#RADIO_KEYWORD]: this.#createRadioField.bind(this),
    [this.#CHECKBOX_KEYWORD]: this.#createCheckboxField.bind(this),
    [this.#SELECT_KEYWORD]: this.#createSelectField.bind(this),
  };

  #validationMethods = {
    [this.#INPUT_KEYWORD]: this.#validateInputField.bind(this),
    [this.#RADIO_KEYWORD]: this.#validateRadioField.bind(this),
    [this.#SELECT_KEYWORD]: this.#validateSelectField.bind(this),
    [this.#CHECKBOX_KEYWORD]: this.#validateCheckboxField.bind(this),
  };

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

    for (const fieldOptions of options.fields) {
      if (!fieldOptions?.title || !fieldOptions?.name || !fieldOptions?.type) {
        return false;
      }

      if (
        [this.#RADIO_KEYWORD, this.#SELECT_KEYWORD].includes(fieldOptions.type) &&
        !fieldOptions?.values
      ) {
        return false;
      }
    }

    return true;
  }

  #setOptions(options) {
    options.description ??= '';

    for (let i = 0; i < options.fields.length; i++) {
      options.fields[i].isRequired ??= false;
      options.fields[i].validationFunctions ??= [];

      options.fields[i].errorMessage ??=
        options.fields[i].type === this.#INPUT_KEYWORD
          ? this.#DEFAULT_INVALID_ERROR
          : this.#DEFAULT_REQUIRED_ERROR;

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
      fieldsetElement.appendChild(this.#creationMethods[fieldOptions.type](fieldOptions));
    }

    fieldsetElement.appendChild(this.#createElement('br'));
    fieldsetElement.appendChild(this.#submitButtonElement);

    this.#formElement.appendChild(fieldsetElement);
    this.#addSubmitHandler(this.#formElement);
  }

  #createElement(tag, attributes = {}) {
    return Object.assign(document.createElement(tag), attributes);
  }

  #createInputSelectLabelElement(options, element, errorElement) {
    const labelElement = this.#createElement('label', {
      innerText: options.title,
    });

    labelElement.appendChild(
      this.#createElement('span', {
        innerText: options.isRequired ? '*' : '',
      })
    );
    labelElement.appendChild(this.#createElement('br'));
    labelElement.appendChild(element);

    labelElement.appendChild(this.#createElement('br'));
    labelElement.appendChild(errorElement);
    labelElement.appendChild(this.#createElement('br'));

    return labelElement;
  }

  #addKeypressHandler(options, element) {
    element.addEventListener('keypress', (event) => {
      event.stopImmediatePropagation();

      if (event.code === 'Enter') {
        event.preventDefault();

        if ([this.#RADIO_KEYWORD, this.#CHECKBOX_KEYWORD].includes(options.type)) {
          element.checked = !element.checked;
        } else {
          this.#submitButtonElement.focus();
        }
      }
    });
  }

  #createInputField(options) {
    const inputElement = this.#createElement('input', options.attributes);
    this.#addKeypressHandler(options, inputElement);

    const errorElement = this.#createElement('span');

    this.#fields[options.name] = {
      options,
      element: inputElement,
      errorElement,
    };

    return this.#createInputSelectLabelElement(options, inputElement, errorElement);
  }

  #createRadioField(options) {
    const containerElement = this.#createElement('div');

    const titleElement = this.#createElement('label', {
      innerText: options.title,
    });
    titleElement.appendChild(
      this.#createElement('span', {
        innerText: options.isRequired ? '*' : '',
      })
    );

    containerElement.appendChild(titleElement);
    containerElement.appendChild(this.#createElement('br'));

    const radiosContainerElement = this.#createElement('div');

    const errorElement = this.#createElement('span');

    this.#fields[options.name] = { options, elements: [], errorElement };

    for (const value of options.values) {
      const radioElement = this.#createElement('input', {
        ...options.attributes,
        type: 'radio',
        name: options.name,
        value,
      });
      this.#addKeypressHandler(options, radioElement);

      this.#fields[options.name].elements.push(radioElement);

      const labelElement = this.#createElement('label');
      labelElement.appendChild(radioElement);
      labelElement.appendChild(document.createTextNode(value));

      radiosContainerElement.appendChild(labelElement);
      radiosContainerElement.appendChild(this.#createElement('br'));
    }

    containerElement.appendChild(radiosContainerElement);
    containerElement.appendChild(errorElement);
    containerElement.appendChild(this.#createElement('br'));

    return containerElement;
  }

  #createCheckboxField(options) {
    const checkboxElement = this.#createElement('input', {
      ...options.attributes,
      type: 'checkbox',
    });
    this.#addKeypressHandler(options, checkboxElement);

    this.#fields[options.name] = { options, element: checkboxElement };

    const labelElement = this.#createElement('label');

    labelElement.appendChild(checkboxElement);
    labelElement.appendChild(document.createTextNode(options.title));

    labelElement.appendChild(this.#createElement('br'));
    labelElement.appendChild(this.#createElement('br'));

    return labelElement;
  }

  #createSelectOptions(options) {
    if (Array.isArray(options.values)) {
      const optionElements = [];

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

    const optgroupElements = [];

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

      optgroupElements.push(optgroupElement);
    }

    return optgroupElements;
  }

  #createSelectField(options) {
    const selectElement = this.#createElement('select', options.attributes);
    selectElement.appendChild(
      this.#createElement('option', {
        value: '',
        selected: true,
        disabled: options.isRequired,
        hidden: options.isRequired,
        innerText: this.#DEFAULT_SELECT_OPTION,
      })
    );

    for (const optElement of this.#createSelectOptions(options)) {
      selectElement.appendChild(optElement);
    }

    const errorElement = this.#createElement('span');

    this.#fields[options.name] = {
      options,
      element: selectElement,
      errorElement,
    };

    return this.#createInputSelectLabelElement(options, selectElement, errorElement);
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

  #generateValidationData(isValid, data) {
    return { isValid, data };
  }

  #validateInputField({ options, element, errorElement }) {
    if (!this.#checkInputValidity(options, element)) {
      errorElement.textContent = options.errorMessage;
      element.style.border = this.#BORDER_STYLE_INVALID;

      return this.#generateValidationData(false, element);
    }

    errorElement.textContent = '';
    element.style.border = this.#BORDER_STYLE_VALID;

    return this.#generateValidationData(true, element.value);
  }

  #validateRadioField({ options, elements, errorElement }) {
    if (options.isRequired && !elements.find((element) => element.checked)) {
      errorElement.textContent = options.errorMessage;
      for (const element of elements) {
        element.style.outline = this.#BORDER_STYLE_INVALID;
      }

      return this.#generateValidationData(false, elements[0]);
    }

    errorElement.textContent = '';
    for (const element of elements) {
      element.style.outline = this.#BORDER_STYLE_VALID;
    }

    return this.#generateValidationData(true, elements.find((element) => element.checked).value);
  }

  #validateCheckboxField({ element }) {
    return this.#generateValidationData(true, element.checked);
  }

  #validateSelectField({ options, element, errorElement }) {
    if (options.isRequired && element.value === '') {
      errorElement.textContent = options.errorMessage;
      element.style.border = this.#BORDER_STYLE_INVALID;

      return this.#generateValidationData(false, element);
    }

    errorElement.textContent = '';
    element.style.border = this.#BORDER_STYLE_VALID;

    return this.#generateValidationData(true, element.value);
  }

  #addSubmitHandler(element) {
    element.addEventListener('submit', (event) => {
      event.stopPropagation();
      event.preventDefault();

      let elementToFocus = null;
      let willContinueSubmit = true;
      const submitData = {};

      for (const [name, field] of Object.entries(this.#fields)) {
        const validationData = this.#validationMethods[field.options.type](field);

        if (!validationData.isValid) {
          elementToFocus ??= validationData.data;
          willContinueSubmit = false;
          continue;
        }

        submitData[name] = validationData.data;
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
