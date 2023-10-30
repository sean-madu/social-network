//These can have multiple options for dynamic rendering
//Proxy: Remove unnecessary features and just display the content of the post
//User: Allow for editing the post and other things only the maker of the post can do

import { useState } from "react";
import Post from "../createPost/Post";
import SERVER_ADDR from "../serverAddress";

export default function PostView(props) {


  const fetchAuthorDetails = (id) => {
    return fetch(`${SERVER_ADDR}authors/${id}`)
      .then((res) => { return res.json() })
      .then((json) => {
        setUsername(json.displayName)
      })
  }

  let post = props.post;
  const [editing, setEditing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [username, setUsername] = useState("");

  fetchAuthorDetails(post.author);

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

  const handleDelete = (postId) => {
    fetch(`${SERVER_ADDR}authors/${post.author}/posts/${post.id}`,
      {
        method: "DELETE",
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      })

      .then((res) => {
        //TODO Handle a failed delete
        if (res.ok) {

          props.setPosts((prevPosts) => {
            return prevPosts.filter((post) =>
              post.id !== postId
            )
          });

        }
      })

  }

  const handleEdit = (postId) => {
    setEditing(!editing);
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
              <button className="btn btn-primary">
                SUBMIT
              </button>
            </div>


          </div>
          <ul class="list-group">
            <li class="list-group-item">
              <div className="row">
                <div className="col">
                  <div className="row">
                    <i className="bi bi-person-circle" style={{ fontSize: '2rem', marginRight: '10px' }}></i>
                  </div>
                  <div className="row">
                    PEsrons 1
                  </div>
                </div>
                <div className="col">
                  Some comment for now
                </div>
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
    <p>{post.content}</p>

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



    {editing && <Post content={post.content} postID={post.id} />}
    {showComments && getCommentSection()}

  </>

}