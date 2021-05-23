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
    </v-data-table>

    <v-btn @click="search1()">Complex 1</v-btn>
    <v-btn @click="search2()">Complex 2</v-btn>
    <v-btn @click="search3()">Complex 3</v-btn>
    <v-btn @click="search4()">Complex 4</v-btn>
  </div>
</template>

<script>
import axios from "axios"; // package used to talk to the API
export default {
  name: "Complex", // name of this particular web page
  data() { // this segment holds all the state data the web page uses for logic and what not, it has a lot of..stuff
    return {
      loginDialog: false,
      isLogin: false,
      isAdmin: false,
      username: '',
      password: '',
      tableData: [],
      queryCount: 10,
      dataLength: 15,
      tableSearch: '',
      tableLoading: false,
      errMsg: '',
      error: false,
      tableHeaders: [],
      searchForm: {
        new_data: '',
        new_limit: 10
      },
    };
  },
  methods: { // "methods" is an object of functions that the webpage can/will run
    search1() { // Could be used to search a table by sending a post request
      this.tableHeaders = [
        {text: "User ID", value: "user_id"},
        {text: "Playlist ID", value: "playlist_id"},
        {text: "Song Name", value: "song_name"},
        {text: "Artist ID", value: "artist_id"},
        {text: "Duration", value: "duration"},
        {text: "Release Year", value: "year"}
      ]
      this.tableLoading = true
      this.searchDialog = false
      this.searchForm.limit = this.searchForm.new_limit

      axios
        .get(`https://mood.leinad.pw/complex/1`, {search: this.searchForm, edited: this.searchEdited})
        .then((response) => {
            console.log(response)
            this.tableData = response.data.results
            this.dataLength = response.data.results.length
            this.tableLoading = false
        })
        .catch((error) => {
            console.error(error)
            this.tableLoading = false
        })
    },
    search2() { // Could be used to search a table by sending a post request
      this.tableHeaders = [
        {text: "Mean Popularity", value: "avgPop"},
        {text: "Artist Name", value: "artist_name"}
      ]
      this.tableLoading = true
      this.searchDialog = false
      this.searchForm.limit = this.searchForm.new_limit

      axios
        .get(`https://mood.leinad.pw/complex/2`, {search: this.searchForm, edited: this.searchEdited})
        .then((response) => {
            console.log(response)
            this.tableData = response.data.results
            this.dataLength = response.data.results.length
            this.tableLoading = false
        })
        .catch((error) => {
            console.error(error)
            this.tableLoading = false
        })
    },
    search3() { // Could be used to search a table by sending a post request
      this.tableHeaders = [
        {text: "Song Name", value: "song_name"},
        {text: "Times in Playlists", value: "plCnt"}
      ]
      this.tableLoading = true
      this.searchDialog = false
      this.searchForm.limit = this.searchForm.new_limit

      axios
        .get(`https://mood.leinad.pw/complex/3`, {search: this.searchForm, edited: this.searchEdited})
        .then((response) => {
            console.log(response)
            this.tableData = response.data.results
            this.dataLength = response.data.results.length
            this.tableLoading = false
        })
        .catch((error) => {
            console.error(error)
            this.tableLoading = false
        })
    },
    search4() { // Could be used to search a table by sending a post request
      this.tableHeaders = [
        {text: "Genre Name", value: "genre_name"},
        {text: "Artists in Genre", value: "grpCat"}
      ]
      this.tableLoading = true
      this.searchDialog = false
      this.searchForm.limit = this.searchForm.new_limit

      axios
        .get(`https://mood.leinad.pw/complex/4`, {search: this.searchForm, edited: this.searchEdited})
        .then((response) => {
            console.log(response)
            this.tableData = response.data.results
            this.dataLength = response.data.results.length
            this.tableLoading = false
        })
        .catch((error) => {
            console.error(error)
            this.tableLoading = false
        })
    }
  },
};
</script>
