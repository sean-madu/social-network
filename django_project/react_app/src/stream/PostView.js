/**
 * Component to view a post, This should be ideally used in a Stream as a collection of posts
 * props {
 *  proxy: a boolean to remove unnecessary features and just display the content of the post
 *  user: a boolean to Allow for editing the post and other things only the maker of the post can do
 *  post: JSON object of the post to show
 *  setPosts: function to tell parent component to set posts state (useful for when we do something to change a post like liking it)
 *  getPosts: function to tell parent component to refresh posts
 * }
 */



import { useState, useEffect } from "react";
import Post from "../createPost/Post";
import SERVER_ADDR from "../serverAddress";
import Comment from "./Comment";
import * as NODES from "../Nodes"
import ReactMarkdown from 'react-markdown';
import { refreshCookies } from "../getCookies";
import getCookie from "../getCookies";
import { json } from "react-router-dom";


export default function PostView(props) {



  const fetchAuthorDetails = (id, redo = true) => {
    if (id.startsWith(SERVER_ADDR)) {
      return fetch(`${id}`, { headers })
      .then((res) => {
        if (res.ok) {

          return res.json().then((json) => {
            setUsername(json.displayName)
          })
        }
        //Assuming we are only unauthorized because of bad tokens. If we are removed as  node this will render the sme result
        else if (res.status == 401 && redo) {
          refreshCookies(() => {

            headers = { 'Authorization': `Bearer ${getCookie("access")}` }

            fetchAuthorDetails(id, false);
          })
        }
        else {
          //alert(`error could not get ${id}`);
          console.log(res);
        }
      })
      .catch((err) => console.log(err, props.post))
    }
    else {
      return NODES.executeOnRemote((json) => { setUsername(json.displayName) },
        "GET", id, false, null, id)
    }

  }

  const fetchComments = (post_id, redo = true) => {
    if (post_id.endsWith("/")) {
      post_id = post_id.substring(0, post_id.length - 1)
    }
    if (post_id.startsWith(SERVER_ADDR)) {

      return fetch(`${post_id}/comments/`, { headers })
      .then((res) => {
        if (res.ok) {
          res.json().then((json) => {
            if (json.items !== undefined) {
              setComments(json.items)
            }
            else {
              setComments(json)
            }

          })
        }
        else if (res.status == 401 && redo) {
          refreshCookies(() => {
            headers = { 'Authorization': "Bearer " + getCookie("access") }
            fetchComments(post_id, false)
          })
        }
        else {
          //alert(`error could not get ${post_id} comments`)
          console.log(res, "comments failed")
          res.json().then((json) => {
            console.log(json)
          })
        }
      })
    }
    else {
      return NODES.executeOnRemote((json) => {
        console.log(json, "Remote comment")
        if (json.items !== undefined) {
          setComments(json.items)
        }
        else if (json.comments !== undefined) {
          setComments(json.comments)
        }
        else {
          setComments(json)
        }

      }, "GET", `${post_id}/comments/`, false
        , null, post_id)
    }

  }

  let post = props.post;
  const remote = !post.id.startsWith(SERVER_ADDR)
  //TODO If remote modify the headers of the request to use basic auth instead of token,
  //TODO also change refresh headers to allow remote headers 
  let headers = { 'Authorization': `Bearer ${getCookie("access")}` }

  const [editing, setEditing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [username, setUsername] = useState("");
  const [comments, setComments] = useState([]);
  const [hitSubmit, setHitSubmit] = useState(false);
  const [likes, setLikes] = useState([]);
  const [showLikes, setShowLikes] = useState(false)
  const [image, setImage] = useState([])
  const [postContent, setPostContent] = useState(props.post.content)

  let authorId = post.author.id
  fetchAuthorDetails(authorId);

  const fetchLikes = (redo = true) => {
    //Fetch Likes
    let headers = { 'Authorization': "Bearer " + getCookie("access") }
    fetch(post.id + "/likes", {
      headers

    })
      .then((res) => {
        if (res.ok) {
          res.json().then((json) => {
            setLikes(json.items)
          })
        }
        else if (res.status == 401 && redo) {
          refreshCookies(() => {
            fetchLikes(false)
          })
        }
        else {
          res.text().then((T) => console.log(T))
        }
      })
  }



  useEffect(() => {
    fetchComments(post.id)


  }, [hitSubmit]);

  useEffect(() => {
    fetchLikes()
  }, [showLikes])

  useEffect(() => {
    renderContent()
  }, [])

  const handleInputChange = (e) => {
    setCommentContent(e.target.value);
  };

  const handleHeartClick = (postId, redo = true) => {
    if (postId.startsWith(SERVER_ADDR)) {
      //Fetch author and send a like to inbox
      let headers = { 'Authorization': "Bearer " + getCookie("access") }
      headers["Content-type"] = "application/json; charset=UTF-8"
      let userID = `${new URLSearchParams(window.location.search).get('user')}`
      fetch(`${SERVER_ADDR}service/authors/${userID}`, { headers })
        .then((res) => {
          if (res.ok) {
            res.json().then((author) => {
              let url = postId.slice(0, postId.indexOf("/posts/"))
              url += "/inbox/"
              fetch(url,
                {
                  headers: {
                    'Authorization': "Bearer " + getCookie("access"),
                    "Content-type": "application/json; charset=UTF-8"
                  },
                  body: JSON.stringify({
                    summary: "someone from team good liked your post",
                    type: "Like",
                    author: author,
                    object: postId,
                  }),
                  method: "POST"
                })
                .then((res) => {
                  if (res.ok) {
                    alert("Like sent!")
                  }
                  else if (res.status == 401 && redo) {
                    handleHeartClick(postId, false)
                  }
                  else {
                    res.text().then((t) => { console.log(t) })
                  }
                })
            })
          }
          else if (res.status == 401 && redo) {
            refreshCookies(() => {
              handleHeartClick(postId, false)
            })
          }
          else {
            res.text().then((t) => console.log(t, "could not get author for comment post"))
          }
        })

    } else {

    }
  };



  const handleDelete = (postId, redo = true) => {

    headers["Content-type"] = "application/json; charset=UTF-8"

    fetch(`${post.id}`,
      {
        method: "DELETE",
        headers
      })

      .then((res) => {
        //TODO Handle a failed delete
        if (res.ok) {

          props.getPosts()

        }
        else if (res.status == 401 && redo) {
          refreshCookies(() => {
            headers = { 'Authorization': "Bearer " + getCookie("access") }
            handleDelete(postId, false)
          })
        }
        else {
          console.log(res)
          res.text().then((t) => { console.log(post); console.log(t) })
        }
      })
    delete headers["Content-type"]

  }


  const handleEdit = (postId) => {
    setEditing(!editing);
  }

  const getAuthorJson = (post_id, redo = true) => {
    let headers = { 'Authorization': "Bearer " + getCookie("access") }
    headers["Content-type"] = "application/json; charset=UTF-8"
    let userID = `${new URLSearchParams(window.location.search).get('user')}`
    fetch(`${SERVER_ADDR}service/authors/${userID}`, { headers })
      .then((res) => {
        if (res.ok) {
          res.json().then((author) => {
            fetch(`${post_id}/comments/`,
              {
                method: "POST",
                body: JSON.stringify({
                  "comment": commentContent,
                  "author": author
                }),
                headers
              })

              .then((res) => {
                if (res.ok) {
                  alert("Comment submitted")
                  setHitSubmit(!hitSubmit)
                }
                else if (res.status == 401 && redo) {
                  refreshCookies(() => {
                    headers = { 'Authorization': "Bearer " + getCookie("access") }
                    handleCommentSubmit(false)

                  })
                }
                else {
                  res.text().then((json) => console.log(json))
                }
              })
          }
          )
        }
        else if (res.status == 401 && redo) {
          refreshCookies(() => {
            getAuthorJson(post_id, false)
          })
        }
        else {
          res.text().then((t) => console.log(t, "could not get author for comment post"))
        }
      })
  }

  //TODO post to inboxes instead?
  const handleCommentSubmit = (redo = true) => {
    let post_id = post.id
    if (post_id.endsWith("/")) {
      post_id = post_id.substring(0, post_id.length - 1)
    }
    headers["Content-type"] = "application/json; charset=UTF-8"
    console.log(post_id)
    if (post_id.startsWith(SERVER_ADDR)) {
      console.log("started")
      getAuthorJson(post_id)
    }
    else {
      let author_id = authorId
      if (author_id.endsWith("/"))
        authorId = authorId.substring(0, authorId.length - 1)
      NODES.executeOnRemote((json) => { setHitSubmit(!hitSubmit); alert(`Sent to remote inbox!`) }, 'POST', `${author_id}/inbox/`,
        false, JSON.stringify({
          "type": "comment",
          "commentType": "text/plain",
          "comment": commentContent,
          "author": `${new URLSearchParams(window.location.search).get('user')}`
        }), post.id)
    }

    delete headers["Content-type"]
  }

  const getUserOptions = () => {
    return (
      <>
        <div className="container">
          <div className="row">
            <div className="col">
              <button onClick={() => handleEdit(post.id)} className="btn btn-primary">
                <i class="bi bi-pencil-fill"></i>
                <small> EDIT</small>
              </button>
            </div>
            <div className="col">
              <button onClick={() => handleDelete(post.id)} className="btn btn-danger">
                <i class="bi bi-trash3-fill"></i>
                <small> DELETE</small>
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }




  const getCommentSection = () => {

    return (
      <>
        <div >
          <div className="mb-3 d-flex">
            <div className="row align-self-center">
              <textarea
                id='postContent'
                value={commentContent}
                rows={2}
                onChange={handleInputChange}
                className="form-control col-md-12"
                placeholder="Write your comment here..."

              />
              <button onClick={() => { handleCommentSubmit() }} className="btn btn-primary">
                SUBMIT
              </button>
            </div>


          </div>
          {(props.user || props.post.visibility.toUpperCase() != "FRIENDS") &&
            < ul class="list-group">
            <li class="list-group-item">
              <div className="row">

                <ul class="list-group">
                  {comments.map((comment) => {
                    return <li className="list-group-item"><Comment comment={comment} /></li>
                })
                }
                </ul>


              </div>
            </li>
            </ul>}
        </div>
      </>
    )
  }

  const isImageUrl = (url) => {
    return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
  };

  // Function to replace image URLs with img tags
  const renderContent = () => {
    const content = props.post.content;

    // Use a regular expression to find image URLs
    const imageUrlRegex = /!\[(.*?)\]\((.*?)\)/g;
    const replacedContent = content.replace(imageUrlRegex, (match, alt, url) => {
      if (url.startsWith("data:image")) {
        // If the URL starts with "data:image," it's a base64 image
        setImage([url, alt])
        return ``;
      } else if (isImageUrl(url)) {
        // If the URL is an image, replace with an img tag
        setImage([url, alt])
        return ``;
      } else {
        // Otherwise, leave it unchanged
        return match;
      }
    });

    // Render the content using ReactMarkdown
    return <ReactMarkdown>{replacedContent}</ReactMarkdown>;
  };




  return <>
    <div className="d-flex align-items-center mb-2">
      <i className="bi bi-person-circle" style={{ fontSize: '2rem', marginRight: '10px' }}></i>
      <small>{username}</small>
    </div>
    {
      props.post.visibility.toUpperCase() == "FRIENDS" &&
      <div class="alert alert-success  " role="alert">
        Private Post
      </div>
    }

    {props.post.contentType == "text/plain" && <div>{postContent}</div>}
    {props.post.contentType == 'text/markdown' && <ReactMarkdown>{postContent}</ReactMarkdown>}
    {props.post.contentType.startsWith("image") && <img src={image[0]} alt={image[1]}></img>}
    {props.user && getUserOptions()}

    {!(props.proxy) && <><button
      className={`btn btn-link text-${post.liked ? 'danger' : 'white'}`}
      onClick={() => handleHeartClick(post.id)}
      style={{
        border: 'none',
        borderRadius: '50%',
        padding: '8px',
        transform: 'scale(0.9)'
      }}
    >
      <i className={`bi bi-heart${post.liked ? '-fill' : ''}`} style={{ fontSize: '1.5rem', color: "red" }}></i>
    </button>
    </>
    }
    {(!(props.proxy) || props.user) && <button className="btn btn-primary-outline" onClick={() => { setShowComments(!showComments) }} style={{ color: "blue" }}>
      <i class="bi bi-chat-square-dots"></i>
    </button>}

    {
      props.post.visibility.toUpperCase() == "FRIENDS" && (!(props.proxy) || props.user) &&
      <button className="btn btn-primary-outline" onClick={() => { setShowLikes(!showLikes); }} style={{ color: "blue" }}>
        <i class="bi bi-eye"></i>
      </button>
    }
    {
      showLikes &&
      <>
        <div>
          LIKES

        </div>
        <ul className="list-group">
          {
            likes.map((elem) => {
              return <li className="list-group-item" >
                {elem.author.displayName}
              </li>
            })
          }
        </ul>
      </>
    }



    {editing && <Post content={post.content} postID={post.id} posts={props.posts} getPosts={props.getPosts} editing={true} />}
    {showComments && getCommentSection()}

  </>

}