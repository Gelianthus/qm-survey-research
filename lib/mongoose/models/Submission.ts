import mongoose from "mongoose";

const SkillSchema = new mongoose.Schema({
  rating: { type: Number, required: true },
  used: { type: String, enum: ["yes", "no"], required: true },
  example: { type: String, default: "" },
});

const SubmissionSchema = new mongoose.Schema(
  {
    student_name: { type: String, default: "" },
    college_program: { type: String, required: true },
    school: { type: String, required: true },

    responses: {
      type: Map,
      of: SkillSchema,
      required: true,
    },
  },
  { timestamps: true }
);

export const Submission =
  mongoose.models.Submission || mongoose.model("Submission", SubmissionSchema);