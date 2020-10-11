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
	colection := client.Database("radiohub").Collection("schedules")
	cur, err := colection.Find(context.Background(), bson.D{})
	for cur.Next(context.Background()) {
		// To decode into a struct, use cursor.Decode()
		log.Println(cur)
	}

	r := gin.Default()
	r.Use(static.Serve("/", static.LocalFile("radiohub/build", false)))
	r.NoRoute(func(c *gin.Context) { c.File("radiohub/build/index.html") })
	r.GET("/area", getArea)
	r.POST("/rec", recStart)
	r.Run()

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
	Channel string `json:"channel"`
}

func recStart(c *gin.Context) {
	var json JsonRequest
	if err := c.ShouldBindJSON(&json); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if cmd, err := radigo.RecLiveCommandFactory(); err == nil {
		cmd.Run([]string{"-id=LFR", "-t=1"})

	}

	fmt.Println(json)
}
