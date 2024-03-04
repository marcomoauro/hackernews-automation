import puppeteer from 'puppeteer';
import nanoid from "nano-id";
import axios from 'axios';
import {query} from '../src/database.js';
import {completionByAI} from "../src/api/completionByAI.js";
import {DateTime} from "luxon";

const HOURS_TO_POST = process.env.HOURS_TO_POST.split(',').map((h) => parseInt(h.trim()))

const main = async () => {
  const now = DateTime.now().setZone('Europe/Rome')
  if (!HOURS_TO_POST.includes(Number(now.toFormat('H')))) {
    process.exit(0)
  }

  console.log('Start publishing post')

  await publish()

  process.exit(0)
}

const publish = async () => {
  const url = await changeFrontendSiteName()

  const {post_id, post_title, post_path, post_text} = await computePost()

  const post_url = `${url}${post_path}`

  await loginHackerNewsAndPublishPost({post_title, post_url, post_text})

  await createSiteTitle(url)
  await createSubmission({post_id, post_title, post_url, post_text})
}

const computePost = async () => {
  const [post] = await query(`
      select *
      from posts p
      where is_pickable = true
        and exists(select * from submissions s where s.post_id = p.id)
      order by rand()
      limit 1
  `)

  const [{title: old_title, text: old_text}] = await query(`
      select title, text
      from submissions
      where post_id = ?
      order by rand()
      limit 1
  `, [post.id])

  const old_titles = await query(`
      select title
      from submissions
      where post_id = ?
  `, [post.id])

  let post_title = await completionByAI({
    system_message: `riformula questo titolo in inglese per creare un post su HackerNews. Deve essere creativo, stimolare il click e diverso dai seguenti titoli: "${old_titles.join('; ')}"`,
    user_message: old_title,
    system_message2: 'rispondi in inglese con solo il titolo'
  })

  post_title = post_title.replace(/"/g, '')

  const post_text = await completionByAI({
    system_message: 'riformula questo commento in inglese per creare un post su HackerNews:',
    user_message: old_text,
    system_message2: 'rispondi in inglese con solo il commento'
  })

  return {
    post_id: post.id,
    post_title,
    post_path: post.path,
    post_text
  }
}

const createSiteTitle = async (url) => {
  await query(`
      insert into site_titles (title)
      values (?)
  `, [url])
}

const createSubmission = async ({post_id, post_title, post_url, post_text}) => {
  await query(`
      insert into submissions (post_id, title, url, text)
      values (?, ?, ?, ?)
  `, [post_id, post_title, post_url, post_text])
}

const changeFrontendSiteName = async () => {
  const body = {
    name: nanoid(10)
  };

  const {data: {default_domain}} = await axios.patch(`https://api.netlify.com/api/v1/sites/${process.env.NETLIFY_SITE_ID}`, body, {
    headers: {
      'Authorization': `Bearer ${process.env.NETLIFY_OAUTH_TOKEN}`,
      'Content-Type': 'application/json'
    }
  })

  return `https://${default_domain}/`
}

const loginHackerNewsAndPublishPost = async ({post_title, post_url, post_text}) => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'], headless: true});
  const login_page = await browser.newPage();
  await login_page.goto('https://news.ycombinator.com/login');

  await login_page.waitForSelector('input[name="acct"]');
  await login_page.type('input[name="acct"]', process.env.HACKERNEWS_USERNAME);

  await login_page.waitForSelector('input[name="pw"]');
  await login_page.type('input[name="pw"]', process.env.HACKERNEWS_PASSWORD);

  await login_page.waitForSelector('input[type="submit"]');
  await login_page.click('input[type="submit"]');

  const submit_page = await browser.newPage();
  await submit_page.goto('https://news.ycombinator.com/submit');

  await submit_page.waitForSelector('input[name="title"]');
  await submit_page.type('input[name="title"]', post_title);

  await submit_page.waitForSelector('input[name="url"]');
  await submit_page.type('input[name="url"]', post_url);

  await submit_page.waitForSelector('textarea[name="text"]');
  await submit_page.type('textarea[name="text"]', post_text);

  await submit_page.waitForSelector('input[type="submit"]');
  await submit_page.click('input[type="submit"]');
}

main()