import logo from './logo.svg';
import 'bootstrap/dist/css/bootstrap.css';
import './components/ListGroup'

import LoginForm from './logIn/LoginForm';
import SignupForm from './logIn/SignupForm';
import Homepage from './homepage/Homepage';

import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  let testNotifs = [
    { type: "comment", displayName: "sean", post: { text: "I love React so so so so so much so sos os os " }, comment: "Yoo this looks fire" },
    { type: "comment", displayName: "sean2", post: { text: "I love React" }, comment: "Wow please delete your account" },
    { type: "like", displayName: "sham1", post: { text: "Setting up React is a pain" } }

  ];

  let testFollows = [{ id: "1", displayName: "sean" }, { id: "2", displayName: "-250 IQ points" }];
  return (

    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/register" element={<SignupForm />} />
        <Route path="/defaultUser" element={<Homepage />} />
      </Routes>
    </BrowserRouter>


  );
}

export default App;
