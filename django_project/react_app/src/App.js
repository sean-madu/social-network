import logo from './logo.svg';
import 'bootstrap/dist/css/bootstrap.css';
import './components/ListGroup'
import NotificationList from './inbox/NotificationList';
function App() {
  return (


    <div className="App">
      <NotificationList heading="Comments"
        comments={[
          { type: "comment", displayName: "sean", post: { text: "I love React so so so so so much so sos os os " }, comment: "Yoo this looks fire" },
          { type: "comment", displayName: "sean2", post: { text: "I love React" }, comment: "Wow please delete your account" },
          { type: "like", displayName: "sham1", post: { text: "Setting up React is a pain" } }

        ]} />
    </div>

  );
}

export default App;
