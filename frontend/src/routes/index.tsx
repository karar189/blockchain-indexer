import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import Register from "../pages/Register";
import IndexerDetails from "../pages/IndexerDetails";
import DatabaseConnections from "../pages/DatabaseConnections";
import Indexers from "../pages/Indexer";
import WebhookLogs from "../pages/WebhookLogs";
import ComingSoon from '../pages/ComingSoon';
import MainLayout from "../layouts/MainLayout";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/indexers/:id" element={<IndexerDetails />} />
        <Route path="/indexers/:id/logs" element={<WebhookLogs />} />
        <Route path="/logs" element={<WebhookLogs />} />
        <Route path="/database" element={<DatabaseConnections />} />
        <Route path="/indexers" element={<Indexers />} />
        <Route path="/coming-soon/:feature" element={<MainLayout><ComingSoon /></MainLayout>} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;