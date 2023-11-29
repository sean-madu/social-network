/*
Stream of post content 

interface Post {
  id: number;
  content: string;
  liked: boolean;
  author: string;
}

props{
  posts: List of Json posts
  getPosts: function to tell parent component to refresh posts
  proxy: boolean to know if this is a proxy list
  user: boolean to know if this stream is showing user posts
}


*/
import { useState } from 'react';
import PostView from './PostView';




const Posts = (props) => {
  const getPosts = () => {
    return props.posts.map((post) => {
      return (
        <li key={post.id} className="list-group-item">
          <PostView post={post} posts={props.posts} getPosts={props.getPosts} proxy={props.proxy} user={props.user} />
        </li>
      )
    }
    )

  }

  return (
    <>
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">

            <div className="rounded p-4 bg-light">

              <h5 className="mb-3">Stream</h5>

              <ul className="list-group">
                {props.posts.length > 0 ? getPosts() : <h1> NO POSTS TO SHOW HERE... </h1>}
              </ul>

            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Posts;
