class GoogleForm {
  #formElement = {};
  #submitButtonElement = {};
  #inputElements = [];
  #checkboxElements = [];
  #radioElements = [];
  #selectElements = [];
  #defaultRequiredError = 'Please, enter this field.';
  #defaultInvalidError = 'Please, input correct data.';
  #defaultSelectOption = 'Not selected';

  constructor(options) {
    this.#checkOptions(options);
    this.#initializeForm(options);
  }

  #initializeForm(options) {
    const fieldsetElement = this.#createElement('fieldset');
    fieldsetElement.appendChild(
      this.#createElement('legend', {innerText: options.title}));
    if (options.description) {
      fieldsetElement.appendChild(
        this.#createElement('p', {innerText: options.description}));
    }
    this.#submitButtonElement = this.#createElement('button', {
      type: 'submit',
      innerText: 'Submit',
    });
    for (const fieldOptions of options.fields) {
      if (fieldOptions.type.keyword === 'radio') {
        fieldsetElement.appendChild(this.#createRadioField(fieldOptions));
      }
      if (fieldOptions.type.keyword === 'checkbox') {
        fieldsetElement.appendChild(this.#createCheckboxField(fieldOptions));
      }
      if (fieldOptions.type.keyword === 'select') {
        fieldsetElement.appendChild(this.#createSelectField(fieldOptions));
      }
      if (fieldOptions.type.keyword === 'input') {
        fieldsetElement.appendChild(this.#createInputField(fieldOptions));
      }
    }
    fieldsetElement.appendChild(this.#createElement('br'));
    fieldsetElement.appendChild(this.#submitButtonElement);
    const formElement = this.#createElement('form');
    formElement.appendChild(fieldsetElement);
    this.#addSubmitHandler(formElement);
    this.#formElement = formElement;
  }

  #checkOptions(options) {
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
  }


  #createElement(tagName, options) {
    return Object.assign(document.createElement(tagName), options);
  }

  #createRadioField(fieldOptions) {
    const wrapperElement = this.#createElement('div');
    const titleElement = this.#createElement('span', {
      innerText: fieldOptions.title,
    });
    titleElement.appendChild(this.#createElement('span', {
      innerText: fieldOptions.isRequired ? '*' : '',
    }));
    wrapperElement.appendChild(titleElement);
    wrapperElement.appendChild(this.#createElement('br'));
    const innerWrapperElement = this.#createElement('div');
    const errorElement = this.#createElement('span');
    this.#radioElements.push([
      fieldOptions,
      [],
      errorElement,
    ]);
    for (const value of fieldOptions.type.values) {
      const labelElement = this.#createElement('label');
      const radioElement = this.#createElement('input', {
        ...(
          fieldOptions.attributes || {}
        ),
        type: 'radio',
        name: fieldOptions.name,
        value,
      });
      this.#addKeypressHandler(radioElement, fieldOptions);
      labelElement.appendChild(radioElement);
      this.#radioElements[this.#radioElements.length - 1][1].push(radioElement);
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
    const labelElement = this.#createElement('label');
    const checkboxElement = this.#createElement('input', {
      ...(
        fieldOptions.attributes || {}
      ),
      type: 'checkbox',
    });
    this.#addKeypressHandler(checkboxElement, fieldOptions);
    labelElement.appendChild(checkboxElement);
    labelElement.appendChild(document.createTextNode(fieldOptions.title));
    labelElement.appendChild(this.#createElement('span', {
      innerText: fieldOptions.isRequired ? '*' : '',
    }));
    const errorElement = this.#createElement('span');
    this.#checkboxElements.push([
      fieldOptions,
      checkboxElement,
      errorElement,
    ]);
    labelElement.appendChild(this.#createElement('br'));
    labelElement.appendChild(errorElement);
    labelElement.appendChild(this.#createElement('br'));
    return labelElement;
  }

  #createInputField(fieldOptions) {
    const labelElement = this.#createElement(
      'label', {innerText: fieldOptions.title});
    labelElement.appendChild(this.#createElement('span', {
      innerText: fieldOptions.isRequired ? '*' : '',
    }));
    labelElement.appendChild(this.#createElement('br'));
    const inputElement = this.#createElement(
      'input', fieldOptions.attributes || {});
    this.#addKeypressHandler(inputElement, fieldOptions);
    labelElement.appendChild(inputElement);
    const errorElement = this.#createElement('span');
    this.#inputElements.push([
      fieldOptions,
      inputElement,
      errorElement,
    ]);
    labelElement.appendChild(this.#createElement('br'));
    labelElement.appendChild(errorElement);
    labelElement.appendChild(this.#createElement('br'));
    return labelElement;
  }

  #createSelectField(fieldOptions) {
    const labelElement = this.#createElement(
      'label', {innerText: fieldOptions.title});
    labelElement.appendChild(this.#createElement('span', {
      innerText: fieldOptions.isRequired ? '*' : '',
    }));
    labelElement.appendChild(this.#createElement('br'));
    const selectElement = this.#createElement(
      'select', fieldOptions.attributes || {});
    selectElement.appendChild(this.#createElement('option', {
      value: '',
      selected: true,
      disabled: !!fieldOptions.isRequired,
      hidden: !!fieldOptions.isRequired,
      innerText: this.#defaultSelectOption,
    }));
    if (Array.isArray(fieldOptions.type.values)) {
      for (const value of fieldOptions.type.values || []) {
        selectElement.appendChild(this.#createElement('option', {
          value,
          innerText: value,
        }));
      }
    } else {
      for (const [valuesGroup, values] of
      Object.entries(fieldOptions.type.values) || []) {
        const optgroupElement = this.#createElement('optgroup', {
          label: valuesGroup,
        });
        for (const value of values) {
          optgroupElement.appendChild(this.#createElement('option', {
            value,
            innerText: value,
          }));
        }
        selectElement.appendChild(optgroupElement);
      }
    }
    labelElement.appendChild(selectElement);
    const errorElement = this.#createElement('span');
    this.#selectElements.push([
      fieldOptions,
      selectElement,
      errorElement,
    ]);
    labelElement.appendChild(this.#createElement('br'));
    labelElement.appendChild(errorElement);
    labelElement.appendChild(this.#createElement('br'));
    return labelElement;
  }

  #addKeypressHandler(fieldElement, fieldOptions) {
    fieldElement.addEventListener('keypress', (event) => {
      event.stopImmediatePropagation();
      if (event.code === 'Enter') {
        event.preventDefault();
        if (['radio', 'checkbox'].includes(fieldOptions.type.keyword)) {
          fieldElement.checked = !fieldElement.checked;
        } else {
          this.#submitButtonElement.focus();
        }
      }
    });
  }

  #addSubmitHandler(formElement) {
    formElement
      .addEventListener('submit', (event) => {
        event.stopPropagation();
        event.preventDefault();
        const submitData = {};
        let willContinueSubmit = true;
        for (const [fieldOptions, inputElement, errorElement] of
          this.#inputElements) {
          if ((
            fieldOptions?.isRequired && inputElement.value === ''
          ) || (
            fieldOptions?.isRequired || inputElement.value !== ''
          ) && !fieldOptions
            ?.validationFunctions
            ?.reduce(
              (acc, nextFunc) => acc * nextFunc(inputElement.value), true)) {
            errorElement.textContent =
              fieldOptions?.errorMessage ?? this.#defaultInvalidError;
            willContinueSubmit = false;
          } else {
            errorElement.textContent = '';
            submitData[fieldOptions.name] = inputElement.value;
          }
        }

        for (const [fieldOptions, radioElements, errorElement] of
          this.#radioElements) {
          if (fieldOptions?.isRequired &&
            !radioElements.reduce(
              (acc, nextRadio) => acc + nextRadio.checked,
              false,
            )) {
            errorElement.textContent =
              fieldOptions?.errorMessage || this.#defaultRequiredError;
            willContinueSubmit = false;
          } else {
            errorElement.textContent = '';
            submitData[fieldOptions.name] =
              radioElements.find((radioElement) => radioElement.checked).value;
          }
        }

        for (const [fieldOptions, checkboxElement] of this.#checkboxElements) {
          submitData[fieldOptions.name] = checkboxElement.checked;
        }

        for (const [fieldOptions, selectElement, errorElement] of
          this.#selectElements) {
          if (fieldOptions?.isRequired && selectElement.value === '') {
            errorElement.textContent =
              fieldOptions?.errorMessage || this.#defaultRequiredError;
            willContinueSubmit = false;
          } else {
            errorElement.textContent = '';
            submitData[fieldOptions.name] = selectElement.value;
          }
        }
        if (!willContinueSubmit) {
          return;
        }
        event.data = submitData;
      });
  }

  render(selector) {
    document.querySelector(selector)
      .appendChild(this.#formElement);
  }
}
