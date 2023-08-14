import React from "react";

interface ButtonProps {
  color?: "red" | "blue" | "green" | "pink";
  handleSubmit: (endpoint: string) => Promise<void>;
  endpoint: string;
  buttonText: string;
  className?: string; // Add className to ButtonProps
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  color = "blue",
  handleSubmit,
  endpoint,
  buttonText,
  className, // Destructure className from props
  disabled,
}) => {
  const colorClasses: Record<string, string> = {
    red: "bg-red-500 hover:bg-red-600",
    blue: "bg-blue-500 hover:bg-blue-600",
    green: "bg-green-500 hover:bg-green-600",
    pink: "bg-pink-500 hover:bg-pink-600",
    // Add more colors as needed
  };

  const colorClass = colorClasses[color] || "bg-white hover:bg-white"; // Default to blue if color prop not recognized

  return (
    <>
      <button
        onClick={() => handleSubmit(endpoint)}
        disabled={disabled}
        className={`px-6 py-2 w-full rounded-full border border-gray-500 shadow hover:shadow-lg ${colorClass} ${className}`} // Include className here
      >
        {buttonText}
      </button>
    </>
  );
};

export default Button;
