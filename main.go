package main

import (
	"context"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"time"

	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/kaepa3/RadioHub/lib/recpacket"
	"github.com/kaepa3/RadioHub/lib/scheduledb"
	"github.com/yyoshiki41/radigo"

	"github.com/go-co-op/gocron"
)

var s1 *gocron.Scheduler

func main() {

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

	//db
	col := scheduledb.Schedules{}
	schedule, err := col.GetAll()
	if err != nil {
		return
	}
	sche := getScheduler()
	for _, v := range schedule {
		RegistrationRecording(sche, v)
	}

	sche.StartAsync()
}
func RegistrationRecording(sche *gocron.Scheduler, v recpacket.RecordingRequest) {
	t := v.GetNextRecordingTime()
	log.Println(t)
	j, err := sche.Every(1).Week().StartAt(t).Do(func() { recordingTask(v.Channel, v.RecMinute) })
	if err == nil {
		log.Println(j)
	} else {
		log.Println(err)
	}
}

func recordingTask(ch string, minute string) {
	log.Println("start recording:" + ch + " sec:" + minute)
	if cmd, err := radigo.RecLiveCommandFactory(); err == nil {
		id := fmt.Sprintf("-id=%s", ch)
		time := fmt.Sprintf("-t=%s", minute)
		cmd.Run([]string{id, time})
	}
}

func getSchedule(c *gin.Context) {
	//db
	col := scheduledb.Schedules{}
	records, err := col.GetAll()
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
		if !json.CheckTimeBefore() {
			sche := getScheduler()
			RegistrationRecording(sche, json)
			col := scheduledb.Schedules{}
			if _, err := col.InsertOne(context.Background(), json); err != nil {
				log.Println(err)
			} else {
				log.Println("regist:" + json.GetNextRecordingTime().String())
			}
		} else {
			log.Println("past")

		}
	}
	getSchedule(c)
}
