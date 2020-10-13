package RecordingRequest

import (
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

func (req RecordingRequest) GetRecordingTime() time.Time {
	recTime, _ := time.Parse("01/20/2020", req.Date)
	slice := strings.Split(req.StartTime, ":")
	hour, _ := strconv.Atoi(slice[0])
	minute, _ := strconv.Atoi(slice[0])

	return time.Date(recTime.Year(), recTime.Month(), recTime.Day(), hour, minute, 0, 0, time.Local)

}
