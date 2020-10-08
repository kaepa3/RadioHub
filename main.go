package main

import (
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/yyoshiki41/radigo"
)

func main() {

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
