/*
 React component for creating/editing posts

 Props
 {
  editing: Bool for if this is meant to edit or make a new post
  content: String containing the default content to be displayed
  TODO image: file to display the default image
  postID: String for ID of post if editing a post
  getPosts: Some function telling the parent to refresh posts

 }
*/

import React, { useState, ChangeEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import * as NODES from "../Nodes"
import SERVER_ADDR from '../serverAddress';
import { refreshCookies } from '../getCookies';
import getCookie from '../getCookies';
export default function Post(props) {
  let accessCookie = getCookie("access")
  let editing = props.editing;
  // State for post content, selected format, and selected image
  const [postContent, setPostContent] = useState(editing ? props.content : '');
  const [selectedOption, setSelectedOption] = useState('plain');
  const [selectedImage, setSelectedImage] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const userID = urlParams.get('user');


  const createPostItem = () => {
    let type = 'text/plain'
    if (selectedOption == 'markdown') {
      type = "text/markdown"
    }
    else if (selectedOption == 'image') {
      type = ""
    }
    //TODO handle images
    return {
      title: "Post from team===good",
      content: postContent,
      unlisted: "False",
      description: "Post description from team===good",
      contentType: type,
    }
  }
  // Handle textarea input change
  const handleInputChange = (e) => {
    setPostContent(e.target.value);
  };

  // Handle format selection change
  const handleSelectChange = (e) => {
    setSelectedOption(e.target.value);
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    setSelectedImage(file);
  };

  // TODO refactor posting to stream, it is a mess. Get those to be seperate functions 
  const localInbox = (follower, post, redo = true) => {
    console.log(post)
    fetch(`${follower.id}/inbox`,
      {
        method: "POST",
        body: JSON.stringify(post),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          'Authorization': `Bearer ${accessCookie}`
        }
      })
      .then((res) => {
        if (res.ok) {

        }
        else if (res.status == 401 && redo) {
          refreshCookies(() => {
            localInbox(follower, false)
          })
        }
        else {
          res.json().then((j) => console.log(j, "could not post to inbox of", follower))
        }
      })
  }

  const postToInbox = (follower, post) => {
    if (follower.id.startsWith(SERVER_ADDR)) {
      localInbox(follower, post)
    }
    else {
      if (follower.id.endsWith("/")) {
        follower.id = follower.id.slice(0, follower.id.length - 1)
      }
      let path = follower.id + "/inbox/"
      delete post.key
      NODES.executeOnRemote((j) => { console.log(j, "posted to inbox of", follower); },
        "POST", path,
        false, JSON.stringify(post), follower.id)
    }
  }

  const getFollowers = (post, redo = true) => {
    fetch(`${SERVER_ADDR}service/authors/${userID}/followers`,
      {
        headers: {
          'Authorization': `Bearer ${accessCookie}`
        }
      }
    )
      .then((res) => {
        if (res.ok) {
          alert("posting to followers")
          res.json().then((json) => {
            console.log(json, "followers")
            json.items.forEach((follower) => {
              postToInbox(follower, post)
            })
            props.getPosts()
          })
        }
        else if (res.status == 401 && redo) {
          refreshCookies(() => {
            getFollowers(false)
          })
        }
        else {
          res.json().then((j) => console.log(j))
        }
      })
  }

  const postToStream = (redo = true) => {
    fetch(`${SERVER_ADDR}service/authors/${userID}/posts/`,
      {
        method: "POST",
        body: JSON.stringify(createPostItem()),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          'Authorization': `Bearer ${accessCookie}`
        }
      })
      .then((res) => {

        if (res.ok) {
          res.json().then((post) => {
            console.log(post, "post to stream")
            alert("Post made to Stream")
            getFollowers(post)

          })

          //props.getPosts()
        }
        else if (res.status == 401 && redo) {
          refreshCookies(() => {
            postToStream(false)
          })
        }
        else {
          console.log(res)
          res.json().then((json) => console.log(json))
        }
      })

  }
  // Handle post button click
  const handlePostClick = () => {

    if (editing) {

      fetch(`${props.postID}`,
        {
          method: "POST",
          body: JSON.stringify(createPostItem()),
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            'Authorization': `Bearer ${accessCookie}`
          }
        })
        .then((res) => {
          if (res.ok) {
            res.json((j) => getFollowers(j)) //Post update to inboxes
          }
          else if (res.status == 401) {
            fetch(`${SERVER_ADDR}authors/${userID}/posts/${props.postID}/`,
              {
                method: "POST",
                body: JSON.stringify(createPostItem()),
                headers: {
                  "Content-type": "application/json; charset=UTF-8",
                  'Authorization': `Bearer ${accessCookie}`
                }
              }).then((res) => {
                if (res.ok) {
                  res.json((j) => getFollowers(j))
                }
              })
          }
        })

    }
    else {
      //console.log(createPostItem())

      postToStream()
    }

  };

  return (
    <div className="mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">

          <div className="rounded p-4 bg-light">

            {/* Create Post Title */}
            <h5 className="mb-3">Create Post</h5>

            {/* Format Selection */}
            <div className="mb-3">
              <label className="mb-0">Choose Format:</label>
              <select
                value={selectedOption}
                onChange={handleSelectChange}
                className="form-control"
              >
                <option value="plain">Plain Text</option>
                <option value="markdown">Markdown</option>
                <option value="image">Image</option>
              </select>
            </div>

            {/* Privacy Selection */}
            <div>
              <div class="form-check">
                <input class="form-check-input" type="radio" name="exampleRadios" id="exampleRadios1" value="option1" checked></input>
                <label class="form-check-label" for="exampleRadios1">
                  PUBLIC
                </label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="radio" name="exampleRadios" id="exampleRadios2" value="option2"></input>
                <label class="form-check-label" for="exampleRadios2">
                  PRIVATE
                </label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="radio" name="exampleRadios" id="exampleRadios2" value="option2"></input>
                <label class="form-check-label" for="exampleRadios2">
                  UNLISTED
                </label>
              </div>
            </div>


            {/* Textarea for post content */}
            <div className="mb-3 d-flex">
              <textarea
                id='postContent'
                value={postContent}
                onChange={handleInputChange}
                rows={2}
                className="form-control col-md-12"
                placeholder="Write your post here..."
              />
            </div>


            {/* Image Upload */}
            {/* Editing images looks like work so not allowed for now*/}
            {!editing && <div className="mb-3">
              <label className="mb-0">Upload Image:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="form-control"
              />
            </div>}

            {/* Display selected image */}
            {selectedImage && (
              <div className="mb-3">
                <img
                  src={URL.createObjectURL(selectedImage)}
                  alt="Selected"
                  className="img-fluid"
                />
              </div>
            )}

            {/* Post Button */}
            <div className="d-flex justify-content-end">
              <button
                onClick={handlePostClick}
                disabled={postContent.trim() === ''}
                className="btn btn-primary"
              >
                Post
              </button>
            </div>

            {/* Post Preview */}
            {postContent && (
              <div className="mt-4">
                <div className="bg-white p-3 rounded">

                  <h5 className="mb-3">Post Preview</h5>

                  <div className="card-body">
                    {selectedOption === 'markdown' ? (
                      <ReactMarkdown>{postContent}</ReactMarkdown>
                    ) : (
                      <div>{postContent}</div>
                    )}
                  </div>

                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};

