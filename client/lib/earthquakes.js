export async function fetchEarthquakes(type, period) {
  // TODO sækja gögn frá proxy þjónustu
  try {
    result = await fetch(?);
  } catch (e) {
    console.error('Villa við að sækja', e);
    return null;
  }

  if (!result.ok) {
    console.error('Ekki 200 svar', await result.text());
    return null;
  }

  const data = await result.json();

  return data;
}
