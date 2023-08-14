import React from "react";

interface PageHeaderProps {
  heading: string;
  boldText: string;
  description: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ heading, boldText, description }) => {
  return (
    <div className="text-center py-10">
      <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900 uppercase">
        {heading}
      </h1>
      <p className="text-lg md:text-xl text-gray-600 mb-8">
        <strong className="text-sky-800">{boldText}</strong> {description}
      </p>
    </div>
  );
};

export default PageHeader;
