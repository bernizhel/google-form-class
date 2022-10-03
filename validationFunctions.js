function isAgeValid(age) {
  try {
    age = +age;
  } catch (error) {
    return false;
  }
  return Number.isInteger(age) && age > 0 && age < 120;
}

function isNameValid(name) {
  return !!name.match(/^(([A-Z][a-z]{1,29})(\s|))+$/g);
}

function isEmailValid(email) {
  return !!email.match(/^(\w|[._-])+@(\w|[_-])+\.(\w|[_-])+$/g);
}
