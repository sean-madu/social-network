import logo from './logo.svg';
import 'bootstrap/dist/css/bootstrap.css';
import './components/ListGroup'
import LoginForm from './logIn/LoginForm';
import SignupForm from './logIn/SignupForm';
import { BrowserRouter, Routes, Route } from "react-router-dom";
function App() {
  return (

    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/register" element={<SignupForm />} />

      </Routes>
    </BrowserRouter>

  );
}

export default App;
