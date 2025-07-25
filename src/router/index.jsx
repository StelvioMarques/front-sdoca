// src/router/index.js

import { createBrowserRouter } from "react-router-dom"
import DashboardLayout from "@/layouts/DashboardLayout"
import Home from "@/pages/Home"
import { authRoutes } from "./modules/auth.routes"
import { orgRoutes } from "./modules/org.routes"
import { userRoutes } from "./modules/users.routes"
import { documentRoutes } from "./modules/docs.routes"
import { temporalidadeRoutes } from "./modules/temporalidades.routes"
import { docTypeRoutes } from "./modules/doc-types.routes"
import { classificationRoutes } from "./modules/classifications.routes"
import { areaRoutes } from "./modules/areas.routes"


import PrivateRoute from "./guards/PrivateRoutes"
import { AuthProvider } from "@/context/AuthContext"

const router = createBrowserRouter([
  ...authRoutes,
  {
    path: "/dashboard",
    element: (
      <AuthProvider>
        <PrivateRoute>
          <DashboardLayout />
        </PrivateRoute>
      </AuthProvider>
    ),
    children: [
      { index: true, element: <Home /> },
      ...orgRoutes,
      ...userRoutes,
      ...documentRoutes,
      ...temporalidadeRoutes,
      ...classificationRoutes,
      ...docTypeRoutes,
      ...areaRoutes
    ],
  },
])

export default router
