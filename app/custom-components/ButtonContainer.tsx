import React, { ReactNode } from "react";

interface ButtonContainerProps {
  children: ReactNode;
}

const ButtonContainer: React.FC<ButtonContainerProps> = ({ children }) => {
  return <div className="flex items-center justify-center mb-10 gap-10">{children}</div>;
};

export default ButtonContainer;
