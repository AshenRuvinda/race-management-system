const LapTime = require('../models/LapTime');

const calculateGaps = async (raceId) => {
  const lapTimes = await LapTime.find({ race: raceId }).populate('racer');
  const gaps = {};

  const racerTimes = {};
  lapTimes.forEach((lap) => {
    if (!racerTimes[lap.racer._id]) racerTimes[lap.racer._id] = 0;
    racerTimes[lap.racer._id] += lap.lapTime;
  });

  const leaderTime = Math.min(...Object.values(racerTimes));
  for (const [racerId, totalTime] of Object.entries(racerTimes)) {
    gaps[racerId] = (totalTime - leaderTime).toFixed(3);
  }

  return gaps;
};

module.exports = calculateGaps;