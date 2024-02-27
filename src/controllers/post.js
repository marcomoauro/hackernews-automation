import log from "../log.js";
import Post from "../models/Post.js";

export const getPostUrlByPath = async ({path}) => {
  log.info('Controller::Post::getPostUrlByPath', {path})

  const post = await Post.getByPath(path)

  return {url: post.url}
}