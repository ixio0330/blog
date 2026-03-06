import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { PostDetail } from "./pages/PostDetail";
import { PostList } from "./pages/PostList";

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Layout>
        <Routes>
          <Route path="/" element={<PostList />} />
          <Route path="/posts/*" element={<PostDetail />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
