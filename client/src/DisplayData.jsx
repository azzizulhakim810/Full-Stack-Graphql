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

const QUERY_ALL_MESSAGES = gql`
  query GetAllMessages {
    messages {
      id
      title
      content
    }
  }
`;

const GET_USER_BY_NAME = gql`
  query UserByName($name: String!) {
    userByName(name: $name) {
      id
      name
      age
      username
      nationality
    }
  }
`;

const CREATE_USER_MUTATION = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      age
      name
      username
    }
  }
`;

const DELETE_USER_MUTATION = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

function DisplayData() {
  const [nameSearched, setNameSearched] = useState("");

  // Create User States
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [age, setAge] = useState(0);
  const [nationality, setNationality] = useState("");

  const { data, loading, refetch, error } = useQuery(QUERY_ALL_USERS);

  // console.log(data.users.users);

  const { data: messageData, error: messageError } =
    useQuery(QUERY_ALL_MESSAGES);

  const [fetchUser, { data: userSearchedData, error: userError }] =
    useLazyQuery(GET_USER_BY_NAME);

  const [createUser] = useMutation(CREATE_USER_MUTATION);

  const [deleteUser] = useMutation(DELETE_USER_MUTATION);

  if (loading) {
    return <h3>DATA IS LOADING...</h3>;
  }

  if (error) {
    console.error("Error fetching users:", error);
    return <h5>Error fetching users</h5>;
  }

  if (messageError) {
    console.error("Error fetching messages:", messageError);
    return <h5>Error fetching messages</h5>;
  }

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
                input: {
                  name: name.toLowerCase(),
                  username: username.toLowerCase(),
                  age: Number(age),
                  nationality,
                },
              },
            })
              .then(() => {
                refetch(); // Optionally, refetch data after successful mutation
              })
              .catch((error) => {
                console.error("Error creating user:", error);
              });
          }}
        >
          Create User
        </button>
      </div>

      {/* Users */}
      <div className="data">
        <div className="child">
          <h2>Users</h2>
          {data &&
            data.users.users.map((user) => (
              <div key={user.id}>
                <hr />
                <p>Name: {user.name.toUpperCase()}</p>
                <p>Age: {user.age}</p>
                <p>Nationality: {user.nationality}</p>
                <p>Username: {user.username}</p>
                <div className="user-options">
                  <button
                    className="btn-custom"
                    onClick={() => {
                      deleteUser({
                        variables: {
                          id: user.id,
                        },
                      })
                        .then(() => {
                          refetch();
                        })
                        .catch((error) => {
                          console.error("Error deleting user:", error);
                        });
                    }}
                  >
                    Delete User
                  </button>
                </div>
              </div>
            ))}
        </div>

        {/* Messages */}
        <div className="child">
          <h2>Messages</h2>
          {messageData &&
            messageData.messages.map((message) => (
              <div key={message.id}>
                <hr />
                <h4>Title: {message.title}</h4>
                <p>Desc: {message.content}</p>
              </div>
            ))}
        </div>

        {/* Search Users */}
        <div className="child">
          <h2>Search Users</h2>
          <hr />
          <input
            className="input-field"
            type="text"
            placeholder="User name..."
            onChange={(event) => {
              setNameSearched(event.target.value.toLowerCase());
            }}
          />
          <button
            className="btn-custom"
            onClick={() => {
              fetchUser({
                variables: {
                  name: nameSearched,
                },
              });
            }}
          >
            Fetch Data
          </button>
          <div>
            {userSearchedData && (
              <div>
                <p>Name: {userSearchedData.userByName.name.toUpperCase()}</p>
                <p>Age: {userSearchedData.userByName.age}</p>
                <p>Username: {userSearchedData.userByName.username}</p>
                <p>Nationality: {userSearchedData.userByName.nationality}</p>
              </div>
            )}
            {userError && <h5> There was an error fetching the data</h5>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DisplayData;
