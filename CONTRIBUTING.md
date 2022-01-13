Submitting Issues
=================

If you are submitting a bug, please create a [jsfiddle](http://jsfiddle.net/) demonstrating the issue.

Read before submitting Pull Requests
====================================

 * Please submit all pull requests to the `develop` branch. **All others will be dropped**
 * This assumes any feature/fix branches are complete and ready to be pulled in.

Code organization
=================

All code is placed under `src/`.

The `main.js` allows us to load in multiple bots. Each bot is loaded through it.

Each bot has its own directory and `.js` file under `src/discord`.

Bots like `SOV Sage` have commands, to help organize them they are coded as modules in the `commands` directory. The directory is scanned and commands loaded automaticaly. To add a new command all you need to do is create a new file/direcotry like a current command (look in `src/discord/sovSage/commands` for examples) then code from there.

Setting up development environment
==================================

Tools you'll need to get this running:
[git](http://git-scm.com/) and
[nvm](https://github.com/creationix/nvm) for node version management, currently using... (check `.nvm` file at repo root)
[node](http://nodejs.org/); you might use
[docker](https://docs.docker.com/get-docker/) if your interested in building it into an image.

```bash

git clone https://github.com/DistributedCollective/SOV-Sage.git
cd sov-sage
npm install -g grunt-cli
npm install
git checkout develop  # all patches against develop branch, please!
grunt                 # this runs tests, eslint and prettier-check

# To run:
cp .env-example .env # fill out .env with discord bot tokens
npm run dev # you'll want to fill out .env
```

**Note:** You can use the following commands to fix eslint and prettier issues:
```
npm run prettier-fmt

# wont fix all eslint issues, but some can be
npm run eslint --fix
```
