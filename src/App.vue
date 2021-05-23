<template>
  <v-app>
    <!-- This is stuff used for the login button and what not -->
    <v-app-bar dark absolute dense>
      <v-btn text icon @click.stop="drawer = !drawer">
        <v-icon>mdi-menu</v-icon>
      </v-btn>
      <v-toolbar-title>Mood Music</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn v-if="!isLogin" @click="loginDialog = true">Login</v-btn>
      <v-btn v-if="!isLogin" @click="createDialog = true">Create Account</v-btn>
      
      <v-menu
        bottom
        min-width="200px"
        rounded
        offset-y
        v-if="isLogin"
      >
        <template v-slot:activator="{ on }">
          <v-btn icon x-large v-on="on">
            <v-avatar size="40" color="teal">
              <v-icon dark>
                mdi-account-circle
              </v-icon>
            </v-avatar>
          </v-btn>
        </template>
        <v-card>
          <v-list-item-content class="justify-center">
            <div class="mx-auto text-center">
              <v-avatar size="40" color="teal">
                <v-icon dark>
                  mdi-account-circle
                </v-icon>
              </v-avatar>
              <h3>{{ username }}</h3>
              <v-divider class="my-3"></v-divider>
              <v-btn depressed rounded text>Edit Account</v-btn>
              <v-divider class="my-3"></v-divider>
              <v-btn depressed rounded text @click="logout()">Logout</v-btn>
            </div>
          </v-list-item-content>
        </v-card>
      </v-menu>
    </v-app-bar>

    <!-- This dialog (pop-up) is what appears when a user presses the "Login" button -->
    <v-dialog v-model="loginDialog" width="500">
      <v-card>
        <v-form @submit.prevent="login">
        <v-card-title class="headline grey lighten-2">
          Login to Account
        </v-card-title>

        <v-card-text>
          <v-text-field
              v-if="loginDialog"
              label="Username"
              v-model="username"
          ></v-text-field>
          <v-text-field
              v-if="loginDialog"
              label="Password"
              v-model="password"
              type="password"
          ></v-text-field>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="loginDialog = false">Cancel</v-btn>
          <v-btn color="success" text type="submit">Login</v-btn>
        </v-card-actions>
        </v-form>
      </v-card>

      <v-alert v-model="error" transition="scale-transition" type="error" dismissible>
        {{errMsg}}
      </v-alert>
    </v-dialog>

    <v-dialog v-model="createDialog" width="500">
      <v-card>
        <v-form @submit.prevent="create">
        <v-card-title class="headline grey lighten-2">
          Create New Account
        </v-card-title>

        <v-card-text>
          <v-text-field
              v-if="createDialog"
              label="Username"
              v-model="username"
              :rules="[rules.required]"
          ></v-text-field>
          <v-text-field
              v-if="createDialog"
              label="Password"
              v-model="password"
              type="password"
              hint="Please do not use a real password"
              persistent-hint
              :rules="[rules.required]"
          ></v-text-field>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="createDialog = false">Cancel</v-btn>
          <v-btn color="success" text type="submit">Create</v-btn>
        </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <v-navigation-drawer
      v-model="drawer"
      absolute
      temporary
    >
      <v-list class="pa-1">
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title class="text-body-1">Mood Music</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-divider></v-divider>

      <v-list class="pt-0" dense>
        <v-list-item
          v-for="item in items"
          :key="item.title"
          router-link
          :to="item.link"
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-divider></v-divider>
      </v-list>

      <v-list class="pt-0" dense v-if="isAdmin">
        <v-list-item
          v-for="aItem in adminItems"
          :key="aItem.title"
          router-link
          :to="aItem.link"
        >
          <v-list-item-action>
            <v-icon>{{ aItem.icon }}</v-icon>
          </v-list-item-action>

          <v-list-item-content>
            <v-list-item-title>{{ aItem.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <transition name="page" mode="out-in">
        <router-view></router-view>
      </transition>
    </v-main>

  </v-app>
</template>

<script>
import axios from "axios"; // package used to talk to the API

export default {
  name: 'App',
  data () {
    return {
      drawer: null,
      items: [
        { title: 'Home', icon: 'mdi-home', link: "/" },
        { title: 'Playlists', icon: 'mdi-playlist-music', link: "/playlist"},
        { title: 'Song Search', icon: 'mdi-magnify', link: "/search"},
        { title: 'Visualizations', icon: 'mdi-graph', link: "/vizu"},
      ],
      adminItems: [
        { title: 'Songs', icon: 'mdi-music-box-multiple', link: "/songs" },
        { title: 'Artist', icon: 'mdi-account-music', link: "/artists" },
        { title: 'Genre', icon: 'mdi-playlist-music', link: "/genres"},
        { title: 'Artist Genre', icon: 'mdi-album', link: "/artgenre"},
        { title: 'Complex Q\'s', icon: 'mdi-animation-play-outline', link: "/complex"}
      ],
      loginDialog: false,
      createDialog: false,
      isLogin: false,
      error: false,
      isAdmin: false,
      errMsg: '',
      password: null,
      username: null,
      rules: { // These are sorta complicated and not needed at all besides for show
          required: value => !!value || 'Required.'
      }
    }
  },
  methods: {
      login() { // Try not to edit or could break login 'system'
        console.log("login")
        axios
          .post("https://mood.leinad.pw/login", {username: this.username, password: this.password})
          .then((response) => {
              // console.log(response.data.results[0].user_id)
              this.error = false
              this.loginDialog = false
              this.isLogin = true
              if (response.data.results[0].user_id == 1) {
                  this.isAdmin = true
                  // this.tableHeaders.push({text: "Actions", value: "actions", sortable: false})
              }
              localStorage.username = this.username
              localStorage.password = this.password
              localStorage.userId = response.data.results[0].user_id
              this.$router.go()
          })
          .catch((err) => {
              console.error(err)
              this.error = true
              if (err.response.data.code === 400) {
                  this.errMsg = err.response.data.error
              } else if (err.response.data.code === 500) {
                  this.errMsg = err.response.data.error
              } else {
                  this.errMsg = "Unknown Error. Try Again."
              }
          })
      },
      logout() {  // Opposite as login() and much simpler
        localStorage.removeItem("username")
        localStorage.removeItem("password")
        localStorage.removeItem("userId")
        this.username = ''
        this.password = ''
        this.isLogin = false
        this.isAdmin = false
        this.$router.go()
      },
      create() {
        axios
          .post("https://mood.leinad.pw/create", {username: this.username, password: this.password})
          .then((response) => {
              this.createDialog = false
              console.log(response)
              this.login()
          })
          .catch((err) => {
              console.error(err)
          })
      }
  },
  mounted() {
      if (localStorage.username && localStorage.password) {
          this.username = localStorage.username
          this.password = localStorage.password
          this.isLogin = true
          // console.log(localStorage.userId == 1)
          if (localStorage.userId == 1) {
              this.isAdmin = true
          }
      }
  }
}
</script>
