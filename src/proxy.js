import express from 'express';
import fetch from 'node-fetch';

import { timerEnd, timerStart } from './time.js';
import { get, set } from './cache.js';

export const router = express.Router();

router.get('/proxy', async (req, res) => {
  const {
    period,
    type,
  } = req.query;

  const URL = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/${period}_${type}.geojson`;

  let result;
  const timeStart = timerStart();

  try {
    result = await get(`${period}_${type}`);
  } catch (e) {
    console.error('Náði ekki að sækja gögn úr cache', e);
  }

  let timeEnd = timerEnd(timeStart);

  if (result) {
    const data = {
      data: result,
      info: {
        cached: true,
        elapsed: timeEnd,
      },
    };
    res.json(data);
    return;
  }

  try {
    result = await fetch(URL);
  } catch (e) {
    console.error('Villa við að sækja gögn frá vefþjónusutu');
    res.status(500).send('Villa við að sækja gögn frá vefþjónustu');
    return;
  }

  if (!result.ok) {
    console.error('Villa frá vefþjónustu', await result.text());
    res.status(500).send('Villa við að sækja gögn frá vefþjónustu');
    return;
  }

  const cacheEarthquakes = await result.text();
  await set(`${period}_${type}`, cacheEarthquakes);

  timeEnd = timerEnd(timeStart);
  const cachedData = {
    data: JSON.parse(cacheEarthquakes),
    info: {
      cached: false,
      elapsed: timeEnd,
    },
  };
  res.json(cachedData);
});
