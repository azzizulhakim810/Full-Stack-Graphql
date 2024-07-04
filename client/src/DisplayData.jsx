import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { useState } from "react";

const QUERY_ALL_USERS = gql`
  query GetAllUsers {
    users {
      ... on UserSuccessfullResult {
        users {
          id
          name
          age
          username
          nationality
        }
      }

      ... on UserErrorResult {
        message
      }
    }
  }
`;

const QUERY_ALL_MOVIES = gql`
  query GetAllMovies {
    movies {
      name
    }
  }
`;

const GET_MOVIE_BY_NAME = gql`
  query Movie($name: String!) {
    movie(name: $name) {
      name
      yearOfPublication
    }
  }
`;

const CREATE_USER_MUTATION = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      name
      id
    }
  }
`;

const DELETE_USER_MUTATION = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      id
    }
  }
`;

function DisplayData() {
  const [movieSearched, setMovieSearched] = useState("");

  // const [updatedUsername, setUpdatedUsername] = useState("");

  // Create User States
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [age, setAge] = useState(0);
  const [nationality, setNationality] = useState("");

  const { data, loading, refetch } = useQuery(QUERY_ALL_USERS);

  const { data: movieData } = useQuery(QUERY_ALL_MOVIES);

  const [fetchMovie, { data: movieSearchedData, error: movieError }] =
    useLazyQuery(GET_MOVIE_BY_NAME);

  const [createUser] = useMutation(CREATE_USER_MUTATION);

  const [deleteUser] = useMutation(DELETE_USER_MUTATION);

  if (loading) {
    return <h3> DATA IS LOADING...</h3>;
  }

  // console.log(updatedUsername);

  return (
    <div>
      {/* Create User */}

      <div className="input-fields">
        <input
          type="text"
          placeholder="Name..."
          onChange={(event) => {
            setName(event.target.value);
          }}
        />
        <input
          type="text"
          placeholder="Username..."
          onChange={(event) => {
            setUsername(event.target.value);
          }}
        />
        <input
          type="number"
          placeholder="Age..."
          onChange={(event) => {
            setAge(event.target.value);
          }}
        />
        <input
          type="text"
          placeholder="Nationality..."
          onChange={(event) => {
            setNationality(event.target.value.toUpperCase());
          }}
        />
        <button
          onClick={() => {
            createUser({
              variables: {
                input: { name, username, age: Number(age), nationality },
              },
            });

            refetch();
          }}
        >
          Create User
        </button>
      </div>

      {/* Mutation User  */}
      <div className="data">
        {/* Username  */}
        <div className="child">
          <h2>Users</h2>

          {data &&
            data.users.users.map((user) => {
              return (
                <div key={user.id}>
                  <hr />

                  <p>Name: {user.name}</p>

                  <p>Age: {user.age}</p>
                  <p>Nationality: {user.nationality}</p>
                  <p>Username: {user.username}</p>

                  <div className="user-options">
                    {/* <input
                      // className="input-field"
                      // type="text"
                      // placeholder="new username..."
                      // onChange={(event) => {
                        // setUpdatedUsername(event.target.value);
                      // }}
                   //  /> */}
                    {/*  <button
                        className="btn-custom"
                        onClick={() => {
                          fetchMovie({
                            variables: {
                              name: movieSearched,
                            },
                          });
                        }}
                      >
                        Update
                      </button> */}

                    <button
                      className="btn-custom"
                      onClick={() => {
                        deleteUser({
                          variables: {
                            id: user.id,
                          },
                        });

                        refetch();
                      }}
                    >
                      Delete User
                    </button>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Movie Names  */}
        <div className="child">
          <h2>Movies</h2>
          {movieData &&
            movieData.movies.map((movie) => {
              return (
                <div key={movie.id}>
                  <hr />
                  <p>Movie Name: {movie.name}</p>
                </div>
              );
            })}
        </div>

        {/* Search Movies */}
        <div className="child">
          <h2>Search Movies</h2>
          <hr />
          <input
            className="input-field"
            type="text"
            placeholder="Interstellar..."
            onChange={(event) => {
              setMovieSearched(event.target.value);
            }}
          />
          {
            <button
              className="btn-custom"
              onClick={() => {
                fetchMovie({
                  variables: {
                    name: movieSearched,
                  },
                });
              }}
            >
              Fetch Data
            </button>
          }
          <div>
            {movieSearchedData && (
              <div>
                <p>MovieName: {movieSearchedData.movie.name}</p>
                <p>
                  Year Of Publication:{" "}
                  {movieSearchedData.movie.yearOfPublication}
                </p>{" "}
              </div>
            )}
            {movieError && <h5> There was an error fetching the data</h5>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DisplayData;
