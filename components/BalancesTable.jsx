
import React from 'react';
import { useSelector } from 'react-redux';
import Skeleton from './Skeleton';

const BalancesTable = () => {
  const { native, usdc, loading } = useSelector(state => state.userDataInteract);

  return (
    <div className="bg-transparent p-4 rounded-lg">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-white border border-gray-700">
          <thead className="text-xs text-white uppercase bg-gray-700/[0.3]">
            <tr>
              <th className="px-6 py-3">Balances</th>
              <th className="px-6 py-3">Native</th>
              <th className="px-6 py-3">USDC</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-gray-800/[0.2] border-b border-t border-gray-700">
              <td className="px-6 py-4">Collateral Balance</td>
              <td className="px-6 py-4">
                {loading ? <Skeleton width="w-full" height="h-6" /> : native?.collateral_balance}
              </td>
              <td className="px-6 py-4">
                {loading ? <Skeleton width="w-full" height="h-6" /> : usdc?.collateral_balance}
              </td>
            </tr>

            <tr className="bg-gray-800/[0.2] border-b border-t border-gray-700">
              <td className="px-6 py-4">Borrow Allowance</td>
              <td className="px-6 py-4">
                {loading ? <Skeleton width="w-full" height="h-6" /> : native?.wrapped_leverage_balance}
              </td>
              <td className="px-6 py-4">
                {loading ? <Skeleton width="w-full" height="h-6" /> : usdc?.wrapped_leverage_balance}
              </td>
            </tr>

            <tr className="bg-gray-800/[0.2] border-b border-t border-gray-700">
              <td className="px-6 py-4">Borrowed Balance</td>
              <td className="px-6 py-4">
                {loading ? <Skeleton width="w-full" height="h-6" /> : native?.borrow_balance}
              </td>
              <td className="px-6 py-4">
                {loading ? <Skeleton width="w-full" height="h-6" /> : usdc?.borrow_balance}
              </td>
            </tr>

            <tr className="bg-gray-800/[0.2] border-b border-t border-gray-700">
              <td className="px-6 py-4">V token balance</td>
              <td className="px-6 py-4">
                {loading ? <Skeleton width="w-full" height="h-6" /> : native?.v_token_balance}
              </td>
              <td className="px-6 py-4">
                {loading ? <Skeleton width="w-full" height="h-6" /> : usdc?.v_token_balance}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BalancesTable;
