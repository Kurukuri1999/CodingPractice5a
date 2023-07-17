const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");
const db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertMovieDbObjectToResponseObject=(dbObject)=>{
    return{
        movieId:dbObject.movie_id,
        directorId:dbObject.director_id,
        movieName:dbObject.movie_name,
        leadActor:dbObject.lead_actor,
    };
};

const convertDirectorDbObjectToResponseObject=(dbObject)=>{
    return{
        directorId:dbObject.director_id,
        directorName:dbObject.director_name,
    };
};

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    select movie_name from movie;
    `;
  const movieArray = await db.all(getMoviesQuery);
  response.send(
    movieArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

app.get("/movies/:movieId/", async (request, response) => {
  const movieId = request.params;
  const getMovieQuery = `
    select * from movie where  movie_id=${movieId};
    `;
  const movieArray = await db.get(getMovieQuery);
  response.send(convertMovieDbObjectToResponseObject(movieArray)
  );
});

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
    insert into movie(director_id,movie_name,lead_actor) values (${directorId},'${movieName}','${leadActor}');
    `;
  const dbResponse = await db.run(addMovieQuery);
  response.send("Movie successfully Added");
});

app.put("/movies/:movieId/", async (request, response) => {
  const movieDetails = request.body;
  const movieId = request.params;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
    update movie set director_id=${directorId},movie_name='${movieName}',lead_actor='${leadActor}' where movie_id=${movieId};
    `;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const movieId = request.params;

  const deleteMovieQuery = `
   delete from movie where movie_id=${movieId};
    `;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    select * from director order by director_id;
    `;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(
    directorsArray.map((eachDirector) => (convertDirectorDbObjectToResponseObject(eachDirector))
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const directorId = request.params;
  const getDirectorMoviesQuery = `
    select * from movie where director_id=${directorId};
    `;
  const directorMoviesArray = await db.all(getDirectorMoviesQuery);
  response.send(
    directorMoviesArray.map((eachDirectorMovie) => ({
      movieName: eachDirectorMovie.movie_name,
    }))
  );
});

module.exports=app;
