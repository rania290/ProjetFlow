import React from 'react';

const SimplePermissionsPage: React.FC = () => {
  return (
    <div>
      <h1>Gestion des Permissions</h1>
      <p>Interface de gestion des accès utilisateurs</p>
      <button>AJOUTER PERMISSION</button>
      <button>Actualiser</button>
      <div>
        <h3>🛡️ Gestion des Permissions</h3>
        <p>Cette page vous permettra de gérer les permissions granulaires.</p>
      </div>
    </div>
  );
};

export default SimplePermissionsPage;
