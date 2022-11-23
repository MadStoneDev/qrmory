import React from "react";
import MyFooter from "../Components/MyFooter";

const Standard = ({ children }) => {
  // States

  return (
    <div className="flex flex-col items-stretch w-full bg-stone-100">
      {children}
      <MyFooter />
    </div>
  );
};

export default Standard;
