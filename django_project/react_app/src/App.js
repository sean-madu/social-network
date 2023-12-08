import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './components/ListGroup'

import LoginForm from './logIn/LoginForm';
import SignupForm from './logIn/SignupForm';
import Homepage from './homepage/Homepage';
import ProfilePage from './profilePage/Profile';
import UnlistedPost from './stream/UnlistedPost';

import { BrowserRouter, Routes, Route } from "react-router-dom";


function App() {
  return (

    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/register" element={<SignupForm />} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/profile" element={<ProfilePage notUser={true} />} />
        <Route path="/post" element={<UnlistedPost />} />
      </Routes>
    </BrowserRouter>


  );
}

export default App;
