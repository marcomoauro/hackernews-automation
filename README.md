# HackerNews Automation

HackerNews Post Publisher in Node.js.

I talk about this project in this episode of my tech newsletter: https://implementing.substack.com/p/how-i-hacked-hackernews
## Requirements

Node version >= 20

## Install dependencies

```sh
yarn install
```

## How to use

- Create the .env file based on the env-template, the only env to configure is DATABASE_URL, leave it empty for now, you can configure it later.
- Starts the server by executing:
```sh
yarn serve:development
```
- Run the daemon locally with:
```sh
yarn publish-local
```

## How to Deploy on Heroku
- I have shown how to do it in this [guide](https://implementing.substack.com/p/how-to-deploy-a-nodejs-application).
- To run the code periodically I used the free [addon Heroku Scheduler](https://implementing.substack.com/i/140962087/heroku-scheduler), 
it has the problem that it is not possible to specify to run the script only at the hours I want, 
so I set that I run it every hour and I manage in the daemon the execution of the script, if it is not the time I configured then it ends immediately.
- Add the buildpack for Puppeteer: "https://github.com/jontewks/puppeteer-heroku-buildpack" in "Settings" -> "Buildpacks" -> "Add buildpack"
