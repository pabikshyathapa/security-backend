mongoose.connect('mongodb://localhost:27017/jewelme', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

(async () => {
  try {
    const hashedPassword = await bcrypt.hash('Jewelme@08', 10);

    await Admin.create({
      email: 'admin@jewelme.com'.toLowerCase(),
      password: hashedPassword,
    });

    console.log('Admin created successfully');
  } catch (err) {
    console.error('Error creating admin:', err);
  } finally {
    mongoose.connection.close();
  }
})();