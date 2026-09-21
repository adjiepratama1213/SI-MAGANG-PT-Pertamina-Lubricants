const Yup = require('yup');
const schema = Yup.object().shape({
  id: Yup.string(),
  password: Yup.string().when('id', ([id], schema) =>
    id ? schema.nullable() : schema
      .required('Password is required')
      .min(8, 'Minimal 8 karakter, maksimal 32 karakter, harus mengandung huruf dan angka.')
      .max(32, 'Minimal 8 karakter, maksimal 32 karakter, harus mengandung huruf dan angka.')
      .matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, 'Minimal 8 karakter, maksimal 32 karakter, harus mengandung huruf dan angka.')
  )
});

async function test() {
  try {
    await schema.validate({ id: '', password: '123' });
    console.log("Success 1");
  } catch (e) {
    console.log("Error 1:", e.message);
  }
}
test();
