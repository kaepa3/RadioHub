package main

import (
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
)

func main() {

	r := gin.Default()
	r.Use(static.Serve("/", static.LocalFile("radiohub/build", false)))
	r.NoRoute(func(c *gin.Context) { c.File("radiohub/build/index.html") })
	r.GET("/area", getArea)
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
