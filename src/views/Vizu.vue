<template>
  <v-container fill-height>
    <v-row align="center" justify="center">
      <v-col cols="5">
        <ChartComp :chart-data="chartData"></ChartComp>
        <v-select :items="amntYears" :label="getLabel()" v-model="amount" @change="test()"></v-select>
      </v-col>
    </v-row>
  </v-container>
</template>



<script>
import ChartComp from "../components/ChartComp.vue"
import axios from "axios";

export default {
  components: {
    ChartComp
  },
  name: "Vizu", // name of this particular web page
  data () {
    return {
      chartData: {},
      allData: [],
      allLabels: [],
      amntYears: [5, 10, 20, 30, 50, 70, 80, 100],
      amount: 10,
    }
  },
  methods: {
    getRandColor() {
        return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    },
    changeData() {
      this.chartData = {
        labels: this.allLabels.slice(0, this.amount),
        datasets: [{label: "Songs Per Year", data: this.allData.slice(0, this.amount), backgroundColor: this.getRandColor}]
      }
    },
    test() {
        this.changeData()
    },
    getLabel() {
        return `Last ${this.amount} Years`
    }
  },
  mounted () {
    axios
      .get("http://leinad.pw:9001/vizu/years")
      .then((response) => {
          // console.log(response.data.results)
          // let chartLabels = []
          // let chartData = []
          // let chartColors = []
          response.data.results.forEach(element => {
              // console.log(element)
              this.allLabels.push(element.year)
              this.allData.push(element.cnt)
              // chartColors.push('#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'))
          });
          // console.log(this.data)
          // this.allData = 
          this.changeData()
      })
      .catch((err) => {
          console.error(err)
      })
  },
};
</script>
