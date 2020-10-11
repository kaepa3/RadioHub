package main

import (
	"context"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"

	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/yyoshiki41/radigo"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	"go.mongodb.org/mongo-driver/mongo/options"
)

var collection *mongo.Collection

func main() {

	client, err := mongo.NewClient(options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		log.Fatal(err)
		return
	}

	if err = client.Connect(context.Background()); err != nil {
		log.Fatal(err)
		return
	}
	defer client.Disconnect(context.Background())
	collection = client.Database("radiohub").Collection("schedule")

	r := gin.Default()
	r.Use(static.Serve("/", static.LocalFile("radiohub/build", false)))
	r.NoRoute(func(c *gin.Context) { c.File("radiohub/build/index.html") })
	r.GET("/area", getArea)
	r.GET("/schedule", getSchedule)
	r.POST("/rec", recStart)
	r.Run()

}

func getSchedule(c *gin.Context) {

	if cur, err := collection.Find(context.Background(), bson.D{}); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	} else {
		docs := make([]JsonRequest, 0, 20)
		for cur.Next(context.Background()) {
			var doc JsonRequest
			if err = cur.Decode(&doc); err != nil {
				log.Println(err)
			} else {
				docs = append(docs, doc)
			}
		}
		c.JSON(http.StatusOK, docs)
	}
}

func getArea(c *gin.Context) {
	url := "http://radiko.jp/v3/station/list/JP13.xml"
	resp, err := http.Get(url)
	if err != nil {
		fmt.Println(err)
	}
	defer resp.Body.Close()
	data, _ := ioutil.ReadAll(resp.Body)
	c.String(200, string(data))
}

type JsonRequest struct {
	Channel   string `json:"channel"`
	Date      string `json:"date"`
	StartTime string `json:"start"`
	IsNow     string `json:"is_now"`
	RecMinute string `json:"rec_minute"`
}

func recStart(c *gin.Context) {
	var json JsonRequest
	if err := c.ShouldBindJSON(&json); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	fmt.Println(json)
	if json.IsNow == "on" {
		if cmd, err := radigo.RecLiveCommandFactory(); err == nil {
			id := fmt.Sprintf("-id=%s", json.Channel)
			time := fmt.Sprintf("-t=%s", json.RecMinute)
			cmd.Run([]string{id, time})
		}
	} else {
		if _, err := collection.InsertOne(context.Background(), json); err != nil {
			log.Println(err)
		}
	}
}
