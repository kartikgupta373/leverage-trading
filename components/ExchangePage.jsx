"use client"
import React, { useState, useEffect } from 'react';
import Dropdown from './Dropdown';
import Image from 'next/image';
import vector from "../public/assets/vector.svg";
import vector1 from "../public/assets/vector1.svg";
import axios from 'axios';
import Swap from './Swap';
import Chart from './Chart';
import { useSelector } from 'react-redux';

const ExchangePage = () => {
  const [orders, setOrders] = useState([]);
  const signerData = useSelector(state => state.connectWallet);
  const orderData = useSelector(state => state.userDataInteract.orders);

  useEffect(() => {
    // Load orders from local storage on page load
    const storedOrders = JSON.parse(localStorage.getItem('orders')) || [];
    setOrders(storedOrders);

    // Load orders from contract if user is connected
    if (signerData?.signer) {
      setOrders(orderData);
    }
  }, [signerData, orderData]);

  const handleOrderCreated = (newOrder) => {
    // Add new order to state and local storage
    const updatedOrders = [...orders, newOrder];
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
  };

  return (
    <div className="text-white rounded-3xl w-full h-full">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className='z-10'>
            <Dropdown />
          </div>
          <div className="bg-black/[0.6] rounded-3xl p-2 h-[350px]">
            <div className="h-full w-full rounded-3xl p-1">
              <Chart />
            </div>
          </div>
        </div>
        <div className="bg-black/[0.6] w-full justify-between rounded-3xl p-4">
          <Swap onOrderCreated={handleOrderCreated} />
        </div>
      </div>
      <div className="bg-black/[0.6] rounded-3xl p-4 mt-4">
        <div className="overflow-x-auto flex items-center">
          <div className='flex flex-col space-y-2'>
            <a href='/'>
              <Image
                priority
                src={vector}
                alt="vector icon"
                width={30}
                height={30}
              />
            </a>
            <a href='/'>
              <Image
                priority
                src={vector1}
                alt="vector1 icon"
                width={30}
                height={30}
              />
            </a>
          </div>
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Order ID</th>
                <th scope="col" className="px-6 py-3">Buy Token</th>
                <th scope="col" className="px-6 py-3">Sell Token</th>
                <th scope="col" className="px-6 py-3">Amount</th>
                <th scope="col" className="px-6 py-3">Result Value</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={index} className="hover:bg-gray-700">
                  <td className="px-6 py-4">{order.order_id}</td>
                  <td className="px-6 py-4">{order.buyToken}</td>
                  <td className="px-6 py-4">{order.sellToken}</td>
                  <td className="px-6 py-4">{order.amount}</td>
                  <td className="px-6 py-4">{order.result}</td>
                  <td className="px-6 py-4">{order.status}</td>
                  <td className="px-6 py-4">{new Date(order.createdAt * 1000).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExchangePage;
