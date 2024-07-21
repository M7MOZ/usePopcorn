import { useState, useEffect } from "react";
export function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [isLoding, setIsLoding] = useState(false);
  const [error, setError] = useState("");
  const key = "3b245415";
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
  return { movies, isLoding, error };
}
