<template>
  <div class="home">
    <!-- No clue why this is needed -->
    <v-app-bar dense dark></v-app-bar>

    <!-- This is the main table on the page -->
    <v-data-table
      :headers="tableHeaders"
      :items="tableData"
      :items-per-page="5"
      :loading="tableLoading"
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

          <!-- Search and add buttons at the top of the table here -->
          <v-btn color="success" dark @click="searchDialog = true" icon>
            <v-icon dark>mdi-magnify</v-icon>
          </v-btn>
        </v-toolbar>
      </template>

      <template v-if="isLogin" v-slot:[`item.actions`]="{ item }">
        <v-icon small right x-large @click="addSong(item)">mdi-plus</v-icon>
      </template>
    </v-data-table>

    <!-- This dialog (pop-up) is what appears when the user presses the magnifying glass button -->
    <v-dialog v-model="searchDialog" max-width="500px">
      <v-card>
        <v-form v-model="searchFormValid" @submit.prevent="search">
          <v-card-title>
            <span class="headline">Search Songs</span>
          </v-card-title>
          <v-card-subtitle>Note: Searching by mood invalidates all other search paramaters</v-card-subtitle>

          <v-card-text>
            <v-container>
                <v-row>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="searchForm.new_limit" type="number" :rules="[rules.number]" label="Limit"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="searchForm.new_id"  label="Song ID"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="searchForm.new_name" label="Song Name"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field v-model="searchForm.new_artist" label="Artist"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="searchForm.new_year" type="number" label="Release Year"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="searchForm.new_dur" type="number" label="Duration"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="searchForm.genre" label="Genre"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-select :items="moods" v-model="searchForm.mood" label="Mood"></v-select>
                  </v-col>
                </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="searchDialog = false">Cancel</v-btn>
            <v-btn color="blue darken-1" :disabled="!searchFormValid" text type="submit">Search</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

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
  </div>
</template>

<script>
import axios from "axios"; 

export default {
  name: "Search", // name of this particular web page
  data() { 
    return {
      moods: ["None", "Happy", "Neutral", "Sad", "Anxious", "Angry", "Neutral"],
      searchDialog: false,
      searchFormValid: false,
      playlistFormValid: false,
      isLogin: false,
      username: '',
      tableData: [],
      queryCount: 10,
      currPlaylist: '',
      dataLength: 15,
      tableSearch: '',
      userId: null,
      formValid: false,
      tableLoading: true,
      playlistDialog: false,
      errMsg: '',
      error: false,
      emptyForm: false,
      songToAdd: {},
      playlist_names: [],
      playlists: [],
      tableHeaders: [
        {text: "Link", value: "song_id", sortable: false},
        {text: "Song Name", value: "song_name", sortable: false},
        {text: "Artist", value: "artist_name", sortable: false},
        {text: "Release Year", value: "year"},
        {text: "Duration", value: "duration"},
      ],
      searchForm: {
        new_id: '',
        new_name: '',
        new_artist: '',
        new_year: null,
        new_dur: null,
        genre: '',
        mood: '',
        new_limit: 10
      },
      rules: { // These are sorta complicated and not needed at all besides for show
          required: value => !!value || 'Required.',
          counter: value => value.length <= 100 || 'Max 100 characters',
          limit: value => value <= 170186 || 'Max number of rows is 170186',
          number: value => !isNaN(value) || 'Field Must Be Number'
      }
    };
  },
  methods: { // "methods" is an object of functions that the webpage can/will run
    search() { // Could be used to search a table by sending a post request
      this.tableLoading = true
      this.searchDialog = false
      this.searchForm.limit = this.searchForm.new_limit
      this.searchEdited = 0

      // this should be illegal
      this.searchEdited = (this.searchForm.new_id.length > 0 ? true : this.searchEdited)
      this.searchEdited = (this.searchForm.new_name.length > 0 ? true : this.searchEdited)
      this.searchEdited = (this.searchForm.new_artist.length > 0 ? true : this.searchEdited)
      this.searchEdited = (this.searchForm.new_year ? true : this.searchEdited)
      this.searchEdited = (this.searchForm.new_dur ? true : this.searchEdited)
      this.searchEdited = (this.searchForm.genre ? true : this.searchEdited)
      console.log(this.searchForm.new_year)
      this.emptyForm = !this.searchEdited

      let moodSearch = this.searchForm.mood.length > 0 ? true : false
      if (this.searchForm.mood == "None") {
          this.searchForm.mood = ''
          moodSearch = false
      }
      // console.log(moodSearch)
      axios
        .post("https://mood.leinad.pw/search", {search: this.searchForm, edited: this.searchEdited, empty: this.emptyForm, isMood: moodSearch})
        .then((response) => {
            console.log(response)
            if (moodSearch) {
              this.tableData = response.data.results[0]
              this.dataLength = response.data.results[0].length
            } else {
              this.tableData = response.data.results
              this.dataLength = response.data.results.length
            }
            this.tableLoading = false
        })
        .catch((error) => {
            console.error(error)
            this.tableLoading = false
        })
    },
    addSong(song) {
        console.log(song)
        this.songToAdd = song
        this.playlistDialog = true
        axios
          .post("https://mood.leinad.pw/playlists", {userId: this.userId})
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
    },
    addConfirm() {
      console.log(this.currPlaylist)
      this.playlistDialog = false

      axios
        .post("https://mood.leinad.pw/playlist/getId", {name: this.currPlaylist, id: this.userId})
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
        .post("https://mood.leinad.pw/playlist/song/insert", {playlistId: user_id, songId: song_id})
        .then((response) => {
            console.log(response)
        })
        .catch((err) => {
            console.error(err)
        })
    }
  },
  mounted() { // The function here runs when the page loads (i.e. loads data into the table)
    this.search()
    if (localStorage.username) {
        this.isLogin = true
        this.username = localStorage.username
        this.tableHeaders.push({text: "Actions", value: "actions", sortable: false})
        this.userId = localStorage.userId
    }
  }
};
</script>
