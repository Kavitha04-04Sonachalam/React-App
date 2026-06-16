export default async function handler(request, response) {
  // Set CORS headers just in case, though it's same-origin in production
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  try {
    const { query } = request.query;
    // Fallback key if process.env.VITE_TMDB_API_KEY is not configured
    const apiKey = process.env.VITE_TMDB_API_KEY || "41418873537e82b4800f004e2a5a9bd8";
    
    const API_BASE_URL = "https://api.themoviedb.org/3";
    const tmdbUrl = query
      ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&api_key=${apiKey}`
      : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&api_key=${apiKey}`;

    const res = await fetch(tmdbUrl);
    if (!res.ok) {
      return response.status(res.status).json({ error: `TMDB API responded with status ${res.status}` });
    }

    const data = await res.json();
    return response.status(200).json(data);
  } catch (error) {
    console.error("Error in serverless proxy:", error);
    return response.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
