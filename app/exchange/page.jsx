import React from 'react'
import ExchangePage from '@/components/ExchangePage'

const exchange = () => {
  return (
    <div>
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-100">
        <div className="p-6 rounded-3xl w-full max-w-4xl mx-auto">
          <div className="h-full flex flex-col md:flex-row justify-between items-center ">
              <ExchangePage />
            </div>
          </div>
        </div>
    </div>
  )
}

export default exchange