import React from 'react';

const Skeleton = ({ width, height }) => {
  return (
    <div className={`bg-gray-700 animate-pulse ${width} ${height}`}></div>
  );
};

export default Skeleton;