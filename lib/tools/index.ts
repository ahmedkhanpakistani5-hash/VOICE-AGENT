import { getGeminiClient } from '../gemini';

// Safe math calculation helper
export function executeCalculator(expression: string): { result: number | string; steps: string[] } {
  try {
    // Clean expression: allow percentages, e.g. "25% of 8500" -> 0.25 * 8500
    let sanitized = expression
      .replace(/(\d+(?:\.\d+)?)%\s*(?:of|\*)\s*(\d+(?:\.\d+)?)/gi, '($1 / 100 * $2)')
      .replace(/(\d+(?:\.\d+)?)%/g, '($1 / 100)')
      .replace(/x/gi, '*')
      .replace(/\^/g, '**');

    // Only allow safe math characters
    if (!/^[0-9+\-*/().\s*^]+$/.test(sanitized)) {
      return { result: 'Invalid math expression', steps: ['Rejected: unsafe characters detected'] };
    }

    // Evaluate safely using Function constructor with restricted scope
    const compute = new Function(`"use strict"; return (${sanitized});`);
    const val = compute();
    const formatted = typeof val === 'number' ? (Number.isInteger(val) ? val : Number(val.toFixed(4))) : val;
    return {
      result: formatted,
      steps: [
        `Parsed input: "${expression}"`,
        `Normalized expression: ${sanitized}`,
        `Computed value: ${formatted}`,
      ],
    };
  } catch (err: any) {
    return {
      result: 'Calculation error',
      steps: [`Failed to compute "${expression}": ${err.message}`],
    };
  }
}

// Live real-time Weather using Open-Meteo API
export async function executeWeatherLookup(location: string): Promise<Record<string, any>> {
  try {
    // 1. Geocode location
    const cleanLoc = encodeURIComponent(location.trim());
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${cleanLoc}&count=1&language=en&format=json`
    );
    if (!geoRes.ok) {
      throw new Error(`Geocoding failed for ${location}`);
    }
    const geoData = await geoRes.json();
    if (!geoData.results || geoData.results.length === 0) {
      return {
        location,
        found: false,
        message: `Could not locate "${location}". Please specify city name and country.`,
      };
    }

    const { latitude, longitude, name, country, admin1 } = geoData.results[0];

    // 2. Fetch current weather
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto`;
    const weatherRes = await fetch(weatherUrl);
    if (!weatherRes.ok) {
      throw new Error('Weather API request failed');
    }
    const weatherData = await weatherRes.json();
    const current = weatherData.current;

    // Weather code description mapping (WMO code)
    const wmoMap: Record<number, string> = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      71: 'Slight snowfall',
      73: 'Moderate snowfall',
      75: 'Heavy snowfall',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      95: 'Thunderstorm',
    };

    const condition = wmoMap[current.weather_code] || 'Fair';

    return {
      location: `${name}${admin1 ? `, ${admin1}` : ''}, ${country}`,
      coordinates: { lat: latitude, lon: longitude },
      temperatureC: current.temperature_2m,
      temperatureF: Number(((current.temperature_2m * 9) / 5 + 32).toFixed(1)),
      feelsLikeC: current.apparent_temperature,
      humidity: `${current.relative_humidity_2m}%`,
      windSpeed: `${current.wind_speed_10m} km/h`,
      condition,
      isDay: current.is_day === 1,
      precipitation: `${current.precipitation} mm`,
      timezone: weatherData.timezone,
    };
  } catch (err: any) {
    return {
      location,
      error: true,
      message: `Failed to retrieve live weather: ${err.message}`,
    };
  }
}

// Live real-time Date & Time tool
export function executeDateTimeLookup(timezone?: string): Record<string, any> {
  const now = new Date();
  const timeZoneUsed = timezone || 'UTC';
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone || undefined,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZoneName: 'short',
    });

    return {
      isoString: now.toISOString(),
      formatted: formatter.format(now),
      dayOfWeek: now.toLocaleDateString('en-US', { weekday: 'long', timeZone: timezone || undefined }),
      epochMs: now.getTime(),
      timezone: timeZoneUsed,
    };
  } catch {
    return {
      isoString: now.toISOString(),
      formatted: now.toUTCString(),
      dayOfWeek: 'Current Day',
      epochMs: now.getTime(),
      timezone: 'UTC',
    };
  }
}

// Live Web Search tool using Gemini with Google Search grounding
export async function executeWebSearch(query: string): Promise<Record<string, any>> {
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Search query: ${query}\n\nProvide an objective, up-to-date factual briefing answering the search query with bullet points, source citations or domains where relevant, and concise actionable insights.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const sources: Array<{ title?: string; uri?: string }> = [];
    const groundingMetadata = (response.candidates?.[0] as any)?.groundingMetadata;
    if (groundingMetadata?.groundingChunks) {
      for (const chunk of groundingMetadata.groundingChunks) {
        if (chunk.web?.uri) {
          sources.push({
            title: chunk.web.title || chunk.web.uri,
            uri: chunk.web.uri,
          });
        }
      }
    }

    return {
      query,
      summary: response.text || 'No detailed results returned.',
      sources: sources.slice(0, 5),
      timestamp: new Date().toISOString(),
    };
  } catch (err: any) {
    return {
      query,
      error: true,
      summary: `Web search execution notice: ${err.message}. Synthesizing internal knowledge base.`,
    };
  }
}
