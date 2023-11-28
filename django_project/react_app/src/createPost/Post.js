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
    //TODO handle images
    return {
      title: "Forgot",
      content: postContent,
      unlisted: "False"
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

  const postToInbox = (follower, post, redo = true) => {
    fetch(`${follower.actor.id}/inbox`,
      {
        method: "POST",
        body: JSON.stringify(
          createPostItem()
        ),
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
            postToInbox(follower, false)
          })
        }
        else {
          res.json().then((j) => console.log(j, "could not post to inbox of", follower))
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

            props.getPosts()
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
                  props.getPosts()
                }
              })
          }
        })

    }
    else {
    fetch(`${SERVER_ADDR}authors/${userID}/posts/`,
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
            alert("Post made to followers")
            fetch(`${SERVER_ADDR}authors/${userID}/followers/`,
              {
                headers: {
                  'Authorization': `Bearer ${accessCookie}`
                }
              }
            )
              .then((res) => {
                if (res.ok) {
                  console.log("got followers")
                  res.json().then((json) => {
                    console.log(json, "followers")
                    json.items.forEach((follower) => {
                      postToInbox(follower, post)
                    })
                  })
                }
                else if (res.status == 401) {
                  refreshCookies(() => {
                    fetch(`${SERVER_ADDR}authors/${userID}/followers/`,
                      {
                        headers: {
                          'Authorization': `Bearer ${accessCookie}`
                        }
                      }
                    )
                      .then((res) => {
                        if (res.ok) {
                          res.json().then((json) => {
                            json.items.forEach((follower) => {
                              postToInbox(follower)
                            })
                          })
                        }
                      })
                  }
                  )
                }
                else {
                  res.json().then((j) => console.log(j))
                }
              })
          })

          //props.getPosts()
        }
        else if (res.status == 401) {
          refreshCookies(() => {
            accessCookie = getCookie("access")
            fetch(`${SERVER_ADDR}authors/${userID}/posts/`,
              {
                method: "POST",
                body: JSON.stringify(createPostItem()),
                headers: {
                  "Content-type": "application/json; charset=UTF-8",
                  'Authorization': `Bearer ${accessCookie}`
                }
              }).then((res) => {
                if (res.ok) {

                  res.json().then((post) => {
                    alert('post made to followers')
                    console.log("posts like did this")
                    fetch(`${SERVER_ADDR}authors/${userID}/followers/`,
                      {
                        headers: {
                          'Authorization': `Bearer ${accessCookie}`
                        }
                      }
                    )
                      .then((res) => {
                        if (res.ok) {
                          console.log("got followers")
                          res.json().then((json) => {
                            console.log(json, "followers")
                            json.forEach((follower) => {
                              postToInbox(follower, post)
                            })
                          })
                        }
                        else if (res.status == 401) {
                          refreshCookies(() => {
                            fetch(`${SERVER_ADDR}authors/${userID}/followers/`,
                              {
                                headers: {
                                  'Authorization': `Bearer ${accessCookie}`
                                }
                              }
                            )
                              .then((res) => {
                                if (res.ok) {
                                  res.json().then((json) => {
                                    json.forEach((follower) => {
                                      postToInbox(follower)
                                    })
                                  })
                                }
                              })
                          }
                          )
                        }
                        else {
                          res.json().then((j) => console.log(j))
                        }
                      })
                  })
                  //props.getPosts()
                  //Send post to all followers inbox

                }
              })
          })
        }
        else {
          console.log(res)
          res.json().then((json) => console.log(json))
        }
      })


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
              </select>
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

