require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("../models/Admin");

const args = process.argv.slice(2);

if (args.length < 3) {
  console.log("Usage: node addAdmin.js <name> <email> <password>");
  process.exit(1);
}

const [name, email, password] = args;

const addAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log(`Admin with email ${email} already exists.`);
      process.exit(0);
    }

    const admin = await Admin.create({
      name,
      email,
      password,
    });

    console.log(`Successfully created new admin: ${admin.name} (${admin.email})`);
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

addAdmin();

// node utils/addAdmin.js "Test Admin" testadmin@example.com mysecurepassword