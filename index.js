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

sampleForm.onSubmit(async (data) => {
  await new Promise((r) =>
    setTimeout(() => {
      console.log(data);
      r();
    }, 1000)
  );
});
sampleForm.render('.google-form');

sampleForm.onSubmit(console.table);
sampleForm.render('.google-form');
