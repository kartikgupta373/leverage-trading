'use client'
import React, { useState } from 'react'

const Dropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState('vOSMO/vUSDC'); // State to store the selected item

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const closeDropdown = () => {
        setIsOpen(false);
    };

    const handleSelection = (item) => {
        setSelectedItem(item); // Update the selected item
        closeDropdown(); // Close the dropdown
    };

    return (
        <div className='pb-4'>
            <div className="relative inline-block w-full">
                <button
                    type="button"
                    className="p-4 text-white bg-black/[0.6] hover:bg-gray-800 font-medium rounded-full text-sm inline-flex items-center w-full justify-between"
                    onClick={toggleDropdown}
                >
                    {selectedItem} <svg className="w-3 h-3 ml-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                    </svg>
                </button>

                {isOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 rounded-lg shadow-lg bg-black ring-1 ring-black ring-opacity-5 w-full">
                        <ul role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                            
                            {/* <li>
                                <a
                                    href="#"
                                    className="block px-4 py-2 text-sm text-white hover:bg-gray-800"
                                    onClick={() => handleSelection('vOSMO/vUSDC')}
                                >
                                    vOSMO/vUSDC
                                </a>
                            </li> */}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Dropdown;
