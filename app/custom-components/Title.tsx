import React from "react";

interface TitleProps {
  emoji: string;
  headingText: string;
}

const Title: React.FC<TitleProps> = ({ emoji, headingText }) => {
  return (
    <>
      <p className="text-center mb-4">{emoji}</p>
      <p className="text-center mb-8">{headingText.toUpperCase()}</p>
    </>
  );
};

export default Title;
