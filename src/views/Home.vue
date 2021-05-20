<template>
  <!--
  happy		>0.6	> 0.6	> -30 	>120	> 0.5
  excited		>0.75	> 0.8	>-20	>130 	> 0.75
  sad		<0.5	<0.4	<-20	<100	< 0.4
  anx		>0.3	<0.5	<-30	<90	<0.4
  neut 		same as previously
  angry 		<0.5	>0.6	>-30 	>110	>0.5
  -->

  <v-container fill-height>
    <!-- <v-card>
      how ya feelin bud
    </v-card> -->
    <v-row v-if="!hasMoods && !noData" no-gutters justify="center" align="center">

      <v-col cols="3">
        <v-card height="200px" hover rounded @click="moodHappy = !moodHappy" :dark="moodHappy">
            <v-card-title class="justify-center">Happy</v-card-title>
            <v-card-actions class="justify-center">
                <v-icon x-large>mdi-emoticon-happy-outline</v-icon>
            </v-card-actions>
        </v-card>
        <v-card height="200px" hover rounded @click="moodExcited = !moodExcited" :dark="moodExcited">
            <v-card-title class="justify-center">Excited</v-card-title>
            <v-card-actions class="justify-center">
                <v-icon x-large>mdi-emoticon-excited-outline</v-icon>
            </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="3">
        <v-card height="200px" hover rounded @click="moodAnxious = !moodAnxious" :dark="moodAnxious">
            <v-card-title class="justify-center">Anxious</v-card-title>
            <v-card-actions class="justify-center">
                <v-icon x-large>mdi-emoticon-cry-outline</v-icon>
            </v-card-actions>
        </v-card>
        <v-card height="200px" hover rounded @click="moodNeutral = !moodNeutral" :dark="moodNeutral">
            <v-card-title class="justify-center">Neutral</v-card-title>
            <v-card-actions class="justify-center">
                <v-icon x-large>mdi-emoticon-neutral-outline</v-icon>
            </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="3">
        <v-card height="200px" hover rounded @click="moodSad = !moodSad" :dark="moodSad">
            <v-card-title class="justify-center">Sad</v-card-title>
            <v-card-actions class="justify-center">
                <v-icon x-large>mdi-emoticon-sad-outline</v-icon>
            </v-card-actions>
        </v-card>
        <v-card height="200px" hover rounded @click="moodAngry = !moodAngry" :dark="moodAngry">
            <v-card-title class="justify-center">Angry</v-card-title>
            <v-card-actions class="justify-center">
                <v-icon x-large>mdi-emoticon-angry-outline</v-icon>
            </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- lol -->
    <v-row v-if="!hasMoods && !noData" no-gutters justify="center" align="center">
      <v-btn color="success" :loading="loading" @click="showTable()" :disabled="!moodHappy && !moodAnxious && !moodSad && !moodAngry && !moodNeutral && !moodExcited">
        Find Songs
      </v-btn>
    </v-row>

    <v-row v-if="noData" no-gutters justify="center" align="center">
      <v-card>
        <v-card-title>No Data! :(</v-card-title>
        <v-card-text>There's no good songs for your current mood</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="reset()">Try Again</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-row>

    <v-row v-if="hasMoods" no-gutters justify="center" align="center">
      <v-col cols="9" class="pa-3 d-flex flex-column" >
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
                </v-toolbar>
              </template>

              <template v-if="isLogin" v-slot:[`item.actions`]="{ item }">
                <v-icon small right x-large @click="addSong(item)">mdi-plus</v-icon>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="hasMoods" no-gutters justify="center" align="center">
      <v-btn color="primary" @click="reset()">
        Search Again
      </v-btn>
    </v-row>

    <v-dialog v-model="playlistDialog" max-width="500px">
      <v-card>
        <v-form v-model="playlistFormValid" @submit.prevent="addConfirm">
          <v-card-title>
            <span class="headline">Add to Playlist</span>
          </v-card-title>

          <v-card-text>
            <v-container>
              <v-row>
                <v-select :items="playlist_names" v-model="currPlaylist" ></v-select>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="playlistDialog = false">Cancel</v-btn>
            <v-btn color="blue darken-1" :disabled="!playlistFormValid" text type="submit">Add</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import axios from "axios"

export default {
  name: "Home", // name of this particular web page
  data() {
    return {
        moods: [],
        moodHappy: false,
        moodExcited: false,
        moodAnxious: false,
        moodAngry: false,
        moodNeutral: false,
        playlistFormValid: false,
        currPlaylist: '',
        playlistDialog: false,
        songToAdd: {},
        playlist_names: [],
        playlists: [],
        moodSad: false,
        tableSearch: '',
        tableHeaders: [
          {text: "Link", value: "song_id", sortable: false},
          {text: "Song Name", value: "song_name", sortable: false},
          {text: "Artist", value: "artist_name", sortable: false},
          {text: "Release Year", value: "year"},
          {text: "Duration", value: "duration"},
        ],
        tableData: [],
        dataLength: null,
        hasMoods: false,
        loading: false,
        isLogin: false,
        noData: false,
    };
  },
  methods: {
    showTable() {
        this.loading = true
        let moods = []
        if (this.moodHappy) moods.push("happy")
        if (this.moodExcited) moods.push("excited")
        if (this.moodAnxious) moods.push("anxious")
        if (this.moodAngry) moods.push("angry")
        if (this.moodNeutral) moods.push("neutral")
        if (this.moodSad) moods.push("sad")
        axios
          .post("http://leinad.pw:9001/moods", {moods: moods})
          .then((response) => {
              console.log(response)
              if (response.data.rtn.length > 0) {
                this.tableData = response.data.rtn
                this.dataLength = response.data.rtn.length
                this.hasMoods = true
                this.loading = false
              } else {
                this.noData = true
                this.loading = false
              }
          })
          .catch((err) => {
              console.error(err)
              this.loading = false
              // this.hasMoods = true
          })
    },
    reset() {
        this.hasMoods = false
        this.loading = false
        this.noData = false
        this.tableData = []
        this.dataLength = 0
        this.moods = []
        this.moodHappy = false
        this.moodExcited = false
        this.moodAnxious = false
        this.moodAngry = false
        this.moodNeutral = false
        this.moodSad = false
    },
    addSong(song) {
        console.log(song)
        this.songToAdd = song
        this.playlistDialog = true
        axios
          .post("http://leinad.pw:9001/playlists", {userId: this.userId})
          .then((response) => {
              // console.log(response)
              if (response.data.results.length > 0) {
                this.playlists = response.data.results
                this.playlists.forEach(playlist => {
                  this.playlist_names.push(playlist.playlist_name)
                });
                console.log(this.playlist_names)
                // this.getSongs(this.selectedItem)
              }
          })
          .catch((error) => {
              console.error(error)
          })
        // note to future me
        // have this function open a new dialog
        // in that dialog just ask get a list of all playlists
        // then let the user select a playlist they have and add the song
        // ez pz
    },
    addConfirm() {
      console.log(this.currPlaylist)
      this.playlistDialog = false

      axios
        .post("http://leinad.pw:9001/playlist/getId", {name: this.currPlaylist, id: this.userId})
        .then((response) => {
            console.log(response.data.results)
            this.addToPlaylist(response.data.results[0].playlist_id, this.songToAdd.song_id)
        })
        .catch((err) => {
            console.error(err)
        })
    },
    addToPlaylist(user_id, song_id) {
      console.log(user_id, song_id)
      axios
        .post("http://leinad.pw:9001/playlist/song/insert", {playlistId: user_id, songId: song_id})
        .then((response) => {
            console.log(response)
        })
        .catch((err) => {
            console.error(err)
        })
    }
  },
  mounted() {
    if (localStorage.username) {
        this.isLogin = true
        this.username = localStorage.username
        this.userId = localStorage.userId
    }
    if (this.isLogin) {
        this.tableHeaders.push({text: "Actions", value: "actions", sortable: false})
    }
  }
};
</script>
