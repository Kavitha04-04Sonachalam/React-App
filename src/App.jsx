import React, { useState, useEffect } from "react";
import Search from "./components/Search.jsx";
import Spinner from "./components/Spinner.jsx";
import MovieCard from "./components/MovieCard.jsx";
import {useDebounce} from 'react-use'
import { getTrendingMovies, updateSearchCount } from "./appwrite.js";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY; // your TMDB API key
console.log("TMDB API KEY:", API_KEY);

// CORS proxy for bypassing browser restrictions
const CORS_PROXY = "https://api.allorigins.win/raw?url=";

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [trendingMovies, setTrendingMovies]= useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debounceSearchTerm, setDebounceSearchTerm] = useState('');

  useDebounce(()=> setDebounceSearchTerm(searchTerm), 500, [searchTerm]);
  const fetchMovies = async (query = ' ') => 
  {
    setIsLoading(true);
    setErrorMessage("");

    try {
      // Use query parameter API key instead of Authorization header
      const tmdbUrl = query
      ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&api_key=${API_KEY}`
      :`${API_BASE_URL}/discover/movie?sort_by=popularity.desc&api_key=${API_KEY}`;


      const proxyUrl = `${CORS_PROXY}${encodeURIComponent(tmdbUrl)}`;

      const response = await fetch(proxyUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

  const data = await response.json();
  console.log("TMDB Response Data:", data);

      if (!data.results || data.results.length === 0) {
        setErrorMessage("No movies found");
        setMovieList([]);
        return;
      }

      setMovieList(data.results);

      if (query && data.results.length > 0) {
       
        await updateSearchCount(query, data.results[0]);
    }
  } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage("Error fetching movies");
    } finally {
      setIsLoading(false);
    }
  };
  

  const loadTrendingMovies = async()=>{
    try{

      const movies =  await getTrendingMovies();

      setTrendingMovies(movies.slice(0,5));
    }catch(error){
    console.error(`Error loading trending movies: ${error}`);
    
  }
}

  useEffect(() => {
    fetchMovies(debounceSearchTerm);
    
  }, [debounceSearchTerm]);

 useEffect(() => {
    loadTrendingMovies();
  }, []);
  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="Hero Banner" />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
             <h2>Tredning Movies</h2>

             <ul>
              {trendingMovies.map((movie, index) => (
                  <li key={movie.$id}>
                    <p>{index+1}</p>
                    <img src={movie.poster_url} alt={movie.title}/>
                  </li>

              ))}
             </ul>
          </section>
        )
        }

        <section className="all-movies">
          <h2>All Movies</h2>
          {isLoading ? (
           <Spinner/>
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie}/>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};
export default App;