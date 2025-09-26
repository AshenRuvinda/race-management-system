import React from 'react';

const TeamCard = ({ team }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 flex items-center">
      {team.logo && (
        <img src={team.logo} alt={team.name} className="w-16 h-16 mr-4" />
      )}
      <div>
        <h3 className="text-lg font-bold">{team.name}</h3>
        <p>Country: {team.country}</p>
        <p>Owner: {team.owner.username}</p>
      </div>
    </div>
  );
};

export default TeamCard;
