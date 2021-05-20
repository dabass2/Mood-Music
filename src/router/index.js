import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Songs from "../views/Songs.vue";
import Artist from "../views/Artists.vue";
import Genres from "../views/Genres.vue";
import Artgenre from "../views/Artgenre.vue";
import Complex from "../views/Complex.vue";
import Search from "../views/Search.vue";
import Playlist from "../views/Playlist.vue";
import Vizu from "../views/Vizu.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/songs",
    name: "Songs",
    component: Songs,
  },
  {
    path: "/artists",
    name: "Artists",
    component: Artist
  },
  {
    path: "/genres",
    name: "Genres",
    component: Genres
  },
  {
    path: "/artgenre",
    name: "Artgenre",
    component: Artgenre
  },
  {
    path: "/complex",
    name: "Complex",
    component: Complex
  },
  {
    path: "/search",
    name: "Search",
    component: Search
  },
  {
    path: "/playlist",
    name: "Playlist",
    component: Playlist
  },
  {
    path: "/vizu",
    name: "Vizu",
    component: Vizu
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
