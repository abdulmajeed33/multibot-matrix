import React, { ReactNode } from "react";

interface TwoColumnLayoutProps {
  leftChildren: ReactNode;
  rightChildren: ReactNode;
}

const TwoColumnLayout: React.FC<TwoColumnLayoutProps> = ({
  leftChildren,
  rightChildren,
}) => (
  <div className="flex flex-col justify-between md:flex-row md:justify-between">
    {/* Description */}
    <div className="md:w-2/5 w-full">{leftChildren}</div>
    {/* Chat */}
    <div className="md:w-2/5 w-full min-h-screen">{rightChildren}</div>
  </div>
);

export default TwoColumnLayout;
