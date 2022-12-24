import { Route, BrowserRouter, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Categories from "./routes/Categories";
import Services from "./routes/Services";
import Login from "./routes/Login";
import Logout from "./routes/Logout";

const App = () => {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Services />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
};

export default App;
