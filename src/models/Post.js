import log from '../log.js'
import {query} from '../database.js'
import {APIError404} from "../errors.js";

export default class Post {
  id
  path
  url

  constructor(properties) {
    Object.keys(this)
      .filter((k) => typeof this[k] !== 'function')
      .map((k) => (this[k] = properties[k]))
  }

  static fromDBRow = (row) => {
    const post = new Post({
      id: row.id,
      path: row.path,
      url: row.url,
    })

    return post
  }

  static getByPath = async (path) => {
    log.info('Model::Post::getByPath', {path})

    const rows = await query(`
        select *
        from posts
        where path = ?
    `, [path]);

    if (rows.length !== 1) throw new APIError404('Post not found.')

    const post = Post.fromDBRow(rows[0])

    return post
  }
}
