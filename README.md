# Introduction

Storychat is a nice sandbox for playing with a bunch of web technologies.

# Getting up and running

* Clone the repo
* `make deps`
* Create a postgres database using the `createdb` utility.
* Copy `config/db.example.json` to `config/db.json` and edit it with the proper
  information for connection.
* Copy `config/app.example.json` to `config/app.json` and give it
  reasonable-large and unique secrets.
* `make db`
* `make run`
