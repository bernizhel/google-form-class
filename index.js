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

sampleForm.onSubmit((data) => {
  for (const [key, value] of Object.entries(data)) {
    console.log(`${key}: ${value};`);
  }
});
sampleForm.render('.google-form');

sampleForm.onSubmit(console.table);
sampleForm.render('.google-form');
