import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";
import Footer from "./Footer";

export default function MainLayout() {
  return (
    <div className="site-shell">
      <div className="bg-shape bg-shape-1" aria-hidden="true" />
      <div className="bg-shape bg-shape-2" aria-hidden="true" />
      <NavBar />
      <main className="site-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
