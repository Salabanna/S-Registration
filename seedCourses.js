// seedCourses.js
require('dotenv').config();
const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: String,
  description: String,
  code: String
});

const Course = mongoose.model("Course", CourseSchema);

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Connected to MongoDB...");

    // Remove old courses (optional)
    await Course.deleteMany({});

    // Insert new default courses
    const courses = [
      {
        title: "Introduction to Programming",
        description: "Learn programming basics using Python & JavaScript.",
        code: "CS101"
      },
      {
        title: "Data Structures & Algorithms",
        description: "Learn arrays, linked lists, stacks, queues, trees, and more.",
        code: "CS201"
      },
      {
        title: "Web Development",
        description: "HTML, CSS, JavaScript, Node.js, Express basics.",
        code: "WD301"
      },
      {
        title: "Database Systems",
        description: "Learn SQL, NoSQL, MongoDB, indexing, ACID principles.",
        code: "DB401"
      },
      {
        title: "Cloud Computing",
        description: "AWS, Azure, GCP basics, virtualization, Docker.",
        code: "CL501"
      }
    ];

    await Course.insertMany(courses);

    console.log("Courses seeded successfully!");
    process.exit(0);

  } catch (err) {
    console.error("Error seeding courses:", err);
    process.exit(1);
  }
}

seed();
