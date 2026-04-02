import React from 'react';
import UsersManager from '../components/UsersManager';

export const Users: React.FC = () => {
  return (
    <div className="w-full">
      <main className="px-4 sm:px-8 py-8">
        <UsersManager />
      </main>
    </div>
  );
};

export default Users;
