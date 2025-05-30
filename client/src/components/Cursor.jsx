import React from "react";

const Cursor = ({ x, y, username }) => {
  return (
    <div
      className="absolute pointer-events-none z-50"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: "translateX(-50%) translateY(-50%)",
      }}
    >
      <svg
        width="24"
        height="36"
        viewBox="0 0 24 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-md"
      >
        <path
          d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
          fill="currentColor"
          stroke="white"
        />
      </svg>
      <div
        className="absolute left-4 px-2 py-1 rounded-md bg-yellow text-black text-sm whitespace-nowrap"
      >
        {username}
      </div>
    </div>
  );
};

export default Cursor;
