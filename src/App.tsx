import { ConfigProvider } from "antd";
import AppProvider from "./components/stateful/AppProvider";
import { HashRouter, Outlet, Route, Routes } from "react-router-dom";
import { ROUTES } from "./router/routes";

// const Layout = () => {
//   return (
//     <DefaultLayout>
//       <Outlet />
//     </DefaultLayout>
//   );
// };

// const AppRoutes = () => {
//   return (
//     <Routes>
//       <Route index element={<LoginPage />} />
//       <Route path={`${ROUTES.Login}`} element={<LoginPage />} />
//       <Route path={`${ROUTES.Root}`} element={<Layout />}>
//         <Route path={`${ROUTES.Home.Root}/*`} element={<HomePage />} />
//       </Route>
//     </Routes>
//   );
// };

function App() {
  return (
    <ConfigProvider>
      <AppProvider>
        {/* <RouterProvider fallback={<GlobalLoading />} router={router} /> */}
        {/* <HashRouter>
          <AppRoutes />
        </HashRouter> */}
      </AppProvider>
    </ConfigProvider>
  );
}

export default App;
