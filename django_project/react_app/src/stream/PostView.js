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

import ReactMarkdown from 'react-markdown';
import { refreshCookies } from "../getCookies";
import getCookie from "../getCookies";


export default function PostView(props) {


  const fetchAuthorDetails = (id, redo = true) => {
    return fetch(`${id.slice(0, id.indexOf("/posts/"))}`, { headers })
      .then((res) => {
        console.log(res, id, "rizz")
        if (!redo) {
          console.log("second try")

        }
        if (res.ok) {

          return res.json().then((json) => {
            setUsername(json.displayName)
          })
        }
        //Assuming we are only unauthorized because of bad tokens. If we are removed as  node this will render the sme result
        else if (res.status == 401 && redo) {
          refreshCookies(() => {
            console.log("refreshed", "rizz2")
            console.log("old head", headers)
            headers = { 'Authorization': `Bearer ${getCookie("access")}` }
            console.log("new header", headers)
            fetchAuthorDetails(id, false);
          })
        }
        else {
          //alert(`error could not get ${id}`);
          console.log(res);
        }
      })
  }

  const fetchComments = (post_id, redo = true) => {

    return fetch(`${post_id}comments/`, { headers })
      .then((res) => {
        if (res.ok) {
          res.json().then((json) => {
            setComments(json)
          })
        }
        else if (res.status == 401 && redo) {
          refreshCookies(() => {
            headers = { 'Authorization': getCookie("access") }
            fetchComments(post_id, false)
          })
        }
        else {
          //alert(`error could not get ${post_id} comments`)
          console.log(res)
        }
      })
  }

  let post = props.post;
  console.log(post)
  console.log(post)
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


  let authorId = post.id.slice(0, post.id.indexOf("/post/"))
  fetchAuthorDetails(authorId);


  useEffect(() => {
    fetchComments(post.id)
  }, [hitSubmit]);

  const handleInputChange = (e) => {
    setCommentContent(e.target.value);
  };

  const handleHeartClick = (postId) => {
    props.setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, liked: !post.liked } : post
      )
    );
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
            headers = { 'Authorization': getCookie("access") }
            handleDelete(postId, false)
          })
        }
      })
    delete headers["Content-type"]
  }

  const handleEdit = (postId) => {
    setEditing(!editing);
  }

  const handleCommentSubmit = (redo = true) => {
    headers["Content-type"] = "application/json; charset=UTF-8"
    fetch(`${post.id}/comments/`,
      {
        method: "POST",
        body: JSON.stringify({
          "comment": commentContent,
          "author": `${SERVER_ADDR}author/${new URLSearchParams(window.location.search).get('user')}`
        }),
        headers
      })

      .then((res) => {
        if (res.ok) {
          setHitSubmit(!hitSubmit)
        }
        if (res.status == 401 && redo) {
          refreshCookies(() => {
            headers = { 'Authorization': getCookie("access") }
            handleCommentSubmit(false)

          })
        }
      })
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
          <ul class="list-group">
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
          </ul>
        </div>
      </>
    )
  }


  return <>
    <div className="d-flex align-items-center mb-2">
      <i className="bi bi-person-circle" style={{ fontSize: '2rem', marginRight: '10px' }}></i>
      <small>{username}</small>
    </div>
    <ReactMarkdown>{props.post.content}</ReactMarkdown>

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



    {editing && <Post content={post.content} postID={post.id} posts={props.posts} getPosts={props.getPosts} editing={true} />}
    {showComments && getCommentSection()}

  </>

}