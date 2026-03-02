import React, { useState } from 'react';
import { CashDrawerModal } from './CashDrawerModal';

interface OpenCashScreenProps {
  onDrawerOpened: () => void;
}

export const OpenCashScreen: React.FC<OpenCashScreenProps> = ({ onDrawerOpened }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-12 text-center max-w-md">
        <div className="text-6xl mb-6">💰</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">No Open Cash Drawer</h1>
        <p className="text-gray-600 mb-8">
          You need to open the cash drawer before you can process sales. Please enter your opening amount to start a new shift.
        </p>

        <button
          onClick={() => setShowModal(true)}
          className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold text-lg transition transform hover:scale-105"
        >
          🔓 Open Cash Drawer
        </button>

        <div className="mt-8 pt-8 border-t text-sm text-gray-500">
          <p>Your shift will start with the amount you enter.</p>
          <p>All sales will be tracked to this drawer.</p>
        </div>
      </div>

      <CashDrawerModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          setShowModal(false);
          onDrawerOpened();
        }}
      />
    </div>
  );
};
