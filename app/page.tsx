"use client";

import QuestionGroup from "@/components/QuestionGroup";
import { QUESTION_DATA } from "@/data/question-data";

export default function Home() {
  async function handleSubmit(e: any) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const data: any = {
      student_name: formData.get("student_name"),
      college_program: formData.get("college_program"),
      school: formData.get("school"),
      responses: {},
    };

    for (let { skill } of QUESTION_DATA) {
      data.responses[skill] = {
        rating: Number(formData.get(`${skill}_rating`)),
        used: formData.get(`${skill}_used`),
        example: formData.get(`${skill}_example`) || "",
      };
    }

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.success) {
        alert("Survey submitted successfully!");
        form.reset();
      } else {
        alert("Submission failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
  }

  return (
    <div className="min-h-screen bg-[#f0ebf8] py-6 sm:py-10 px-3 sm:px-4 font-sans">
      <div className="max-w-2xl mx-auto space-y-4">

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="h-2.5 bg-[#7248b9]" />
          <div className="px-6 py-6">
            <h1 className="text-2xl sm:text-3xl font-normal text-gray-800 mb-1">
              Computer Literacy Survey
            </h1>
            <p className="text-sm text-gray-500">
              This survey assesses computer literacy skills. Fields marked with{" "}
              <span className="text-red-500">*</span> are required.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-sm px-4 sm:px-6 py-5 sm:py-6 space-y-5">
            <h2 className="text-base font-medium text-gray-700 border-b pb-2">
              Section I: Respondent Information
            </h2>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-700">
                Name <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <input
                type="text"
                name="student_name"
                placeholder="Your answer"
                className="border-b border-gray-300 focus:border-[#7248b9] outline-none text-sm py-1.5 text-gray-800 placeholder:text-gray-300 transition-colors bg-transparent"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-700">
                College Program / Course{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="college_program"
                required
                placeholder="Your answer"
                className="border-b border-gray-300 focus:border-[#7248b9] outline-none text-sm py-1.5 text-gray-800 placeholder:text-gray-300 transition-colors bg-transparent"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-700">
                School / Institution <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="school"
                required
                placeholder="Your answer"
                className="border-b border-gray-300 focus:border-[#7248b9] outline-none text-sm py-1.5 text-gray-800 placeholder:text-gray-300 transition-colors bg-transparent"
              />
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <div className="bg-white rounded-lg shadow-sm px-6 py-4">
              <h2 className="text-base font-medium text-gray-700 border-b pb-2 mb-1">
                Section II: Computer Literacy Self-Assessment
              </h2>
              <p className="text-sm text-gray-500">Rate your proficiency from 1 (lowest) to 5 (highest).</p>
            </div>

            {QUESTION_DATA.map((data) => (
              <QuestionGroup key={data.skill} questionBlock={data} />
            ))}
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between mt-6">
            <button
              type="submit"
              className="w-full sm:w-auto bg-[#7248b9] hover:bg-[#5e3a9e] text-white text-sm font-medium px-8 py-3 sm:py-2.5 rounded transition-colors"
            >
              Submit
            </button>
            <button
              type="reset"
              className="text-sm text-[#7248b9] hover:underline text-center sm:text-left"
            >
              Clear form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}