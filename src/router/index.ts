import {
  createRouter,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";
import HomeView from "../views/HomeView.vue";
console.log(createWebHashHistory(import.meta.env.BASE_URL));
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/blood_pressure_report",
      name: "blood_pressure_report",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/BloodPressureReport.vue"),
      meta: { title: "血压监测简报" },
    },
    {
      path: "/test_history",
      name: "test_history",
      component: () => import("../views/testHistory.vue"),
    },
  ],
});

router.beforeEach((to, from, next) => {
  document.title = (to.meta.title as string) ?? "精准看护";

  next();
});

export default router;
