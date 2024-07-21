import { useEffect, useState } from "react";
import StarComponent from "./StarComponent";

const key = "3b245415";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoding, setIsLoding] = useState(false);
  const [error, setError] = useState("");
  const [selectedMovieId, setSelectedMovieId] = useState(null);

  const handleAddToWatched = (movie) => {
    let isWatched = watched.some((m) => m.imdbID === movie.imdbID);
    if (!isWatched) {
      setWatched((prev) => [...prev, movie]);
    }
  };

  const handleRemoveFromWatched = (id) => {
    setWatched((watched) =>
      watched.map((movie) =>
        movie.imdbID === id ? { ...movie, userRating: 0 } : movie
      )
    );
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  };

  useEffect(() => {
    const controller = new AbortController();

    async function fetchMovies() {
      try {
        setError("");
        setIsLoding(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${key}&s=${query}`, // Corrected this line
          { signal: controller.signal } // Moved this to be a separate argument
        );
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await res.json();
        if (data.Response === "False") {
          throw new Error("No movies found!");
        }
        setMovies(data.Search);
        setError("");
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        setIsLoding(false);
      }
    }
    if (query.length < 2) {
      setError("");
      setMovies([]);
      return;
    }
    fetchMovies();

    return () => {
      controller.abort();
    };
  }, [query]);
  return (
    <>
      <NavBar>
        <Logo />
        <SearchBar query={query} onChange={setQuery} />
        <NumResult movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {error && <Error message={error} />}
          {!error &&
            (isLoding ? (
              <Loader />
            ) : (
              <MovieList
                movies={movies}
                onSelect={setSelectedMovieId}
              ></MovieList>
            ))}
        </Box>
        <Box>
          {selectedMovieId ? (
            <MovieDetails
              id={selectedMovieId}
              onClose={setSelectedMovieId}
              onAdd={handleAddToWatched}
              watched={watched}
            />
          ) : (
            <>
              <SummaryWatched watched={watched} />
              <WatchedMovieList
                watched={watched}
                onRemove={handleRemoveFromWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}
const Error = ({ message }) => {
  return <p className="error">{message}</p>;
};
const NavBar = ({ children }) => {
  return <nav className="nav-bar">{children}</nav>;
};

const NumResult = ({ movies }) => {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
};

const Logo = () => {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
};

const SearchBar = ({ query, onChange }) => {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};
const Main = ({ children }) => {
  return <main className="main">{children}</main>;
};

const WatchedMovie = ({ movie, onRemove }) => {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button className="btn-delete" onClick={() => onRemove(movie.imdbID)}>
          X
        </button>
      </div>
    </li>
  );
};

const WatchedMovieList = ({ watched, onRemove }) => {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie key={movie.imdbID} movie={movie} onRemove={onRemove} />
      ))}
    </ul>
  );
};

const SummaryWatched = ({ watched }) => {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(2)} min</span>
        </p>
      </div>
    </div>
  );
};

const MovieDetails = ({ id, onClose, onAdd, watched }) => {
  const [selectedMovie, setSelectedMovie] = useState({});
  const [userRating, setUserRating] = useState(0);
  const [isWatched, setIsWatched] = useState(false);
  const checkWatched = () => {
    let found = false; // Flag to check if the movie is found in the watched list
    watched.forEach((element) => {
      if (element.imdbID === id) {
        setUserRating(element.userRating);
        setIsWatched(true);
        found = true; // Set flag to true if movie is found
      }
    });
    if (!found) {
      // If the movie is not found in the watched list, reset the states
      setUserRating(0);
      setIsWatched(false);
    }
  };
  const {
    Title: title,
    Runtime: runtime,
    Poster: poster,
    Released: released,
    Year: year,
    imdbRating,
    Actors: actors,
    Director: director,
    Genre: genre,
    Plot: plot,
  } = selectedMovie;
  const handleAddMovie = () => {
    const newWatchedMovie = {
      imdbID: id,
      title,
      poster,
      year,
      runtime: Number(runtime.split(" ")[0]),
      imdbRating: Number(imdbRating),
      userRating,
    };
    onAdd(newWatchedMovie);
    onClose(null);
  };
  useEffect(() => {
    async function fetchMovie() {
      const res = await fetch(`http://www.omdbapi.com/?apikey=${key}&i=${id}`);
      const data = await res.json();
      setSelectedMovie(data);
    }

    fetchMovie();
  }, [id]);
  useEffect(() => {
    checkWatched();
    return () => {
      setUserRating(0);
    };
  }, [id]);

  useEffect(() => {
    if (!title) return;
    document.title = title;
    return function () {
      document.title = "usePopcorn";
    };
  }, [title]);
  return (
    <div className="details">
      <header>
        <button className="btn-back" onClick={() => onClose(null)}>
          &larr;
        </button>
        <img src={poster} alt={`${title} poster`}></img>
        <div className="details-overview">
          <h2>{title}</h2>
          <p>
            {released} &bull; {selectedMovie.Runtime}
          </p>
          <p>{genre}</p>
          <p>
            <span>⭐</span>
            {imdbRating} IMDb rating
          </p>
        </div>
      </header>
      <section>
        <div className="rating">
          <StarComponent
            size={22}
            onSetRating={setUserRating}
            defaultRating={userRating}
          />
          {userRating > 0 && !isWatched && (
            <button className="btn-add" onClick={handleAddMovie}>
              + Add to list
            </button>
          )}
        </div>
        <p>
          <em>{plot}</em>
        </p>
        <p>Starring : {actors}</p>
        <p>Directed by : {director}</p>
      </section>
    </div>
  );
};

const Box = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && <>{children}</>}
    </div>
  );
};

const MovieList = ({ movies, onSelect }) => {
  return (
    <ul className="list list-movies">
      {movies.map((movie) => (
        <Movie key={movie.imdbID} movie={movie} onSelect={onSelect} />
      ))}
    </ul>
  );
};

const Movie = ({ movie, onSelect }) => {
  return (
    <li
      onClick={() =>
        onSelect((id) => (id === movie.imdbID ? null : movie.imdbID))
      }
    >
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
};

const Loader = () => {
  return <p className="loader">Loading...</p>;
};
