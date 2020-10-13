package main

import (
	"context"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"

	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/kaepa3/RadioHub/lib/recpacket"
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
	r.Use(static.Serve("/", static.LocalFile("frontend/build", false)))
	r.NoRoute(func(c *gin.Context) { c.File("frontend/build/index.html") })
	r.GET("/area", getArea)
	r.GET("/schedule", getSchedule)
	r.POST("/rec", recStart)
	r.Run()

}

func getSchedule(c *gin.Context) {

	if cur, err := collection.Find(context.Background(), bson.D{}); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	} else {
		docs := make([]recpacket.RecordingRequest, 0, 20)
		for cur.Next(context.Background()) {
			var doc recpacket.RecordingRequest
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

func recStart(c *gin.Context) {
	var json recpacket.RecordingRequest
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
		if recpacket.CheckTimeBefore(json) {
			if _, err := collection.InsertOne(context.Background(), json); err != nil {
				log.Println(err)
			}
		}
	}
}
