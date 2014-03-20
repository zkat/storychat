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
* `make run-dev`

# Development and Hacking on Storychat

1. Don't push to develop.
1. Create a new branch prefixed with "dev/" for specific fixes and features.
1. Test your code! (Client-side tests depend on [PhantomJS](https://github.com/ariya/phantomjs/))
1. When ready to merge/rebase, have someone else review the branch and signoff on it.
