package recpacket

import (
	"fmt"
	"strconv"
	"strings"
	"time"
)

type RecordingRequest struct {
	Channel   string `json:"channel"`
	Date      string `json:"date"`
	StartTime string `json:"start"`
	IsNow     string `json:"is_now"`
	RecMinute string `json:"rec_minute"`
}

const layout = "01/02/2006"

func (req RecordingRequest) GetRecordingTime() time.Time {
	recTime, err := time.Parse(layout, req.Date)
	if err != nil {
		fmt.Println(err)
	}
	slice := strings.Split(req.StartTime, ":")
	hour, _ := strconv.Atoi(slice[0])
	minute, _ := strconv.Atoi(slice[1])

	return time.Date(recTime.Year(), recTime.Month(), recTime.Day(), hour, minute, 0, 0, time.Local)

}
func CheckTimeBefore(req RecordingRequest) bool {
	date := req.GetRecordingTime()
	now := time.Now()
	return !date.After(now)
}
