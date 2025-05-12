console.log("Script file connected: 100");

let playerName = prompt("Palun sisesta oma nimi")

class Typer {
    constructor(pname) {
        this.name = pname;
        this.wordsInGame = 3;
        this.startingWordLength = 3;
        this.words = [];
        this.word = "START";
        this.typeWords = [];
        this.startTime = 0;
        this.endTime = 0;
        this.typedCount = 0;
        this.allResults = [];
        this.score = 0;
        this.bonus = 0;
        this.resultCount = 0;
        
        this.loadFromFile();
        this.showFewResults(this.resultCount);
    }

    loadFromFile() {
        $.get("lemmad.txt", (data) => this.getWords(data));
        $.get("database.txt", (data) => {
            let content = JSON.parse(data).content;
            this.allResults = content;
            //this.showAllResults();
            console.log( content);
        });
    }

    getWords(data) {
        //console.log(data);
        const dataFromFile = data.split("\r\n");
        this.separateWordsByLength(dataFromFile);
    }

    separateWordsByLength(data) {
        for(let i = 0; i < data.length; i++) {
            const wordLength = data[i].length;

            // teeme tühja massiivi
            if(this.words[wordLength] === undefined) {
                this.words[wordLength] = [];
            }

            this.words[wordLength].push(data[i]);

        }

        console.log(this.words);

        this.startTyper();
    }

    startTyper() {
        let urlParam = new URLSearchParams(window.location.search);
        if(urlParam.get("words")) {
            console.log(urlParam.get("words"));
            this.wordsInGame = urlParam.get("words");
        }
        this.generateWords();
        this.startTime = performance.now();
        $(document).keypress((event) => {this.shortenWords(event.key)});

        $("#loadResults").click(() => {
            //this.showFewResults(this.resultCount + 5);
            
            this.resultCount = this.resultCount + 2;
            if(this.resultCount > this.allResults.length) {
                this.resultCount = this.allResults.length;
                $("#loadResult").hide();
            }
            this.showFewResults(this.resultCount);
            $("#loadResults").html("Laadi veel (" + this.resultCount + "/" + this.allResults.length + ")");
            $("#hideResults").html("Peida Tulemusi");
        })

        $("#hideResults").click(() => {

            this.resultCount = 0;
            if(this.resultCount > this.allResults.length) {
                this.resultCount = this.allResults.length;
                $("#loadResult").hide();
            }
            this.showFewResults(this.resultCount);
            $("#hideResults").html("Midagi peita");
            $("#loadResults").html("Laadi veel");

        })
    }

    generateWords() {
        for(let i = 0; i < this.wordsInGame; i++) {
            const wordLength = this.startingWordLength + i;
            const randomWord =  Math.round(Math.random() * this.words[wordLength].length);
            //console.log(i, randomWord);
            //console.log(this.typeWords);
            this.typeWords[i] = this.words[wordLength][randomWord];
        }
        
        this.selectWord();
        
    }

    drawWord() {
        $("#wordDiv").html(this.word);
    }

    selectWord() {
        this.word = this.typeWords[this.typedCount];
        this.typedCount++;
        this.drawWord();
        this.updateInfo();
        console.log(this.typeWords)
    }

    updateInfo() {
        $("info").html(this.typedCount + "/" + this.wordsInGame)
    }

    shortenWords(keyCode) {
        console.log(keyCode);

        if(keyCode != this.word.charAt(0)) {
            this.changeBackground("wrong-button", 150);
            
        }
        else if(this.word.length == 1 && keyCode == this.word.charAt(0) && this.typedCount == this.wordsInGame) {
            this.endGame();
            this.bonus = 0;
            console.log(this.typedCount, this.wordsInGame);
        }else if(this.word.length == 1 && keyCode == this.word.charAt(0)) {
            this.selectWord();
            this.changeBackground("right-word", 300);
            console.log(this.word);
        } else if(this.word.length > 0 && keyCode == this.word.charAt(0)) {
            this.changeBackground("right-button", 100);
            this.bonus = this.bonus + 0.1;
            this.word = this.word.slice(1);
            console.log(this.word);
        }
  

        this.drawWord();
    }

    changeBackground(color, time) {
        setTimeout(function(){
            $("#container").removeClass(color);
            }
        , time);
        $("#container").addClass(color);
            
        
    }

    endGame() {
        console.log("Mäng läbi");
        this.endTime = performance.now();
        
        $("#wordDiv").hide();
        $(".audioPlayer").play;
        //$(document.off(keypress));
        this.calculateShowScore();
    }

    calculateShowScore() {
        this.score = Math.round((this.endTime - this.startTime) / 1000 - this.bonus).toFixed(2);
        $("#score").html(this.score + " sec").show();
        this.saveResult();
    }

    saveResult() {
        let result = {
            name: this.name,
            score: this.score,
            words: this.wordsInGame
        }

        this.allResults.push(result);

        this.allResults.sort((a, b) => parseFloat(a.score) - parseFloat(b.score));

        console.warn(this.allResults);
        localStorage.setItem("typer", JSON.stringify(this.allResults));
        this.saveToFile();
        //this.showFewResults(this.resultCount);
        this.loadFromFile();
        this.showFewResults(this.resultCount);
    }

    showFewResults(count) {
        $("#results").html("");
        
        for(let i = 0; i < count; i++) {
            //$("#results").append("<div>" + this.allResults[i].name + " " + this.allResults[i].score + " (" + this.allResults[i].words + ")" + "</div>");
            $("#results").append(
                "<div class='readout'>" +
                "<div style='width:20vw'>" + this.allResults[i].name + "</div><div style='width:20vw'>"
                + this.allResults[i].score + "</div><div style='width:20vw'>"
                + this.allResults[i].words + "</div>" +
                "</div><hr/>" 
            );    
        }
    }

    showAllResults() {
        $("#results").html("");
        for(let i = 0; i < this.allResults.length; i++) {
            /*$("#results").append(
                "<div>" + this.allResults[i].name 
                + " " + this.allResults[i].score 
                + " (" + this.allResults[i].words 
                + ")" + "</div>"
            );    */

            
            $("#results").append(
                "<div class='readout'>" +
                "<div style='width:20vw'>" + this.allResults[i].name + "</div><div style='width:20vw'>"
                + this.allResults[i].score + "</div><div style='width:20vw'>"
                + this.allResults[i].words + "</div>" +
                "</div><hr/>" 
            );
            
        }
    }

    saveToFile() {
        $.post("server.php", {save: this.allResults}).done(console.log("salvestatud"));
            
    }
}

let typer = new Typer(playerName);