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
func (req RecordingRequest) GetNextRecordingTime() time.Time {
	recTime := req.GetRecordingTime()

	bufferTime := recTime
	for {
		if CheckTimeBefore(bufferTime) {
			bufferTime = bufferTime.AddDate(0, 0, 7)
		} else {
			break
		}
	}
	return bufferTime
}
func (req RecordingRequest) CheckTimeBefore() bool {
	date := req.GetRecordingTime()
	return CheckTimeBefore(date)
}
func CheckTimeBefore(t time.Time) bool {
	now := time.Now()
	return !t.After(now)
}
