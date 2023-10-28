

export default function PostView(props) {


  let post = props.post;

  const handleHeartClick = (postId) => {
    props.setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, liked: !post.liked } : post
      )
    );
  };

  const getButton = () => {

    if (post.proxy == null)
      return (
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
          <i className={`bi bi-heart${post.liked ? '-fill' : ''}`} style={{ fontSize: '1.5rem', color: "red" }}></i>
        </button>

      )
    else return <></>
  }
  return <>
    <div className="d-flex align-items-center mb-2">
      <i className="bi bi-person-circle" style={{ fontSize: '2rem', marginRight: '10px' }}></i>
      <small>{post.author}</small>
    </div>
    <p>{post.content}</p>
    {getButton()}

  </>

}