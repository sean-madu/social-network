import { useState } from 'react';
import PostView from './PostView';
/*
interface Post {
  id: number;
  content: string;
  liked: boolean;
  author: string;
}*/

const Posts = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      content: 'This is the content of post 1.',
      liked: false,
      author: 'Obama!',
    },
    {
      id: 2,
      content: 'This is the content of post 2.',
      liked: false,
      author: 'Rando123',
    },
    // Add more posts as needed
  ]);



  return (
    <>
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">

            <div className="rounded p-4 bg-light">

              <h5 className="mb-3">Stream</h5>

              <ul className="list-group">
                {posts.map(post => (
                  <li key={post.id} className="list-group-item">
                    <PostView post={post} setPosts={setPosts} />
                  </li>
                ))}
              </ul>

            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Posts;
