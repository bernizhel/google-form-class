class GoogleForm {
  #options = {};
  #fields = {};

  #inputKeyword = 'input';
  #radioKeyword = 'radio';
  #checkboxKeyword = 'checkbox';
  #selectKeyword = 'select';

  #formElement = this.#createElement('form', { noValidate: true });
  #submitButtonElement = this.#createElement('button', {
    type: 'submit',
    innerText: 'Submit',
  });

  #defaultInvalidError = 'Please, input correct data.';
  #defaultRequiredError = 'Please, enter this field.';
  #defaultSelectOption = 'Not selected';

  #borderStyleInvalid = '1px solid red';
  #borderStyleValid = '';

  #creationMethods = {
    [this.#inputKeyword]: this.#createInputField.bind(this),
    [this.#radioKeyword]: this.#createRadioField.bind(this),
    [this.#checkboxKeyword]: this.#createCheckboxField.bind(this),
    [this.#selectKeyword]: this.#createSelectField.bind(this),
  };

  #validationMethods = {
    [this.#inputKeyword]: this.#validateInputField.bind(this),
    [this.#radioKeyword]: this.#validateRadioField.bind(this),
    [this.#selectKeyword]: this.#validateSelectField.bind(this),
    [this.#checkboxKeyword]: this.#validateCheckboxField.bind(this),
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
        [this.#radioKeyword, this.#selectKeyword].includes(fieldOptions.type) &&
        !fieldOptions?.values
      ) {
        return false;
      }
    }

    return true;
  }

  #setOptions(options) {
    options.description ??= {};

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
      fieldsetElement.appendChild(this.#creationMethods[fieldOptions.type](fieldOptions));
    }

    fieldsetElement.appendChild(this.#createElement('br'));
    fieldsetElement.appendChild(this.#submitButtonElement);

    this.#formElement.appendChild(fieldsetElement);
    this.#addSubmitHanlder(this.#formElement);
  }

  #createElement(tag, attributes = {}) {
    return Object.assign(document.createElement(tag), attributes);
  }

  #createLabelElement(options, element, errorElement) {
    let labelElement = null;

    if (options.type === this.#checkboxKeyword) {
      labelElement = this.#createElement('label');

      labelElement.appendChild(element);
      labelElement.appendChild(document.createTextNode(options.title));
    } else {
      labelElement = this.#createElement('label', {
        innerText: options.title,
      });

      labelElement.appendChild(
        this.#createElement('span', {
          innerText: options.isRequired ? '*' : '',
        })
      );
      labelElement.appendChild(this.#createElement('br'));
      labelElement.appendChild(element);
    }

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

        if ([this.#radioKeyword, this.#checkboxKeyword].includes(options.type)) {
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

    return this.#createLabelElement(options, inputElement, errorElement);
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

    const errorElement = this.#createElement('span');

    this.#fields[options.name] = { options, element: checkboxElement };

    return this.#createLabelElement(options, checkboxElement, errorElement);
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
        innerText: this.#defaultSelectOption,
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

    return this.#createLabelElement(options, selectElement, errorElement);
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
      element.style.border = this.#borderStyleInvalid;

      return this.#generateValidationData(false, element);
    }

    errorElement.textContent = '';
    element.style.border = this.#borderStyleValid;

    return this.#generateValidationData(true, element.value);
  }

  #validateRadioField({ options, elements, errorElement }) {
    if (options.isRequired && !elements.find((element) => element.checked)) {
      errorElement.textContent = options.errorMessage;
      for (const element of elements) {
        element.style.outline = this.#borderStyleInvalid;
      }

      return this.#generateValidationData(false, elements[0]);
    }

    errorElement.textContent = '';
    for (const element of elements) {
      element.style.outline = this.#borderStyleValid;
    }

    return this.#generateValidationData(true, elements.find((element) => element.checked).value);
  }

  #validateCheckboxField({ element }) {
    return this.#generateValidationData(true, element.value);
  }

  #validateSelectField({ options, element, errorElement }) {
    if (options.isRequired && element.value === '') {
      errorElement.textContent = options.errorMessage;
      element.style.border = this.#borderStyleInvalid;

      return this.#generateValidationData(false, element);
    }

    errorElement.textContent = '';
    element.style.border = this.#borderStyleValid;

    return this.#generateValidationData(true, element.value);
  }

  #addSubmitHanlder(element) {
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
