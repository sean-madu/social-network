import 'bootstrap/dist/css/bootstrap.css';


export default function NotificationList(props) {

  const makeListItems = () => {
    return props.comments.map((item) => {
      //todo, render maybe a proxy post here
      return (
        <li className='list-group-item'>
          <div className='container'>
            <div className='row'>
              {item.type == "comment" && <p>{item.displayName} commented on your post "{item.comment}" on </p>}
            </div>
            <div className='row justify-content-center'>
              <div className='card' style={{ width: "18rem", overflow: "hidden", textOverflow: "ellipsis" }}>
                <div className='card-body' >
                  <p className='card-text'>{item.post.text}</p>
                </div>
              </div>
            </div>

          </div>

        </li>
      )
    })
  }

  console.log(props.comments);
  return (
    <>
      <div style={{ display: "flex", height: "70vh", alignItems: "center", flexDirection: "column" }} className='p-5'>
        <h1> Notifications </h1>
        {props.comments.length == 0 && <h2> Nobody has commented on any of your posts </h2>}
        <ul className="list-group">
          {makeListItems()}
        </ul>
      </div >
    </>
  )
}