import React, { useState, ChangeEvent } from 'react';
import ReactMarkdown from 'react-markdown';

import SERVER_ADDR from '../serverAddress';
//Props will only ever be there if we are editing and not posting
export default function Post(props) {
  let editing = Object.keys(props).length != 0;
  // State for post content, selected format, and selected image
  const [postContent, setPostContent] = useState(editing ? props.content : '');
  const [selectedOption, setSelectedOption] = useState('plain');
  const [selectedImage, setSelectedImage] = useState(null);



  const createPostItem = () => {

    //TODO handle images
    return {
      type: "post",
      title: "Forgot to add titles to Posts whoops",
      contentType: `text/${selectedOption}`,
      source: { SERVER_ADDR },
      origin: { SERVER_ADDR },
      content: document.getElementById('postContent').textContent,
      author: "858bbf8f-14df-47ae-b75a-842ada24e01a",
      comments: "{}",
      unlisted: "true",

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

  // Handle post button click
  const handlePostClick = () => {
    /*
    //Temp for now but we have to post default author first ig?
    fetch(`${serverAddress}authors/`,
      {
        method: "POST",
        body: JSON.stringify(
          {
            type: "author",
            id: `${SERVER_ADDR}authors/9de17f29c12e8f97bcbbd34cc908f1baba40658e`,
            displayName: "Lara Croft",
            url: "http://127.0.0.1:5454/authors/9de17f29c12e8f97bcbbd34cc908f1baba40658e",
            github: "http://github.com/laracroft",
            host: `${SERVER_ADDR}`,
            profileImage: "https://i.imgur.com/k7XVwpB.jpeg"

          }
        ),
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      })
      .then((res) => { res.json() })
      .then((json) => { console.log(json) })
      */

    fetch(`${SERVER_ADDR}authors/858bbf8f-14df-47ae-b75a-842ada24e01a/posts/`,
      {
        method: "POST",
        body: JSON.stringify(createPostItem()),
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      })
      .then((res) => { res.json() })
      .then((json) => { console.log(json) })
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

