import { HashRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { PostList } from './pages/PostList'
import { PostDetail } from './pages/PostDetail'

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<PostList />} />
          <Route path="/posts/:slug" element={<PostDetail />} />
        </Routes>
      </Layout>
    </HashRouter>
  )
}
