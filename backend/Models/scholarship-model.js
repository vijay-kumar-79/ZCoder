const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const scholarshipSchema = new Schema({
    Eligibility: String,
    Region: String,
    Deadline: String,
    Award: String,
    Description: String,
    Email: String,
    link: String,
    category: String,
    Links: String,
    contactDetails: String,
    name: String    
})

const Scholarship = mongoose.model("Scholarship" , scholarshipSchema, "scholarships");

module.exports = Scholarship;