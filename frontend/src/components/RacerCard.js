import React from 'react';

const RacerCard = ({ racer }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 flex items-center">
      {racer.profilePicture && (
        <img src={racer.profilePicture} alt={racer.name} className="w-16 h-16 rounded-full mr-4" />
      )}
      <div>
        <h3 className="text-lg font-bold">{racer.name}</h3>
        <p>Number: {racer.racingNumber}</p>
        <p>Age: {racer.age}</p>
        <p>Country: {racer.country}</p>
        <p>Team: {racer.team.name}</p>
      </div>
    </div>
  );
};

export default RacerCard;
