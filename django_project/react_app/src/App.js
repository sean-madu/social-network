import logo from './logo.svg';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './components/ListGroup'

import LoginForm from './logIn/LoginForm';
import SignupForm from './logIn/SignupForm';
import Homepage from './homepage/Homepage';


import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
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
