import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Register from './pages/register';
import Login from './pages/login'
import RoleList from "./pages/role"
import ReportList from "./pages/report"
import Project from "./pages/project"
import Material from "./pages/materials"
import AddProject from "./pages/newProject"
import Layout from './component/layout';
import Edit from './pages/edit';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/role" element={<RoleList />} />
          <Route path="/report" element={<ReportList />} />
          <Route path="/project/:id" element={<Project />} />
          <Route path="/material" element={<Material />} />
          <Route path="/new" element={<AddProject />} />
          <Route path="/edit/:id" element={<Edit />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App