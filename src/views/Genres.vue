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

          <v-spacer></v-spacer>

          <!-- Search and add buttons at the top of the table here -->
          <v-btn color="success" dark @click="searchDialog = true" icon>
            <v-icon dark>mdi-magnify</v-icon>
          </v-btn>
          <v-btn color="primary" dark @click="insertDialog = true" icon>
            <v-icon dark>mdi-playlist-plus</v-icon>
          </v-btn>

          <!-- This dialog (pop-up) is for inserting new data into the table -->
          <v-dialog v-model="insertDialog" max-width="500px">

            <!-- This code only runs if the user that is logged in is an admin -->
            <v-card v-if="isAdmin">
              <v-card-title>
                <span class="headline">Form Title</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-form v-model="insertFormValid">
                    <v-row>
                      <v-col cols="12" sm="6" md="4">
                        <v-text-field v-model="insertForm.new_data" label="Genre Name"></v-text-field>
                      </v-col>
                    </v-row>
                  </v-form>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="insertDialog = false">Cancel</v-btn>
                <v-btn color="blue darken-1" :disabled="!insertFormValid" text @click="insert()">Save</v-btn>
              </v-card-actions>
            </v-card>

            <!-- This code runs when the user is anything besides admin -->
            <v-card v-else>
              <v-card-title class="justify-center">
                <span class="headline justify-center">Admin Perms Required</span>
              </v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="insertDialog = false">Close</v-btn>
              </v-card-actions>
            </v-card>

          </v-dialog>

        </v-toolbar>
      </template>

      <!-- This is a column in the table that only appears when the admin user is logged in -->
      <template v-if="isAdmin" v-slot:[`item.actions`]="{ item }">
        <v-icon small class="mr-2" @click="editItem(item)">mdi-pencil</v-icon>
        <v-icon small @click="deleteItem(item)">mdi-delete</v-icon>
      </template>

    </v-data-table>

    <!-- This dialog (pop-up) is what appears when the user presses the magnifying glass button -->
    <v-dialog v-model="searchDialog" max-width="500px">
      <v-card>
        <v-form v-model="searchFormValid" @submit.prevent="search">
          <v-card-title>
            <span class="headline">Fetch Data</span>
          </v-card-title>

          <v-card-text>
            <v-container>
                <v-row>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="searchForm.new_limit" type="number" :rules="[rules.number]" label="Limit"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="searchForm.new_data"  label="Genre Name"></v-text-field>
                  </v-col>
                </v-row>
                <!-- <v-btn color="blue darken-1" text @click="searchDialog = false">Cancel</v-btn>
                <v-btn color="blue darken-1" :disabled="!searchFormValid" text type="submit">Fetch</v-btn> -->
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="searchDialog = false">Cancel</v-btn>
            <v-btn color="blue darken-1" :disabled="!searchFormValid" text type="submit">Fetch</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

      <!-- This dialog appears when the admin user presses the delete button -->
    <v-dialog v-model="confirmDeleteDialog" max-width="600px">
      <v-card>
        <v-card-title class="headline justify-center">Are you sure you want to delete this genre?</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="confirmDelete()">Ok</v-btn>
            <v-btn color="blue darken-1" text @click="confirmDeleteDialog = false">Cancel</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- This dialog appears when the admin user presses the edit button -->
    <v-dialog v-model="editDialog" max-width="500px">
      <v-card>
        <v-form v-model="editFormValid" @submit.prevent="edit">
          <v-card-title>
            <span class="headline">Edit Entry</span>
          </v-card-title>

          <v-card-text>
            <v-container>
                <v-row>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="editObject.genre_name" :disabled="false" label="Genre Name"></v-text-field>
                  </v-col>
                </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="editDialog = false">Cancel</v-btn>
            <v-btn color="blue darken-1" :disabled="!editFormValid" text type="submit">Edit</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import axios from "axios"; // package used to talk to the API
export default {
  name: "Genres", // name of this particular web page
  data() { // this segment holds all the state data the web page uses for logic and what not, it has a lot of..stuff
    return {
      loginDialog: false,
      searchDialog: false,
      deleteDialog: false,
      insertDialog: false,
      editDialog: false,
      insertFormValid: false,
      searchFormValid: false,
      confirmDeleteDialog: false,
      editFormValid: false,
      isLogin: false,
      isAdmin: false,
      username: '',
      password: '',
      tableData: [],
      queryCount: 10,
      dataLength: 15,
      tableSearch: '',
      formValid: false,
      tableLoading: true,
      errMsg: '',
      error: false,
      searchEdited: false,
      deleteObject: {},
      editObject: {},
      tableHeaders: [
        {text: "Genre Name", value: "genre_name"}
      ],
      insertForm: {
        new_data: '',
      },
      searchForm: {
        new_data: '',
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

      this.searchEdited = (this.searchForm.new_data.length > 0 ? true : this.searchEdited)
      this.emptyForm = !this.searchEdited

      axios
        .post("https://mood.leinad.pw/genres/search", {search: this.searchForm, edited: this.searchEdited, empty: this.emptyForm})
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
    insert() { // Could be used to insert into the table using a put request
      console.log(this.insertForm)
      this.insertDialog = false
      // insert API call to insert function
      axios
        .post("https://mood.leinad.pw/genres/insert", {insert: this.insertForm})
        .then((response) => {
            console.log(response)
        })
        .catch((error) => {
            console.error(error)
        })
    },
    edit() { // Could be used to edit a table entry using a post request
        console.log(this.editObject)
        this.editDialog = false
        axios
          .post("https://mood.leinad.pw/genres/edit", {edit: this.editObject})
          .then((response) => {
              console.log(response)
          })
          .catch((error) => {
              console.error(error)
          })
    },
    confirmDelete() { // Could be used to delete a table entry using a delete request
        this.confirmDeleteDialog = false
        console.log(this.deleteObject.genre_name)
        axios
          .delete("https://mood.leinad.pw/genres/delete", {data: {genre_name: this.deleteObject.genre_name}})
          .then((response) => {
              console.log(response);
              this.search();
          })
          .catch((error) => {
              console.error(error);
          })
    },
    deleteItem(item) { // This is needed for the confirm delete dialog to work
        console.log(item)
        this.deleteObject = item
        this.confirmDeleteDialog = true
    },
    editItem(item) { // Used to prepare an entry to be edited
        this.editObject = item
        this.editObject.old_form = item.genre_name
        this.editDialog = true
    },
  },
  mounted() { // The function here runs when the page loads (i.e. loads data into the table)
    this.search()
    if (localStorage.userId == 1) {
      this.isAdmin = true
      this.tableHeaders.push({text: "Actions", value: "actions", sortable: false})
    }
  }
};
</script>
