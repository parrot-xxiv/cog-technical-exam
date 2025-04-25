import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import TodoList from './components/TodoList';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="container">
          <h1>Todo App</h1>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/todos" 
              element={
                <PrivateRoute>
                  <TodoList />
                </PrivateRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/todos" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;