import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const MovieFetcher = () => {
  const [apiSource, setApiSource] = useState('TMDB');
  const [genres, setGenres] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [year, setYear] = useState('');
  const [minRating, setMinRating] = useState('');
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [minRuntime, setMinRuntime] = useState('');
  const [maxRuntime, setMaxRuntime] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [withCast, setWithCast] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (apiSource === 'TMDB') {
      const fetchConfig = async () => {
        try {
          const res = await axios.get('http://localhost:8000/api/config/');
          setGenres(res.data.genres);
          setLanguages(res.data.languages);
          setCountries(res.data.countries);
        } catch (err) {
          setError('Failed to load configuration.');
          console.error(err);
        }
      };
      fetchConfig();
    } else {
      setGenres([]); // OMDb doesn't provide config
      setLanguages([]);
      setCountries([]);
    }
  }, [apiSource]);

  const handleFetchMovies = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMovies([]);

    try {
      const params = {
        api_source: apiSource,
        search_query: searchQuery,
        genre: selectedGenre,
        language: selectedLanguage,
        country: selectedCountry,
        year,
        min_rating: minRating,
        sort_by: sortBy,
        min_runtime: minRuntime,
        max_runtime: maxRuntime,
        with_cast: withCast,
      };
      const res = await axios.get('http://localhost:8000/api/movies/', { params });
      setMovies(res.data.movies);
    } catch (err) {
      setError('Failed to fetch movies. Check filters or server.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Movie Fetcher</h1>
      <p className="mb-4">Fetch movies from TMDb or OMDb via Django backend with advanced filters.</p>

      <form onSubmit={handleFetchMovies}>
        <div className="row mb-3">
          <div className="col-md-4">
            <label>API Source:</label>
            <select className="form-select" value={apiSource} onChange={(e) => setApiSource(e.target.value)}>
              <option value="TMDB">TMDb (Advanced Filters)</option>
              <option value="OMDB">OMDb (IMDb Data, Title Search)</option>
            </select>
          </div>
        </div>

        {apiSource === 'TMDB' && (
          <>
            <div className="row mb-3">
              <div className="col-md-4">
                <label>Genre:</label>
                <select className="form-select" value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
                  <option value="">Any</option>
                  {genres.map((genre) => (
                    <option key={genre.id} value={genre.id}>{genre.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label>Original Language:</label>
                <select className="form-select" value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
                  <option value="">Any</option>
                  {languages.map((lang) => (
                    <option key={lang.iso_639_1} value={lang.iso_639_1}>{lang.english_name}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label>Country/Region:</label>
                <select className="form-select" value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}>
                  <option value="">Any</option>
                  {countries.map((country) => (
                    <option key={country.iso_3166_1} value={country.iso_3166_1}>{country.english_name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-4">
                <label>Release Year:</label>
                <input className="form-control" type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="e.g., 2023" />
              </div>
              <div className="col-md-4">
                <label>Minimum Rating:</label>
                <input className="form-control" type="number" step="0.1" min="0" max="10" value={minRating} onChange={(e) => setMinRating(e.target.value)} placeholder="e.g., 7.0" />
              </div>
              <div className="col-md-4">
                <label>Sort By:</label>
                <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="popularity.desc">Popularity Desc</option>
                  <option value="popularity.asc">Popularity Asc</option>
                  <option value="vote_average.desc">Rating Desc</option>
                  <option value="vote_average.asc">Rating Asc</option>
                  <option value="release_date.desc">Release Desc</option>
                  <option value="release_date.asc">Release Asc</option>
                </select>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-4">
                <label>Min Runtime (min):</label>
                <input className="form-control" type="number" value={minRuntime} onChange={(e) => setMinRuntime(e.target.value)} placeholder="e.g., 90" />
              </div>
              <div className="col-md-4">
                <label>Max Runtime (min):</label>
                <input className="form-control" type="number" value={maxRuntime} onChange={(e) => setMaxRuntime(e.target.value)} placeholder="e.g., 180" />
              </div>
              <div className="col-md-4">
                <label>With Cast (Actor Name):</label>
                <input className="form-control" type="text" value={withCast} onChange={(e) => setWithCast(e.target.value)} placeholder="e.g., Tom Hanks" />
              </div>
            </div>
          </>
        )}
        <div className="row mb-3">
          <div className="col-md-6">
            <label>Search Query (Title/Keywords):</label>
            <input className="form-control" type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="e.g., Inception" />
          </div>
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>Fetch Movies</button>
      </form>

      {error && <p className="text-danger mt-3">{error}</p>}

      {loading ? (
        <p className="mt-3">Loading...</p>
      ) : (
        <ul className="list-group mt-3">
          {movies.map((movie, index) => (
            <li key={index} className="list-group-item">
              <h5>{movie.title || movie.Title} ({(movie.release_date || movie.Year)?.substring(0, 4)})</h5>
              <p>Rating: {movie.vote_average || movie.imdbRating}</p>
              <p>{movie.overview || movie.Plot}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MovieFetcher;