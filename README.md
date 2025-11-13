# Final Project - Proposal

## An elevator pitch of your project (something you can say in less than 1 minute)

The application will be for Steam where we track a users achievements and displays them. We can get these using the Steam API

## The names of the contributors (if you are working with a partner)

None

## A rough list of features (this needs to be large enough to satisfy the "scope" requirements)

The agent will be able to pull up videos for achivements to show the user how to get them. (Feed 5-10 videos/ descriptions, have it choose the most relevent. Display 3 most important to users)

The agent will be able to detect events in games and notify user of the event.

The agent will be able to track time on game and turn on alarm to notify user when they reach a set time( User sets the time )

The agent will be able to give a random list of achievements to the user for a game they specify, so it makes it more fun. 

## A list of new things you will need to do to accomplish your project (e.g. websockets)

Will need to learn how to have the AI pull up specific videos to give to the user

Will need to learn how to keep the AI running in background to interactivly mark items as finished.



## Pages/ Views

Each game achivements will be displayed on one template page but there will be tabs to switch between games. If organized in a section the sections games will be in the tabs layout to navigate between games.

Have all the games organized on a main page.

Page where you can save Youtube videos for the achievements you want to go for.

Page for todo achivements list

Page that shows the achivement with its description and the youtube videos pulled from the api

Home page describing the website.

Settings page

Confirm popups

## Features

Organize games, based on filters

Data syncronization

Timer

Notifications

Video Recommendation

Save Videos

Save achivements list

## Proof of concept

The agent will be able to pull up videos for achivements to show the user how to get them.

Had help with AI to even see if it was possible. Gave me ways to pull up youtube video results and the first result. I'm thinking this could be loaded in a component for the user.

## Optional Feature

If an open world game that requires collectibles, Agent can pull up interactive map that auto syncs your game with it every 10 seconds to keep it up on current info. 

## Project Schedule

### Oct 29

#### Estimates:

Rubric items:
- [x] CI/CD Pipeline: Set up CI/CD Pipeline to auto run linting and the kubernetes
- [x] Setup kubernetes files to have a live production enviornment
- [x] Tests run in pipeline aborts if they fail

Features:
- [x] Barebones react/typescript webpage
- [x] barebone tests to see if they run in pipeline and if aborts on fail


#### Delivered

Rubric Items:
- [x] CI/CD Pipeline: Set up CI/CD Pipeline to auto run linting and the kubernetes
- [x] Tests run in pipeline aborts if they fail
Features:
- [x] Barebones react/typescript webpage
- [x] barebone tests to see if they run in pipeline and if aborts on fail

### Nov 1

#### Estimates:

Rubric items:
- [x] Keycloak Authentification
- [x] Toasts
- [x] Error handling

Features:
- [x] Login page startup
- [x] Toast popups for errors and notifications
- [x] Button to test errors 

#### Delivered

Rubric Items:
- [x] Keycloak Authentification
- [x] Toasts
- [x] Error handling

Features:
- [x] Login page startup
- [x] Toast popups for errors and notifications
- [x] Button to test errors 

### Nov 5

#### Estimates:

Rubric items:
- [x] Authentication and user account support
- [x] Authorized pages and public pages
- [x] Tanstack query
- [x] 3 views/pages

Features:
- [x] Settings page 
- [x] Home page Unauthorized
- [x] Games list page Authorized
- [x] Setup tanstack query for api calls

#### Delivered

Rubric items:
- [x] Authentication and user account support
- [x] Authorized pages and public pages
- [x] Tanstack query
- [x] 3 views/pages

Features:
- [x] Settings page 
- [x] Home page Unauthorized
- [x] Games list page Authorized
- [x] Setup tanstack query for api calls

### Nov 8

#### Estimates:

Rubric items:
- [x] 2 views/pages

Features:
- [x] Todo achivements list page
- [x] Saved YouTube videos Page

#### Delivered

Rubric items:
- [x] 2 views/pages

Features:
- [x] Todo achivements list page
- [x] Saved YouTube videos Page


### Nov 12

#### Estimates:

Rubric items:
- [x] Network Calls that read and write data

Features:
- [x] Connection to Steam api that pulls the games of user and displays on frontend
- [x] Connection to Youtube api that pulls videos of achievements and displays on frontend

#### Delivered

Rubric items:
- [x] Network Calls that read and write data

Features:
- [x] Connection to Steam api that pulls the games of user and displays on frontend
- [x] Connection to Youtube api that pulls videos of achievements and displays on frontend

### Nov 15

#### Estimates:

Rubric items:
- item 1 with description
- item 2 with description

Features:
- feature 4 with description
- feature 5 with description

#### Delivered

Rubric Items:


Features:

### Nov 19

#### Estimates:

Rubric items:
- item 1 with description
- item 2 with description

Features:
- feature 4 with description
- feature 5 with description

#### Delivered

Rubric Items:


Features:

### Nov 22

#### Estimates:

Rubric items:
- item 1 with description
- item 2 with description

Features:
- feature 4 with description
- feature 5 with description

#### Delivered

Rubric Items:


Features:

### Nov 25

#### Estimates:

Rubric items:
- item 1 with description
- item 2 with description

Features:
- feature 4 with description
- feature 5 with description

#### Delivered

Rubric Items:


Features:

### Dec 3

#### Estimates:

Rubric items:
- item 1 with description
- item 2 with description

Features:
- feature 4 with description
- feature 5 with description

#### Delivered

Rubric Items:


Features:

### Dec 6

#### Estimates:

Rubric items:
- item 1 with description
- item 2 with description

Features:
- feature 4 with description
- feature 5 with description

#### Delivered

Rubric Items:


Features:
