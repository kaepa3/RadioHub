package main

import (
	"context"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"time"

	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/kaepa3/RadioHub/lib/recpacket"
	"github.com/yyoshiki41/radigo"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/go-co-op/gocron"
)

var collection *mongo.Collection
var s1 *gocron.Scheduler

func main() {

	//db
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

	//cron
	createSchedule()

	//server
	r := gin.Default()
	r.Use(static.Serve("/", static.LocalFile("frontend/build", false)))
	r.NoRoute(func(c *gin.Context) { c.File("frontend/build/index.html") })
	r.GET("/area", getArea)
	r.GET("/schedule", getSchedule)
	r.POST("/rec", recStart)
	r.Run()

}
func getScheduler() *gocron.Scheduler {
	if s1 != nil {
		return s1
	}
	s1 := gocron.NewScheduler(time.Local)
	return s1

}
func createSchedule() {

	schedule, err := getScheduleRecord()
	if err != nil {
		return
	}
	sche := getScheduler()
	for _, v := range schedule {
		t := v.GetNextRecordingTime()
		log.Println(t)
		j, err := sche.Every(1).Week().StartAt(t).Do(func() { recordingTask(v.Channel, v.RecMinute) })
		if err == nil {
			log.Println(j)
		} else {
			log.Println(err)
		}
	}

	log.Println("hoge")
	for _, v := range sche.Jobs() {
		log.Println(v.ScheduledAtTime())
		log.Println(v.ScheduledTime())
	}
	sche.StartAsync()
}
func recordingTask(ch string, minute string) {
	log.Println("start recording:" + ch + " sec:" + minute)
	if cmd, err := radigo.RecLiveCommandFactory(); err == nil {
		id := fmt.Sprintf("-id=%s", ch)
		time := fmt.Sprintf("-t=%s", minute)
		cmd.Run([]string{id, time})
	}
}

func getScheduleRecord() ([]recpacket.RecordingRequest, error) {

	cur, err := collection.Find(context.Background(), bson.D{})
	if err != nil {
		log.Fatalln(err)
		return make([]recpacket.RecordingRequest, 0), errors.New("asfd")
	}

	docs := make([]recpacket.RecordingRequest, 0, 20)
	for cur.Next(context.Background()) {
		var doc recpacket.RecordingRequest
		if err := cur.Decode(&doc); err != nil {
			log.Println(err)
		} else {
			docs = append(docs, doc)
		}
	}
	return docs, nil
}

func getSchedule(c *gin.Context) {
	records, err := getScheduleRecord()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	} else {
		c.JSON(http.StatusOK, records)
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
		recordingTask(json.Channel, json.RecMinute)
	} else {
		if json.CheckTimeBefore() {
			if _, err := collection.InsertOne(context.Background(), json); err != nil {
				log.Println(err)
			}
		}
	}
}
