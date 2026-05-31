import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { SearchPage } from "./pages/SearchPage";
import { LibraryPage } from "./pages/LibraryPage";
import { ProfilePage } from "./pages/ProfilePage";
import { MangaDetailPage } from "./pages/MangaDetailPage";
import { ReaderPage } from "./pages/ReaderPage";
import { TrendingPage } from "./pages/TrendingPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "search", Component: SearchPage },
      { path: "library", Component: LibraryPage },
      { path: "trending", Component: TrendingPage },
      { path: "profile", Component: ProfilePage },
      { path: "manga/:id", Component: MangaDetailPage },
    ],
  },
  {
    path: "/reader/:id/:chapter",
    Component: ReaderPage,
  },
]);
