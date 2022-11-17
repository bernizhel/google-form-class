const sampleForm = new GoogleForm({
  title: 'Your info',
  description: 'Please enter your info',
  fields: [
    {
      title: 'Do you have a dog?',
      name: 'hasDog',
      isRequired: true,
      type: 'checkbox',
    },
  ],
});

sampleForm.render('.google-form');
sampleForm.render('.google-form');

sampleForm.onSubmit(console.table);
