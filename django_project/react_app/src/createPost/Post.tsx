import React, { useState, ChangeEvent } from 'react';
import ReactMarkdown from 'react-markdown';

const Post: React.FC = () => {
  // State for post content, selected format, and selected image
  const [postContent, setPostContent] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<string>('plain');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  // Handle textarea input change
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setPostContent(e.target.value);
  };

  // Handle format selection change
  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(e.target.value);
  };

  // Handle image selection
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    setSelectedImage(file);
  };

  // Handle post button click
  const handlePostClick = () => {
    alert('Post button clicked!');
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
                value={postContent}
                onChange={handleInputChange}
                rows={2}
                className="form-control col-md-12"
                placeholder="Write your post here..."
              />
            </div>

            {/* Image Upload */}
            <div className="mb-3">
              <label className="mb-0">Upload Image:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="form-control"
              />
            </div>

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

export default Post;
