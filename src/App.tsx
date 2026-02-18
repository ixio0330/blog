import { HashRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { PostDetail } from "./pages/PostDetail";
import { PostList } from "./pages/PostList";

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<PostList />} />
          <Route path="/posts/*" element={<PostDetail />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}
