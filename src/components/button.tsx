"use client";

interface ButtonProps {
  text: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
  disabled?: boolean;
}

const Button = ({ text, onClick, variant = 'primary', className = "", disabled = false }:ButtonProps) => {
  const baseStyles = "px-4 py-2 rounded-md font-semibold";
  let variantStyles = "";

  switch (variant) {
    case 'primary':
      variantStyles = "bg-blue-600 text-white hover:bg-blue-700 px-50 py-4";
      break;
    case 'secondary':
      variantStyles = "bg-gray-200 text-gray-800 hover:bg-gray-300";
      break;
    case 'danger':
      variantStyles = "bg-red-600 text-white hover:bg-red-700";
      break;
    default:
      variantStyles = "bg-blue-600 text-white hover:bg-blue-700";
  }

  const disabledStyles = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variantStyles} ${disabledStyles} ${className}`}
      disabled={disabled}
    >
      {text}
    </button>
  );
};

export default Button;