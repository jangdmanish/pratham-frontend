"use client";
import TextareaAutosize from "react-textarea-autosize";

export default function AutoResizeTextarea(
  {disabled = false, value = "", onChange = () => {}}
  : {disabled?: boolean, value: string, onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void}) {
  return (
    <TextareaAutosize
      minRows={1}
      disabled={disabled}
      maxRows={12}
      value={value} 
      onChange={onChange}
      className="w-full p-2 border rounded resize-none text-gray-700"
      placeholder="Answers from the server..."
    />
  );
}