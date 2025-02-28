import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import routes from './routes/routes';// Import centralized routes

const App: React.FC = () => {
  return (
    <Router>
      <div className="App ">
        <Routes>
          {routes.map((route, index) => (
            <Route
              key={index}
              path={route.path}
              element={route.element}
            />
          ))}
        </Routes>
      </div>
    </Router>
  );
};

export default App;