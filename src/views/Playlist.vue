<template>
  <!--
  happy		>0.6	> 0.6	> -30 	>120	> 0.5
  excited		>0.75	> 0.8	>-20	>130 	> 0.75
  sad		<0.5	<0.4	<-20	<100	< 0.4
  anx		>0.3	<0.5	<-30	<90	<0.4
  neut 		same as previously
  angry 		<0.5	>0.6	>-30 	>110	>0.5
  -->
  <!-- <div> -->
  <v-container fill-height>
    <!-- <v-app-bar dense dark></v-app-bar> -->
    <v-row align="center" justify="center">
      <v-col v-if="!isLogin" cols="6" >
        <v-card>
            <v-card-title>Not Logged In</v-card-title>
            <v-card-text>Login or Create an Account to view playlists!</v-card-text>
            <!-- <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="psuedoLogin()">Login</v-btn>
                <v-btn>Create Account</v-btn>
            </v-card-actions> -->
        </v-card>
      </v-col>

      <v-col v-if="isLogin" cols="3" class="pa-3 d-flex flex-column" >
        <v-card tile>
          <v-card-title v-if="playlist_names.length > 0" primary-title>{{playlists[idx].playlist_name}}</v-card-title>
          <v-card-title v-else>No Playlists</v-card-title>
          <v-card-subtitle>Amount: {{dataLength}} | Duration: {{totalDuration}} | Avg. Pop: {{avgPop}} | Mood: {{totalMood}} | Avg. Genre: {{avgGenre}}</v-card-subtitle>
          <v-divider></v-divider>
          <v-card-text style="overflow-y: auto">
            <v-list flat>
              <v-list-item-group v-if="playlist_names" v-model="selectedItem" color="success">
                <v-list-item v-for="(list, i) in playlist_names" :key="i" @click="getSongs(i)">
                  <v-list-item-icon><v-icon>{{"mdi-playlist-music"}}</v-icon></v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title v-text="list"></v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-group>
            </v-list>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn @click="createPlaylist()">Add Playlist</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col v-if="isLogin" cols="9" class="pa-3 d-flex flex-column" >
        <v-card flat>
          <v-card-text>
            <!-- This is the main table on the page -->
            <v-data-table
              :headers="tableHeaders"
              :items="tableData"
              :items-per-page="5"
              :search="tableSearch"
              class="elevation-1"
            >

              <!-- Converts the song_id column into a nice button that brings you to the song link -->
              <template v-slot:[`item.song_id`]="{ item }">
                <v-btn class="mr-2" target="_blank" icon :href="`https://open.spotify.com/embed/track/${item.song_id}`">
                  <v-icon>mdi-play-circle-outline</v-icon>
                </v-btn>
              </template>

              <!-- Converts the duration column into an actual time -->
              <template v-slot:[`item.duration`]="{ item }">
                {{ item.duration ? Math.floor(item.duration/60000) + ":" + (item.duration % 60) : '' }} <!-- lol -->
              </template>

              <template v-slot:top>
                <v-toolbar flat>
                  <v-text-field
                    v-model="tableSearch"
                    append-icon="mdi-magnify"
                    label="Search"
                    single-line
                    hide-details
                  ></v-text-field>
                  <v-spacer></v-spacer>
                  <v-btn color="error" dark @click="deletePlaylist()" icon>
                    <v-icon dark>mdi-close</v-icon>
                  </v-btn>
                </v-toolbar>
              </template>

              <template v-slot:[`item.actions`]="{ item }">
                <v-icon small right @click="deleteSong(item)">mdi-delete</v-icon>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="deleteDialog" max-width="600px">
      <v-card>
        <v-card-title class="headline justify-center">Are you sure you want to delete this playlist?</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="confirmDelete()">Confirm</v-btn>
            <v-btn color="blue darken-1" text @click="deleteDialog = false">Cancel</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="createDialog" max-width="500px">
      <v-card>
        <v-form v-model="createFormValid" @submit.prevent="confirmCreate">
          <v-card-title>
            <span class="headline">Create Playlist</span>
          </v-card-title>

          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field v-model="newTitle" :rules="[rules.required, rules.limit]" label="Title"></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="createDialog = false">Cancel</v-btn>
            <v-btn color="blue darken-1" :disabled="!createFormValid" text type="submit">Create</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
  <!-- </div> -->
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  name: "Playlist", // name of this particular web page
  data() {
    return {
        editDialog: false,
        deleteDialog: false,
        createDialog: false,
        createFormValid: false,
        selectedItem: 0,
        isLogin: false,
        id: null,
        idx: 0,
        totalDuration: 0,
        avgPop: 0,
        userId: null,
        tableData: [],
        dataLength: 0,
        totalMood: '',
        avgGenre: '',
        username: '',
        playlists: [],
        playlist_names: [],
        tableSearch: '',
        tableHeaders: [
          {text: "Link", value: "song_id", sortable: false},
          {text: "Song Name", value: "song_name", sortable: false},
          {text: "Artist", value: "artist_name", sortable: false},
          {text: "Release Year", value: "year"},
          {text: "Duration", value: "duration"},
        ],
        newTitle: '', 
        rules: { // These are sorta complicated and not needed at all besides for show
          required: value => !!value || 'Required.',
        }
    };
  },
  methods: {
    createPlaylist() {
      this.createDialog = true
    },
    confirmCreate() {
      this.createDialog = false
      axios
        .post("https://mood.leinad.pw/playlist/create", {userId: this.userId, name: this.newTitle})
        .then((response) => {
            console.log(response)
            this.$router.go()
        })
        .catch((err) => {
            console.error(err)
        })
    },
    deleteSong(song) {
      // console.log(song)
      axios
        .post("https://mood.leinad.pw/playlist/song/delete", {playlistId: this.id, songId: song.song_id})
        .then((response) => {
            console.log(response)
            this.getSongs(this.idx)
            // this.$router.go()
        })
        .catch((err) => {
            console.error(err)
        })
    },
    deletePlaylist() {
      this.deleteDialog = true
    },
    confirmDelete() {
      this.deleteDialog = false
      console.log(this.id)
      axios
        .post("https://mood.leinad.pw/playlist/delete", {id: this.id})
        .then((response) => {
            console.log(response)
            this.$router.go()
        })
        .catch((err) => {
            console.error(err)
        })
    },
    getSongs(idx) {
      this.idx = idx
      this.id = this.playlists[idx].playlist_id
      axios
        .post("https://mood.leinad.pw/playlist/songs", {id: this.id})
        .then((response) => {
            // console.log(response.data.results)-
            axios
              .post("https://mood.leinad.pw/playlist/stats", {id: this.id})
              .then((res) => {
                  console.log(res.data.results[0][0])
                  let tmp = res.data.results[0][0]
                  this.totalDuration = tmp.dur
                  this.totalMood = tmp.finalmood
                  this.avgPop = tmp.pop
                  this.avgGenre = tmp.finalgenre
              })
              .catch((error) => {
                  console.error(error)
              })
            this.tableData = response.data.results
            this.dataLength = response.data.results.length
            // const sumValues = obj => Object.values(obj).reduce((song_id, duration) => song_id + duration);
            // var total
            // this.totalDuration = 0
            // this.avgPop = 0
            // for (let i = 0; i < this.dataLength; i++) {
            //     this.totalDuration += response.data.results[i].duration
            //     this.avgPop += response.data.results[i].popularity
            // }
            // // console.log(sumValues(response.data.results))
            // this.totalDuration = this.totalDuration ? Math.floor(this.totalDuration/60000) + ":" + (this.totalDuration % 60) : ''
            // this.avgPop = this.avgPop ? this.dataLength / this.dataLength : ''
        })
        .catch((error) => {
            console.error(error)
        })
    },
    search() {
      axios
        .post("https://mood.leinad.pw/playlists", {userId: this.userId})
        .then((response) => {
            console.log(response)
            if (response.data.results.length > 0) {
              this.playlists = response.data.results
              this.playlists.forEach(playlist => {
                this.playlist_names.push(playlist.playlist_name)
              });
              // console.log(this.playlist_names)
              this.getSongs(this.selectedItem)
            }
        })
        .catch((error) => {
            console.error(error)
        })
    },
  },
  mounted() {
      console.log("mounted")
      if (localStorage.username) {
          console.log("user logged in")
          this.isLogin = true
          this.username = localStorage.username
          this.userId = localStorage.userId
      }
      if (this.isLogin) {
          this.search()
          this.tableHeaders.push({text: "Actions", value: "actions", sortable: false})
      }
  }
};
</script>
