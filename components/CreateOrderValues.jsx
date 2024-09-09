

import React, { useState } from 'react';
import Swap from './Swap';

const CreateOrderValues = () => {
  const [tokenAddress, setTokenAddress] = useState("");

  return (
        <div className="flex flex-col items-center p-4 rounded-lg ">
          <div className="w-full">
            <Swap />
          </div>
        </div>
  );
};

export default CreateOrderValues;
