
# Project Title

A brief description of what this project does and who it's for

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

### Database Setup

- Use PostgreSQL with TypeORM for database operations.

### Entity

- Create `user.entity` in the entity folder to represent the User model.

## Installation
```bash
$ npm install

```


### Get Users

- **Endpoint**: `/getUsers`
- **Description**: Retrieve all users.
- **Response**: Display all users as a response.

### Create User

- **Endpoint**: `/createUser`
- **Description**: Create a new user.
- **Validation**: Check if the user already exists.
- **Security**: Hash the user's password using bcrypt.


## Running the App
```bash

# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```
## Running Tests

To run tests, run the following command

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```


## License


This README includes details about setting up PostgreSQL with TypeORM, creating a `user.entity`, defining routes for getting users and creating users, and adding relevant tests using Jest, all in one file.

key:-e4yJTctgkBwxWU4njhHj


