class GoogleForm {
  constructor(options) {
    if (!this.#checkOptions(options)) {
      throw new TypeError(this.#TYPE_ERROR_MESSAGE);
    }
    this.#setOptions(options);
  }

  #TYPE_ERROR_MESSAGE = 'The options argument is not valid. Read the documentation on this class.';

  #options = {};

  #callback = () => {};
  #isSubmitting = false;

  #INPUT_NAME = {
    default: 'input',
    radio: 'radio',
    checkbox: 'checkbox',
    select: 'select',
  };

  #SUBMIT_KEYWORD = 'submit';

  #DEFAULT_INVALID_ERROR = 'Please, input correct data.';
  #DEFAULT_REQUIRED_ERROR = 'Please, enter this field.';
  #DEFAULT_SELECT_OPTION = 'Not selected';

  #BORDER_STYLE_INVALID = '1px solid red';
  #BORDER_STYLE_VALID = '';

  #creationMethods = {
    [this.#INPUT_NAME.default]: this.#createInputField.bind(this),
    [this.#INPUT_NAME.radio]: this.#createRadioField.bind(this),
    [this.#INPUT_NAME.checkbox]: this.#createCheckboxField.bind(this),
    [this.#INPUT_NAME.select]: this.#createSelectField.bind(this),
  };

  #validationMethods = {
    [this.#INPUT_NAME.default]: this.#validateInputField.bind(this),
    [this.#INPUT_NAME.radio]: this.#validateRadioField.bind(this),
    [this.#INPUT_NAME.select]: this.#validateSelectField.bind(this),
    [this.#INPUT_NAME.checkbox]: this.#validateCheckboxField.bind(this),
  };

  #checkOptions(options) {
    if (!options?.title || !(options?.fields && Array.isArray(options.fields))) {
      return false;
    }

    for (const fieldOptions of options.fields) {
      if (!fieldOptions?.title || !fieldOptions?.name || !fieldOptions?.type) {
        return false;
      }

      if (
        [this.#INPUT_NAME.radio, this.#INPUT_NAME.select].includes(fieldOptions.type) &&
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
        options.fields[i].type === this.#INPUT_NAME.default
          ? this.#DEFAULT_INVALID_ERROR
          : this.#DEFAULT_REQUIRED_ERROR;

      options.fields[i].attributes ??= {};
    }

    this.#options = options;
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

  #generateCreationData(fieldElement, field) {
    return { fieldElement, field };
  }

  #createInputField(options) {
    const inputElement = this.#createElement('input', options.attributes);

    const errorElement = this.#createElement('span');

    return this.#generateCreationData(
      this.#createInputSelectLabelElement(options, inputElement, errorElement),
      { options, element: inputElement, errorElement }
    );
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

    const radioField = { options, elements: [], errorElement };

    for (const value of options.values) {
      const radioElement = this.#createElement('input', {
        ...options.attributes,
        type: 'radio',
        name: options.name,
        value,
      });

      radioField.elements.push(radioElement);

      const labelElement = this.#createElement('label');
      labelElement.appendChild(radioElement);
      labelElement.appendChild(document.createTextNode(value));

      radiosContainerElement.appendChild(labelElement);
      radiosContainerElement.appendChild(this.#createElement('br'));
    }

    containerElement.appendChild(radiosContainerElement);
    containerElement.appendChild(errorElement);
    containerElement.appendChild(this.#createElement('br'));

    return this.#generateCreationData(containerElement, radioField);
  }

  #createCheckboxField(options) {
    const checkboxElement = this.#createElement('input', {
      ...options.attributes,
      type: 'checkbox',
    });

    const labelElement = this.#createElement('label');

    labelElement.appendChild(checkboxElement);
    labelElement.appendChild(document.createTextNode(options.title));

    labelElement.appendChild(this.#createElement('br'));
    labelElement.appendChild(this.#createElement('br'));

    return this.#generateCreationData(labelElement, { options, element: checkboxElement });
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

    return this.#generateCreationData(
      this.#createInputSelectLabelElement(options, selectElement, errorElement),
      { options, element: selectElement, errorElement }
    );
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

  #toggleIsSubmitting() {
    this.#isSubmitting = !this.#isSubmitting;
  }

  async #submit(data, submitButtonElement) {
    if (this.#isSubmitting) {
      return;
    }

    this.#toggleIsSubmitting();
    submitButtonElement.removeChild(submitButtonElement.lastChild);
    submitButtonElement.appendChild(document.createTextNode('Loading...'));

    await this.#callback(data);

    submitButtonElement.removeChild(submitButtonElement.lastChild);
    submitButtonElement.appendChild(document.createTextNode('Submit'));
    this.#toggleIsSubmitting();
  }

  #addSubmitHandler(formElement, submitButtonElement, fields) {
    formElement.addEventListener('submit', (event) => {
      event.stopPropagation();
      event.preventDefault();

      let elementToFocus = null;
      let willContinueSubmit = true;
      const submitData = {};

      for (const [name, field] of Object.entries(fields)) {
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

      this.#submit(submitData, submitButtonElement);
    });
  }

  #addKeypressHandler(formElement, submitButtonElement) {
    formElement.addEventListener('keypress', (event) => {
      event.stopImmediatePropagation();

      if (event.code === 'Enter') {
        event.preventDefault();

        if (
          [this.#INPUT_NAME.radio, this.#INPUT_NAME.checkbox].includes(
            event.target.getAttribute('type')
          )
        ) {
          event.target.checked = !event.target.checked;
          return;
        }

        if (event.target.tagName.toLowerCase() === this.#INPUT_NAME.default) {
          submitButtonElement.focus();
          return;
        }

        if (event.target.getAttribute('type') === this.#SUBMIT_KEYWORD) {
          formElement.requestSubmit();
        }
      }
    });
  }

  #createForm() {
    const fieldsetElement = this.#createElement('fieldset');
    fieldsetElement.appendChild(this.#createElement('legend', { innerText: this.#options.title }));

    if (this.#options.description) {
      fieldsetElement.appendChild(
        this.#createElement('p', { innerText: this.#options.description })
      );
    }

    const fields = {};

    for (const fieldOptions of this.#options.fields) {
      const { fieldElement, field } = this.#creationMethods[fieldOptions.type](fieldOptions);

      fieldsetElement.appendChild(fieldElement);
      fields[field.options.name] = field;
    }

    fieldsetElement.appendChild(this.#createElement('br'));

    const submitButtonElement = this.#createElement('button', {
      type: 'submit',
      innerText: 'Submit',
    });
    fieldsetElement.appendChild(submitButtonElement);

    const formElement = this.#createElement('form', { noValidate: true });
    formElement.appendChild(fieldsetElement);

    this.#addSubmitHandler(formElement, submitButtonElement, fields);
    this.#addKeypressHandler(formElement, submitButtonElement);

    return formElement;
  }

  render(selector) {
    document.querySelector(selector).appendChild(this.#createForm());
  }

  #setCallback(callback) {
    this.#callback = callback;
  }

  onSubmit(callback) {
    this.#setCallback(callback);
  }
}
