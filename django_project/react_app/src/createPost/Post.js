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
  let notify = true
  let friends = true

  const createPostItem = async () => {
    let type = 'text/plain';
    let unlisted = 'False';
    let visibility = 'PUBLIC';
    let content = postContent;
    let imageFile = null; // Store the image file if provided
  
    if (selectedOption === 'markdown') {
      type = 'text/markdown';
    }
  
    // Update visibility based on user input
    if (document.getElementById('publicPost').checked) {
      visibility = 'PUBLIC';
    } else if (document.getElementById('privatePost').checked) {
      visibility = 'FRIENDS';
    } else {
      unlisted = 'True';
      visibility = 'FRIENDS';
    }
  
    // Handle image input
    const imageInput = document.getElementById('imageInput');
    if (imageInput && imageInput.files.length > 0) {
      imageFile = imageInput.files[0];
  
      // Read the image asynchronously
      const imageData = await readImageAsync(imageFile);
  
      // Attach the image data to the content or process it as needed
      content += `\n![Image](data:${imageFile.type};base64,${imageData})`;
    }
  
    return {
      title: 'Post from team===good',
      content: content,
      unlisted: unlisted,
      description: 'Post description from team===good',
      contentType: type,
      visibility: visibility,
      image: imageFile,
    };
  };
  
  // Function to read image asynchronously and return base64 data
  const readImageAsync = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  
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

  const getFriends = (post, redo = true) => {
    fetch(`${SERVER_ADDR}service/authors/${userID}/friends`,
      {
        headers: {
          'Authorization': `Bearer ${accessCookie}`
        }
      }
    )
      .then((res) => {
        if (res.ok) {
          alert("posting to friends")
          res.json().then((json) => {
            console.log(json, "friends")
            json.items.forEach((follower) => {
              postToInbox(follower, post)
            })
            props.getPosts()
          })
        }
        else if (res.status == 401 && redo) {
          refreshCookies(() => {
            getFriends(false)
          })
        }
        else {
          res.json().then((j) => console.log(j))
        }
      })
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
    const createPost = createPostItem();
    fetch(`${SERVER_ADDR}service/authors/${userID}/posts/`, {
      method: 'POST',
      body: JSON.stringify(createPost),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
        Authorization: `Bearer ${accessCookie}`,
      },
    })
      .then((res) => {
        if (res.ok) {
          res.json().then((post) => {
            console.log(post, 'post to stream');
  
            // Check if the content type is an image
            if (createPost.contentType.startsWith('image/')) {
              alert(`Image posted! You can embed it using this URL: ${post.id}/image`);
            } else {
              alert('Post made to Stream');
            }
  
            if (notify && friends) {
              getFriends(post);
            } else if (notify && !friends) {
              getFollowers(post);
            } else {
              alert(`Your post can be shared with this link: ${post.id} if you made it unlisted`);
            }
          });
        } else if (res.status === 401 && redo) {
          refreshCookies(() => {
            postToStream(false);
          });
        } else {
          console.log(res);
          res.json().then((json) => console.log(json));
        }
      });
  };
  
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
          else {
            console.log(res)
            res.text().then((t) => { console.log(t) })
          }
        })

    }
    else {
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
                <input class="form-check-input" type="radio" name="exampleRadios" id="publicPost" value="option1" checked></input>
                <label class="form-check-label" for="exampleRadios1">
                  PUBLIC
                </label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="radio" name="exampleRadios" id="privatePost" value="option2"></input>
                <label class="form-check-label" for="exampleRadios2">
                  PRIVATE
                </label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="radio" name="exampleRadios" id="unlistedPost" value="option2"></input>
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
            <div className="d-flex justify-content-end m-2">
              <button
                onClick={handlePostClick}
                disabled={postContent.trim() === ''}
                className="btn btn-primary"
              >
                Post Text
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

