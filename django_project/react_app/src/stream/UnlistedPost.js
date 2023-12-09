import { useState, useEffect } from "react"

import SERVER_ADDR from "../serverAddress";
import ReactMarkdown from 'react-markdown';

export default function UnlistedPost() {
  const [post, setPost] = useState({})

  const urlParams = new URLSearchParams(window.location.search);
  const postID = urlParams.get('post');
  const authorID = urlParams.get('user');
  useEffect(() => {
    fetch(`${SERVER_ADDR}unlisted/authors/${authorID}/posts/${postID}`)
      .then((res) => {
        if (res.ok) {
          console.log(res)

          res.json().then((json) => {
            console.log(json, "rizzy")
            setPost(json)
          })
        }
        else {
          console.log(res, "not rizzy")
          alert('Could NOT find post :(')
        }
      })
  }, [])
  return <>
    <h1> POST</h1>
    <div style={{ display: "flex", height: "70vh", justifyContent: "center", alignItems: "center" }}>

      {
        post.id &&
        <div className="d-flex align-items-center mb-5">
          <i className="bi bi-person-circle" style={{ fontSize: '2rem', marginRight: '10px' }}></i>
          <small>{post.author.displayName}</small>
        </div>
      }
      {post.contentType == "text/plain" ? <div>{post.content}</div> : <ReactMarkdown>{post.content}</ReactMarkdown>}

    </div>

  </>
}