class GoogleForm {
  constructor(options) {
    if (!this.#checkOptions(options)) {
      throw new TypeError(this.#TYPE_ERROR_MESSAGE);
    }
    this.#setOptions(options);
  }

  #TYPE_ERROR_MESSAGE = 'The options argument is not valid. Read the documentation on this class.';

  #SUBMIT_KEYWORD = 'submit';

  #options = {};

  #callback = () => {};
  #isSubmitting = false;

  #DEFAULT_SELECT_OPTION = 'Not selected';

  #INPUT_NAME = {
    default: 'input',
    radio: 'radio',
    checkbox: 'checkbox',
    select: 'select',
  };

  #DEFAULT_ERRORS = {
    invalid: 'Please, input correct data.',
    required: 'Please, enter this field.',
  };

  #STYLE_CLASSES = {
    title: '',
    description: '',
    fieldset: '',
    form: '',
    submitButton: '',
    error: '',
    fieldErrorDefault: '',
    fieldErrorRadio: '',
    fieldTitle: '',
    fieldDefault: '',
    fieldRadio: '',
    fieldRadioContainer: '',
    fieldRadioLabel: '',
    fieldCheckbox: '',
    fieldSelect: '',
  };

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

    options.defaultErrors ??= {};
    for (const [errorType, errorMessage] of Object.entries(options.defaultErrors)) {
      this.#DEFAULT_ERRORS[errorType] = errorMessage;
    }

    options.styleClasses ??= {};
    for (const [classType, classNames] of Object.entries(options.styleClasses)) {
      this.#STYLE_CLASSES[classType] = classNames.join(' ');
    }

    options.defaultSelectOption ??= '';
    if (options.defaultSelectOption !== '') {
      this.#DEFAULT_SELECT_OPTION = options.defaultSelectOption;
    }

    for (const fieldOptions of options.fields) {
      fieldOptions.isRequired ??= false;
      fieldOptions.validationFunctions ??= [];

      fieldOptions.errorMessage ??=
        fieldOptions.type === this.#INPUT_NAME.default
          ? this.#DEFAULT_ERRORS.invalid
          : this.#DEFAULT_ERRORS.required;

      fieldOptions.attributes ??= {};
    }

    this.#options = options;
  }

  #createElement(tag, attributes = {}) {
    return Object.assign(document.createElement(tag), attributes);
  }

  #createInputSelectLabelElement(options, element, errorElement) {
    const titleElement = this.#createElement('span', {
      classList: this.#STYLE_CLASSES.fieldTitle,
      innerText: options.title,
    });

    titleElement.appendChild(
      this.#createElement('span', {
        innerText: options.isRequired ? '*' : '',
      })
    );

    const labelElement = this.#createElement('label');
    labelElement.appendChild(titleElement);

    labelElement.appendChild(this.#createElement('br'));
    labelElement.appendChild(element);

    labelElement.appendChild(this.#createElement('br'));
    labelElement.appendChild(errorElement);
    labelElement.appendChild(this.#createElement('br'));

    return labelElement;
  }

  #createInputField(options) {
    const inputElement = this.#createElement('input', {
      ...options.attributes,
      classList: this.#STYLE_CLASSES.fieldDefault,
    });

    const errorElement = this.#createElement('span', {
      classList: this.#STYLE_CLASSES.error,
    });

    const labelElement = this.#createInputSelectLabelElement(options, inputElement, errorElement);

    return {
      fieldElement: labelElement,
      field: { options, element: inputElement, errorElement },
    };
  }

  #createRadioField(options) {
    const containerElement = this.#createElement('div');

    const titleElement = this.#createElement('label', {
      classList: this.#STYLE_CLASSES.fieldTitle,
      innerText: options.title,
    });
    titleElement.appendChild(
      this.#createElement('span', {
        innerText: options.isRequired ? '*' : '',
      })
    );

    containerElement.appendChild(titleElement);
    containerElement.appendChild(this.#createElement('br'));

    const radiosContainerElement = this.#createElement('div', {
      classList: this.#STYLE_CLASSES.fieldRadioContainer,
    });

    const errorElement = this.#createElement('span', {
      classList: this.#STYLE_CLASSES.error,
    });

    const radioField = { options, elements: [], errorElement };

    for (const value of options.values) {
      const radioElement = this.#createElement('input', {
        ...options.attributes,
        classList: this.#STYLE_CLASSES.fieldRadio,
        type: 'radio',
        name: options.name,
        value,
      });

      radioField.elements.push(radioElement);

      const labelElement = this.#createElement('label', {
        classList: this.#STYLE_CLASSES.fieldRadioLabel,
      });
      labelElement.appendChild(radioElement);
      labelElement.appendChild(document.createTextNode(value));

      radiosContainerElement.appendChild(labelElement);
      radiosContainerElement.appendChild(this.#createElement('br'));
    }

    containerElement.appendChild(radiosContainerElement);
    containerElement.appendChild(errorElement);
    containerElement.appendChild(this.#createElement('br'));

    return {
      fieldElement: containerElement,
      field: radioField,
    };
  }

  #createCheckboxField(options) {
    const checkboxElement = this.#createElement('input', {
      ...options.attributes,
      classList: this.#STYLE_CLASSES.fieldCheckbox,
      type: 'checkbox',
    });

    const titleElement = this.#createElement('span', {
      classList: this.#STYLE_CLASSES.fieldTitle,
    });

    const labelElement = this.#createElement('label', {
      classList: this.#STYLE_CLASSES.fieldTitle,
    });
    labelElement.appendChild(titleElement);

    labelElement.appendChild(checkboxElement);
    labelElement.appendChild(document.createTextNode(options.title));

    labelElement.appendChild(this.#createElement('br'));
    labelElement.appendChild(this.#createElement('br'));

    return {
      fieldElement: labelElement,
      field: { options, element: checkboxElement },
    };
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
    const selectElement = this.#createElement('select', {
      ...options.attributes,
      classList: this.#STYLE_CLASSES.fieldSelect,
    });
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

    const errorElement = this.#createElement('span', {
      classList: this.#STYLE_CLASSES.error,
    });

    const labelElement = this.#createInputSelectLabelElement(options, selectElement, errorElement);

    return {
      fieldElement: labelElement,
      field: { options, element: selectElement, errorElement },
    };
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

  #validateInputField({ options, element, errorElement }) {
    if (!this.#checkInputValidity(options, element)) {
      errorElement.textContent = options.errorMessage;
      element.classList.add(this.#STYLE_CLASSES.fieldErrorDefault);

      return { isValid: false, element };
    }

    errorElement.textContent = '';
    element.classList.remove(this.#STYLE_CLASSES.fieldErrorDefault);

    return { isValid: true, value: element.value };
  }

  #validateRadioField({ options, elements, errorElement }) {
    if (options.isRequired && !elements.find((element) => element.checked)) {
      errorElement.textContent = options.errorMessage;
      for (const element of elements) {
        element.classList.add(this.#STYLE_CLASSES.fieldErrorRadio);
      }

      return { isValid: false, element: elements[0] };
    }

    errorElement.textContent = '';
    for (const element of elements) {
      element.classList.remove(this.#STYLE_CLASSES.fieldErrorRadio);
    }

    return { isValid: true, value: elements.find((element) => element.checked).value };
  }

  #validateCheckboxField({ element }) {
    return { isValid: true, value: element.checked };
  }

  #validateSelectField({ options, element, errorElement }) {
    if (options.isRequired && element.value === '') {
      errorElement.textContent = options.errorMessage;
      element.classList.add(this.#STYLE_CLASSES.fieldErrorDefault);

      return { isValid: false, element: element };
    }

    errorElement.textContent = '';
    element.classList.remove(this.#STYLE_CLASSES.fieldErrorDefault);

    return { isValid: true, value: element.value };
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
          elementToFocus ??= validationData.element;
          willContinueSubmit = false;
          continue;
        }

        submitData[name] = validationData.value;
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
    const fieldsetElement = this.#createElement('fieldset', {
      classList: this.#STYLE_CLASSES.fieldset,
    });
    fieldsetElement.appendChild(
      this.#createElement('legend', {
        classList: this.#STYLE_CLASSES.title,
        innerText: this.#options.title,
      })
    );

    if (this.#options.description !== '') {
      fieldsetElement.appendChild(
        this.#createElement('p', {
          classList: this.#STYLE_CLASSES.description,
          innerText: this.#options.description,
        })
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
      classList: this.#STYLE_CLASSES.submitButton,
      type: 'submit',
      innerText: 'Submit',
    });
    fieldsetElement.appendChild(submitButtonElement);

    const formElement = this.#createElement('form', {
      classList: this.#STYLE_CLASSES.form,
      noValidate: true,
    });
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
