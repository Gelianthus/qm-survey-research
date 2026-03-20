import { useState } from "react";

type QuestionBlock = {
  title: string;
  skill: string;
  questions: string[];
};

type Props = {
  questionBlock: QuestionBlock;
};

export default function QuestionGroup({ questionBlock }: Props) {
  const [used, setUsed] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-lg shadow-sm px-4 sm:px-6 py-5 space-y-5">
      <h3 className="text-base font-medium text-gray-800">
        {questionBlock.title}
      </h3>

      <div className="space-y-2">
        <p className="text-sm text-gray-700">
          {questionBlock.questions[0]}{" "}
          <span className="text-red-500">*</span>
        </p>
        <div className="flex gap-5 sm:gap-4">
          {[1, 2, 3, 4, 5].map((val) => (
            <label
              key={val}
              className="flex flex-col items-center gap-1.5 cursor-pointer group"
            >
              <input
                type="radio"
                name={`${questionBlock.skill}_rating`}
                value={val}
                required
                className="accent-[#7248b9] w-5 h-5 sm:w-4 sm:h-4 cursor-pointer"
              />
              <span className="text-xs text-gray-500 group-hover:text-[#7248b9] transition-colors">
                {val}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-700">
          {questionBlock.questions[1]}{" "}
          <span className="text-red-500">*</span>
        </p>
        <div className="flex flex-col gap-1.5">
          {["Yes", "No"].map((val) => (
            <label
              key={val}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="radio"
                name={`${questionBlock.skill}_used`}
                value={val.toLowerCase()}
                required
                onChange={(e) => setUsed(e.target.value)}
                className="accent-[#7248b9] w-5 h-5 sm:w-4 sm:h-4 cursor-pointer"
              />
              <span className="text-sm text-gray-700 group-hover:text-[#7248b9] transition-colors">
                {val}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <label
          htmlFor={`${questionBlock.skill}_example`}
          className={`text-sm ${used === "no" ? "text-gray-400" : "text-gray-700"}`}
        >
          {questionBlock.questions[2]}{" "}
          <span className="text-gray-400 text-xs">(Optional)</span>
        </label>
        <textarea
          name={`${questionBlock.skill}_example`}
          id={`${questionBlock.skill}_example`}
          rows={3}
          placeholder="Your answer"
          disabled={used === "no"}
          className="w-full border-b border-gray-300 focus:border-[#7248b9] outline-none text-sm py-1.5 text-gray-800 placeholder:text-gray-300 resize-none transition-colors bg-transparent disabled:opacity-40 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
}