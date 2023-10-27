import React, { useState } from 'react';

interface Post {
  id: number;
  content: string;
  liked: boolean;
  author: string;
}

const Posts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      content: 'This is the content of post 1.',
      liked: false,
      author: 'Obama',
    },
    {
      id: 2,
      content: 'This is the content of post 2.',
      liked: false,
      author: 'Rando123',
    },
    // Add more posts as needed
  ]);

  const handleHeartClick = (postId: number) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, liked: !post.liked } : post
      )
    );
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">

          <div className="rounded p-4 bg-light">

            <h5 className="mb-3">Stream</h5>

            <ul className="list-group">
              {posts.map(post => (
                <li key={post.id} className="list-group-item">
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-person-circle" style={{ fontSize: '2rem', marginRight: '10px' }}></i>
                    <small>{post.author}</small>
                  </div>
                  <p>{post.content}</p>
                  <button
                    className={`btn btn-link text-${post.liked ? 'danger' : 'white'}`}
                    onClick={() => handleHeartClick(post.id)}
                    style={{
                      border: 'none',
                      borderRadius: '50%',
                      padding: '8px',
                      transform: 'scale(0.9)'
                    }}
                  >
                    <i className={`bi bi-heart${post.liked ? '-fill' : ''}`} style={{ fontSize: '1.5rem' }}></i>
                  </button>
                </li>
              ))}
            </ul>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Posts;
