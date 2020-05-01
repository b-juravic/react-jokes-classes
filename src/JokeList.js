import React, { useState, useEffect } from "react";
import axios from "axios";
import Joke from "./Joke";
import "./JokeList.css";

/** List of jokes. */

function JokeList({ numJokesToGet=5 }) {
  const [jokes, setJokes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
 
  /* at mount, get jokes */

  useEffect(function getJokesOnlyOnInitialLoad() {
    getJokes();
  }, [])


  /* retrieve jokes from API */

  async function getJokes() {
    try {
      // load jokes one at a time, adding not-yet-seen jokes
      let jokeList = [];
      let seenJokes = new Set();

      while (jokeList.length < numJokesToGet) {
        let res = await axios.get("https://icanhazdadjoke.com", {
          headers: { Accept: "application/json" }
        });
        let { ...joke } = res.data;

        if (!seenJokes.has(joke.id)) {
          seenJokes.add(joke.id);
          jokeList.push({ ...joke, votes: 0 });
        } else {
          console.log("duplicate found!");
        }
      }
      setJokes(jokeList);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
    }
  }

  /* empty joke list, set to loading state, and then call getJokes */

  function generateNewJokes() {
    setIsLoading(true);
    getJokes();
  }

  /* change vote for this id by delta (+1 or -1) */

  function vote(id, delta) {
    setJokes(oldJokes => 
      oldJokes.map(j => j.id === id 
        ? {...j, votes: j.votes + delta} 
        : j ));
  }

  /* sorts the jokes state based on vote value. Returns sorted array of joke components. */

  function sortJokes() {
    let sortedJokes = [...jokes].sort((a, b) => b.votes - a.votes);
    return (
      sortedJokes.map(({joke , id, votes}) => (
        <Joke
          text={joke}
          key={id}
          id={id}
          votes={votes}
          vote={vote}
        />))
    )
  }

/* render: either loading spinner or list of sorted jokes. */

  return (
   <div>
      {isLoading
        ? <div className="loading">
            <i className="fas fa-4x fa-spinner fa-spin" />
          </div>
        : <div className="JokeList">
            <button
              className="JokeList-getmore"
              onClick={generateNewJokes}
            >
              Get New Jokes
            </button>
            {sortJokes()}
          </div>
      }
   </div> 
  )
  
}

export default JokeList;
